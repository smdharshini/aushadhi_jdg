import { DISTRICTS, MEDICINES } from './masterData';
import { generateSyntheticData, SyntheticDataset } from './syntheticGenerator';
import {
  AuditLogEntry,
  Role,
  SimulationScenario,
  StockAlert,
  TransferOrder,
} from '../types';
import { calculateDaysOfCover, calculateStockoutProbability, classifyAlertSeverity } from '../math/metrics';
import { solveRedistribution } from '../math/redistribution';

const STORAGE_KEY_DATA = 'aushadhi_synthetic_data_v1';
const STORAGE_KEY_ALERTS = 'aushadhi_alerts_v1';
const STORAGE_KEY_TRANSFERS = 'aushadhi_transfers_v1';
const STORAGE_KEY_AUDIT = 'aushadhi_audit_v1';
const STORAGE_KEY_QUEUE = 'aushadhi_offline_queue_v1';

export interface OfflineEntrySubmission {
  id: string;
  phcId: string;
  timestamp: string;
  staffAttendance: {
    medicalOfficer: boolean;
    pharmacist: boolean;
    staffNurse: boolean;
    anm: boolean;
  };
  totalBeds: number;
  occupiedBeds: number;
  dailyFootfall: number;
  stockUpdates: { medicineId: string; currentQuantity: number }[];
}

