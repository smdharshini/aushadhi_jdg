import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { DataStore, OfflineEntrySubmission } from '../data/seedStore';
import { DISTRICTS, MEDICINES, ROLE_PROFILES, STATES } from '../data/masterData';
import {
  AuditLogEntry,
  District,
  Medicine,
  PHC,
  Role,
  SimulationScenario,
  StateId,
  StateInfo,
  StockAlert,
  TransferOrder,
  UserProfile,
} from '../types';
import { Language, TRANSLATIONS, TranslationKey } from '../i18n/translations';

interface AppContextType {
  role: Role;
  user: UserProfile;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isOnline: boolean;
  pendingSyncCount: number;
  syncOfflineQueue: () => void;
  submitPhcEntry: (sub: OfflineEntrySubmission) => void;

  // Data & Filtering
  states: Record<StateId, StateInfo>;
  districts: District[];
  medicines: Medicine[];
  phcs: PHC[];
  alerts: StockAlert[];
  transfers: TransferOrder[];
  auditLogs: AuditLogEntry[];
  activeScenario: SimulationScenario | null;

  selectedStateId: StateId | 'ALL';
  setSelectedStateId: (id: StateId | 'ALL') => void;
  selectedDistrictId: string | 'ALL';
  setSelectedDistrictId: (id: string | 'ALL') => void;
  selectedMedicineId: string | 'ALL';
  setSelectedMedicineId: (id: string | 'ALL') => void;

  // Actions
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  approveTransfer: (transferId: string) => void;
  applyScenario: (scenario: SimulationScenario | null) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useMemo(() => DataStore.getInstance(), []);

  const [role, setRoleState] = useState<Role>('district_officer');
  const [language, setLanguage] = useState<Language>('en');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(store.offlineQueue.length);

  // Filters
  const [selectedStateId, setSelectedStateId] = useState<StateId | 'ALL'>('TN');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | 'ALL'>('TN_MDU');
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | 'ALL'>('ALL');

  // React state mirroring DataStore
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick((prev) => prev + 1);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (store.offlineQueue.length > 0) {
        store.syncOfflineQueue();
        setPendingSyncCount(0);
        forceUpdate();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [store]);

  const user = ROLE_PROFILES[role];

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    const profile = ROLE_PROFILES[newRole];
    if (profile.assignedStateId) {
      setSelectedStateId(profile.assignedStateId);
    } else {
      setSelectedStateId('ALL');
    }
    if (profile.assignedDistrictId) {
      setSelectedDistrictId(profile.assignedDistrictId);
    } else {
      setSelectedDistrictId('ALL');
    }
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
  };

  const submitPhcEntry = (sub: OfflineEntrySubmission) => {
    store.queueOfflineSubmission(sub);
    setPendingSyncCount(store.offlineQueue.length);
    if (isOnline) {
      store.syncOfflineQueue();
      setPendingSyncCount(0);
    }
    store.addAuditLog(
      user.name,
      user.role,
      'Submitted Daily PHC Return',
      sub.phcId,
      `Updated attendance, bed occupancy (${sub.occupiedBeds}/${sub.totalBeds}), and ${sub.stockUpdates.length} medicine stock levels.`
    );
    forceUpdate();
  };

  const syncOfflineQueue = () => {
    const synced = store.syncOfflineQueue();
    setPendingSyncCount(0);
    if (synced > 0) {
      store.addAuditLog(
        user.name,
        user.role,
        'Offline Synchronization',
        'System Queue',
        `Synced ${synced} queued offline submissions to local database.`
      );
    }
    forceUpdate();
  };

  const acknowledgeAlert = (alertId: string) => {
    const alert = store.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = user.name;
      store.saveAlerts([...store.alerts]);
      store.addAuditLog(
        user.name,
        user.role,
        'Acknowledged Early Warning Alert',
        alert.id,
        `${alert.medicineName} stock risk in ${alert.districtName} acknowledged.`
      );
      forceUpdate();
    }
  };

  const resolveAlert = (alertId: string) => {
    const alert = store.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedBy = user.name;
      store.saveAlerts([...store.alerts]);
      store.addAuditLog(
        user.name,
        user.role,
        'Resolved Early Warning Alert',
        alert.id,
        `${alert.medicineName} stock risk marked resolved after mitigation action.`
      );
      forceUpdate();
    }
  };

  const approveTransfer = (transferId: string) => {
    const order = store.transferOrders.find((t) => t.id === transferId);
    if (order) {
      order.status = 'approved';
      order.approvedBy = user.name;
      order.approvedAt = new Date().toISOString();
      store.saveTransfers([...store.transferOrders]);
      store.addAuditLog(
        user.name,
        user.role,
        'Approved Redistribution Order',
        order.id,
        `Approved dispatch of ${order.quantity} units of ${order.medicineName} from ${order.sourceDistrictName} to ${order.destDistrictName}.`
      );
      forceUpdate();
    }
  };

  const applyScenario = (scenario: SimulationScenario | null) => {
    store.applyScenario(scenario);
    if (scenario) {
      store.addAuditLog(
        user.name,
        user.role,
        'Triggered Emergency Simulation',
        scenario.id,
        `Applied ${scenario.name} in ${scenario.districtId} with ${scenario.demandMultiplier}x multiplier.`
      );
    } else {
      store.addAuditLog(
        user.name,
        user.role,
        'Deactivated Emergency Simulation',
        'Simulation Sandbox',
        'Returned system baselines to standard operating mode.'
      );
    }
    forceUpdate();
  };

  const resetAllData = () => {
    store.resetToDefault();
    setPendingSyncCount(0);
    forceUpdate();
  };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        setRole,
        language,
        setLanguage,
        t,
        isOnline,
        pendingSyncCount,
        syncOfflineQueue,
        submitPhcEntry,
        states: STATES,
        districts: DISTRICTS,
        medicines: MEDICINES,
        phcs: store.dataset.phcs,
        alerts: store.alerts,
        transfers: store.transferOrders,
        auditLogs: store.auditLogs,
        activeScenario: store.activeScenario,
        selectedStateId,
        setSelectedStateId,
        selectedDistrictId,
        setSelectedDistrictId,
        selectedMedicineId,
        setSelectedMedicineId,
        acknowledgeAlert,
        resolveAlert,
        approveTransfer,
        applyScenario,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
