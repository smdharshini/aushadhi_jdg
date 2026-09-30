import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bed,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  Send,
  UserCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const PhcEntryPage: React.FC = () => {
  const {
    user,
    phcs,
    medicines,
    isOnline,
    pendingSyncCount,
    submitPhcEntry,
    syncOfflineQueue,
  } = useApp();

  // Selected PHC for entry
  const defaultPhcId = user.assignedPhcId || phcs[0]?.id || 'PHC_TN_MDU_1';
  const [selectedPhcId, setSelectedPhcId] = useState(defaultPhcId);

  const currentPhc = phcs.find((p) => p.id === selectedPhcId) || phcs[0];

  // Form State
  const [medicalOfficer, setMedicalOfficer] = useState(currentPhc.staff.medicalOfficer);
  const [pharmacist, setPharmacist] = useState(currentPhc.staff.pharmacist);
  const [staffNurse, setStaffNurse] = useState(currentPhc.staff.staffNurse);
  const [anm, setAnm] = useState(currentPhc.staff.anm);

  const [totalBeds, setTotalBeds] = useState(currentPhc.totalBeds);
  const [occupiedBeds, setOccupiedBeds] = useState(currentPhc.occupiedBeds);
  const [dailyFootfall, setDailyFootfall] = useState(currentPhc.dailyFootfall);

  // Key Medicines stock counts for quick entry
  const [stockCounts, setStockCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    medicines.forEach((m) => {
      initial[m.id] = m.dailyConsumptionBaseline * 14; // default ~14 days baseline
    });
    return initial;
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStockChange = (medId: string, delta: number) => {
    setStockCounts((prev) => ({
      ...prev,
      [medId]: Math.max(0, (prev[medId] || 0) + delta),
    }));
  };

  const handleStockDirectInput = (medId: string, val: string) => {
    const num = parseInt(val, 10);
    setStockCounts((prev) => ({
      ...prev,
      [medId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Validation against absurd values
    if (occupiedBeds > totalBeds) {
      setValidationError(`Occupied beds (${occupiedBeds}) cannot exceed total capacity (${totalBeds}).`);
      return;
    }
    if (dailyFootfall < 0 || dailyFootfall > 3000) {
      setValidationError('Daily footfall must be between 0 and 3,000 patients.');
      return;
    }

    setIsSubmitting(true);

    const submission = {
      id: `SUB-${Date.now()}`,
      phcId: selectedPhcId,
      timestamp: new Date().toISOString(),
      staffAttendance: {
        medicalOfficer,
        pharmacist,
        staffNurse,
        anm,
      },
      totalBeds,
      occupiedBeds,
      dailyFootfall,
      stockUpdates: Object.entries(stockCounts).map(([medicineId, currentQuantity]) => ({
        medicineId,
        currentQuantity,
      })),
    };

    submitPhcEntry(submission);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(
        isOnline
          ? 'Daily return submitted and verified into live database.'
          : 'Return saved locally into offline mutation queue. Will auto-sync when connection restores.'
      );
    }, 200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
              <span className="uppercase">MOBILE-FIRST ENTRY</span>
              <span>&bull;</span>
              <span>30-SECOND WORKFLOW</span>
            </div>
            <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
              PHC Daily Stock & Attendance Return
            </h1>
          </div>

          {/* Sync indicator pill */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            {isOnline ? (
              <span className="flex items-center space-x-1 text-success px-2 py-1 rounded bg-success-subtle border border-success-border">
                <Wifi className="w-3.5 h-3.5" />
                <span>Online (Direct Sync)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-warning px-2 py-1 rounded bg-warning-subtle border border-warning-border">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline ({pendingSyncCount} queued)</span>
              </span>
            )}

            {pendingSyncCount > 0 && isOnline && (
              <button
                onClick={syncOfflineQueue}
                className="px-2 py-1 rounded bg-teal text-bg-paper text-xs font-mono font-medium hover:bg-teal-hover transition-colors"
              >
                Sync Now
              </button>
            )}
          </div>
        </div>

        {/* PHC Selector */}
        <div className="flex items-center space-x-3 text-xs">
          <label htmlFor="phc-select" className="text-ink-muted font-mono font-medium">
            Facility:
          </label>
          <select
            id="phc-select"
            value={selectedPhcId}
            onChange={(e) => setSelectedPhcId(e.target.value)}
            className="border border-line rounded px-2.5 py-1 bg-bg focus:border-teal focus:outline-hidden font-medium text-ink"
          >
            {phcs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.subDistrict}, {p.stateId})
              </option>
            ))}
          </select>
          <span className="text-ink-muted font-mono text-[11px] hidden sm:inline">
            Reporter: {user.name} ({user.title})
          </span>
        </div>
      </div>

      {/* Validation or Success Alerts */}
      {validationError && (
        <div className="p-3 rounded bg-critical-subtle border border-critical-border text-critical text-xs font-medium">
          {validationError}
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded bg-success-subtle border border-success-border text-success text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Staff Attendance (Big Tap Toggles) */}
        <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
          <div className="flex items-center space-x-2 text-ink">
            <UserCheck className="w-4 h-4 text-teal" />
            <h2 className="font-serif font-bold text-base">
              1. Staff Attendance on Duty Today
            </h2>
          </div>
          <p className="text-xs text-ink-muted">
            Tap each role to toggle between Present and Absent.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Medical Officer', state: medicalOfficer, setter: setMedicalOfficer },
              { label: 'Pharmacist', state: pharmacist, setter: setPharmacist },
              { label: 'Staff Nurse', state: staffNurse, setter: setStaffNurse },
              { label: 'ANM Worker', state: anm, setter: setAnm },
            ].map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => item.setter(!item.state)}
                className={`p-3 rounded border text-left transition-all ${
                  item.state
                    ? 'border-success bg-success-subtle/50 text-ink'
                    : 'border-critical-border bg-critical-subtle/40 text-critical'
                }`}
              >
                <div className="text-[11px] text-ink-muted font-medium">
                  {item.label}
                </div>
                <div className="text-sm font-mono font-bold mt-1">
                  {item.state ? 'PRESENT' : 'ABSENT'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Bed Census & Footfall */}
        <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
          <div className="flex items-center space-x-2 text-ink">
            <Bed className="w-4 h-4 text-teal" />
            <h2 className="font-serif font-bold text-base">
              2. Bed Census & Daily Footfall
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-ink-muted">
                Total Beds
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={totalBeds}
                onChange={(e) => setTotalBeds(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-line rounded p-2.5 bg-bg font-mono text-sm focus:border-teal focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-ink-muted">
                Occupied Beds
              </label>
              <input
                type="number"
                min="0"
                max={totalBeds}
                value={occupiedBeds}
                onChange={(e) => setOccupiedBeds(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-line rounded p-2.5 bg-bg font-mono text-sm focus:border-teal focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-ink-muted">
                Daily Outpatient Footfall
              </label>
              <input
                type="number"
                min="0"
                max="3000"
                value={dailyFootfall}
                onChange={(e) => setDailyFootfall(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-line rounded p-2.5 bg-bg font-mono text-sm focus:border-teal focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Essential Medicine Stock Counts */}
        <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-ink">
              <FileCheck className="w-4 h-4 text-teal" />
              <h2 className="font-serif font-bold text-base">
                3. Physical Stock Counts (NLEM Medicines)
              </h2>
            </div>
            <span className="text-xs font-mono text-ink-muted">
              Use +/- buttons or type directly
            </span>
          </div>

          <div className="space-y-3">
            {medicines.map((m) => {
              const currentVal = stockCounts[m.id] ?? 0;
              const daysCover = (currentVal / m.dailyConsumptionBaseline).toFixed(1);

              return (
                <div
                  key={m.id}
                  className="p-3 rounded border border-line bg-bg-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-ink font-sans text-sm">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-ink-muted font-mono">
                      {m.strength} &bull; {m.form} &bull; Baseline: {m.dailyConsumptionBaseline}/day
                    </div>
                    <div className="text-[11px] font-mono">
                      Estimated Cover:{' '}
                      <span
                        className={
                          Number(daysCover) < 7
                            ? 'text-critical font-bold'
                            : Number(daysCover) < 14
                            ? 'text-warning font-bold'
                            : 'text-success'
                        }
                      >
                        {daysCover} days
                      </span>
                    </div>
                  </div>

                  {/* Increment/Decrement Buttons & Direct Number Input */}
                  <div className="flex items-center space-x-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => handleStockChange(m.id, -50)}
                      className="px-2.5 py-1.5 rounded bg-bg border border-line hover:border-ink-muted text-ink font-bold"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(m.id, -10)}
                      className="px-2.5 py-1.5 rounded bg-bg border border-line hover:border-ink-muted text-ink font-bold"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={currentVal}
                      onChange={(e) => handleStockDirectInput(m.id, e.target.value)}
                      className="w-20 border border-line rounded py-1.5 px-2 text-center bg-bg font-mono font-bold focus:border-teal focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleStockChange(m.id, 10)}
                      className="px-2.5 py-1.5 rounded bg-bg border border-line hover:border-ink-muted text-ink font-bold"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(m.id, 50)}
                      className="px-2.5 py-1.5 rounded bg-bg border border-line hover:border-ink-muted text-ink font-bold"
                    >
                      +50
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submission Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-teal hover:bg-teal-hover disabled:bg-teal/70 text-bg-paper py-3 rounded text-sm font-semibold transition-colors shadow-xs"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {isOnline ? 'Submit Daily Return (Direct Sync)' : 'Save to Offline Queue'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