export class DataStore {
  private static instance: DataStore;
  public dataset: SyntheticDataset;
  public alerts: StockAlert[] = [];
  public transferOrders: TransferOrder[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public offlineQueue: OfflineEntrySubmission[] = [];
  public activeScenario: SimulationScenario | null = null;

  private constructor() {
    this.dataset = this.loadOrGenerateDataset();
    this.alerts = this.loadOrGenerateAlerts();
    this.transferOrders = this.loadOrGenerateTransfers();
    this.auditLogs = this.loadAuditLogs();
    this.offlineQueue = this.loadOfflineQueue();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private loadOrGenerateDataset(): SyntheticDataset {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // parse failed, regenerate
        }
      }
    }
    const generated = generateSyntheticData(42);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(generated));
      } catch {
        // quota exceeded or storage disabled
      }
    }
    return generated;
  }

  private loadOrGenerateAlerts(): StockAlert[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    const alerts = this.computeAlerts();
    this.saveAlerts(alerts);
    return alerts;
  }

  private loadOrGenerateTransfers(): TransferOrder[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSFERS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    const transfers = this.computeTransfers();
    this.saveTransfers(transfers);
    return transfers;
  }

  private loadAuditLogs(): AuditLogEntry[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'LOG-001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor: 'Dr. S. Ramanathan',
        role: 'district_officer',
        action: 'System Seed Initialized',
        targetEntity: 'National PHC Grid',
        details: 'Initial inventory baselines and risk thresholds configured for 120 PHCs.',
      },
    ];
  }

  private loadOfflineQueue(): OfflineEntrySubmission[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY_QUEUE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  }

  public saveAlerts(alerts: StockAlert[]): void {
    this.alerts = alerts;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
      } catch {}
    }
  }

  public saveTransfers(transfers: TransferOrder[]): void {
    this.transferOrders = transfers;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(transfers));
      } catch {}
    }
  }

  public addAuditLog(actor: string, role: Role, action: string, targetEntity: string, details: string): void {
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      targetEntity,
      details,
    };
    this.auditLogs.unshift(entry);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs.slice(0, 100)));
      } catch {}
    }
  }

  public computeAlerts(emergencyDistrictMultiplier: Record<string, number> = {}): StockAlert[] {
    const alerts: StockAlert[] = [];
    let alertCount = 1;

    for (const d of DISTRICTS) {
      for (const med of MEDICINES) {
        const dLots = this.dataset.stockLots.filter(
          (l) => l.districtId === d.id && l.medicineId === med.id
        );
        const totalStock = dLots.reduce((acc, l) => acc + l.quantity, 0);

        const mult = emergencyDistrictMultiplier[d.id] || 1.0;
        const dailyDemand = med.dailyConsumptionBaseline * 5 * mult;

        const doc = calculateDaysOfCover(totalStock, dailyDemand);
        const stockoutProb = calculateStockoutProbability(totalStock, dailyDemand, med.leadTimeDays);

        const severity = classifyAlertSeverity(doc, stockoutProb);

        if (severity) {
          let reason = `${doc.toFixed(1)} days of cover remaining. Current stock: ${totalStock} units.`;
          if (mult > 1.0) {
            reason = `Emergency demand surge (${mult}x multiplier). ${doc.toFixed(1)} days cover remaining.`;
          } else if (d.id === 'TN_MDU' && (med.id === 'med-01' || med.id === 'med-02')) {
            reason = `Seasonal Dengue and fever case elevation in Madurai district. Only ${doc.toFixed(1)} days of cover remaining.`;
          }

          alerts.push({
            id: `ALT-${d.id}-${med.id}-${alertCount++}`,
            severity,
            medicineId: med.id,
            medicineName: med.name,
            districtId: d.id,
            districtName: d.name,
            stateId: d.stateId,
            currentStock: totalStock,
            daysOfCover: doc,
            stockoutProbabilityLeadTime: stockoutProb,
            reason,
            status: 'active',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return alerts.sort((a, b) => {
      const order = { critical: 0, warning: 1, watch: 2 };
      return order[a.severity] - order[b.severity];
    });
  }

  public computeTransfers(emergencyDistrictMultiplier: Record<string, number> = {}): TransferOrder[] {
    const orders: TransferOrder[] = [];
    const demandMap: Record<string, number> = {};

    for (const d of DISTRICTS) {
      demandMap[d.id] = 500; // average district baseline
    }

    for (const med of MEDICINES) {
      const medDemand: Record<string, number> = {};
      for (const d of DISTRICTS) {
        medDemand[d.id] = med.dailyConsumptionBaseline * 5;
      }
      const medOrders = solveRedistribution(
        med,
        DISTRICTS,
        this.dataset.phcs,
        this.dataset.stockLots,
        medDemand,
        emergencyDistrictMultiplier
      );
      orders.push(...medOrders);
    }

    return orders;
  }

  public queueOfflineSubmission(sub: OfflineEntrySubmission): void {
    this.offlineQueue.push(sub);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this.offlineQueue));
      } catch {}
    }
  }

  public syncOfflineQueue(): number {
    const count = this.offlineQueue.length;
    if (count === 0) return 0;

    for (const sub of this.offlineQueue) {
      // Apply updates to the in-memory dataset
      const phc = this.dataset.phcs.find((p) => p.id === sub.phcId);
      if (phc) {
        phc.staff = sub.staffAttendance;
        phc.occupiedBeds = sub.occupiedBeds;
        phc.totalBeds = sub.totalBeds;
        phc.dailyFootfall = sub.dailyFootfall;
        phc.lastReportedTime = new Date().toISOString();
      }

      for (const update of sub.stockUpdates) {
        const lot = this.dataset.stockLots.find(
          (l) => l.phcId === sub.phcId && l.medicineId === update.medicineId
        );
        if (lot) {
          lot.quantity = update.currentQuantity;
        }
      }
    }

    this.offlineQueue = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(this.dataset));
      } catch (err) {
        console.warn('LocalStorage quota exceeded or unavailable:', err);
      }
    }

    // Recompute alerts and transfers
    this.alerts = this.computeAlerts();
    this.transferOrders = this.computeTransfers();
    this.saveAlerts(this.alerts);
    this.saveTransfers(this.transferOrders);

    return count;
  }

  public applyScenario(scenario: SimulationScenario | null): void {
    this.activeScenario = scenario;
    const multipliers: Record<string, number> = {};
    if (scenario) {
      multipliers[scenario.districtId] = scenario.demandMultiplier;
    }
    this.alerts = this.computeAlerts(multipliers);
    this.transferOrders = this.computeTransfers(multipliers);
    this.saveAlerts(this.alerts);
    this.saveTransfers(this.transferOrders);
  }

  public resetToDefault(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY_DATA);
      localStorage.removeItem(STORAGE_KEY_ALERTS);
      localStorage.removeItem(STORAGE_KEY_TRANSFERS);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
      localStorage.removeItem(STORAGE_KEY_QUEUE);
    }
    this.dataset = generateSyntheticData(42);
    this.activeScenario = null;
    this.alerts = this.computeAlerts();
    this.transferOrders = this.computeTransfers();
    this.auditLogs = [];
    this.offlineQueue = [];
    this.saveAlerts(this.alerts);
    this.saveTransfers(this.transferOrders);
  }
}
