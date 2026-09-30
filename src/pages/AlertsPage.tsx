import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/FilterBar';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { AlertSeverity } from '../types';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    selectedStateId,
    selectedDistrictId,
    selectedMedicineId,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'active' | 'acknowledged' | 'resolved' | 'ALL'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedStateId !== 'ALL' && a.stateId !== selectedStateId) return false;
    if (selectedDistrictId !== 'ALL' && a.districtId !== selectedDistrictId) return false;
    if (selectedMedicineId !== 'ALL' && a.medicineId !== selectedMedicineId) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length;
  const watchCount = alerts.filter((a) => a.severity === 'watch' && a.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
            <span>DAYS OF COVER MONITORING</span>
            <span>&bull;</span>
            <span>LEAD-TIME STOCK-OUT PROBABILITY</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Early Warning & Stock-Out Alert Engine
          </h1>
        </div>

        {/* Severity Count Pills */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-critical-subtle border border-critical-border text-critical font-bold">
            {criticalCount} Critical
          </span>
          <span className="px-2.5 py-1 rounded bg-warning-subtle border border-warning-border text-warning font-bold">
            {warningCount} Warning
          </span>
          <span className="px-2.5 py-1 rounded bg-bg-muted border border-line text-ink-muted font-medium">
            {watchCount} Watch
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Sub-filters for Severity and Status */}
      <div className="flex flex-wrap items-center gap-3 bg-bg-paper border border-line rounded p-3 text-xs font-mono">
        <span className="text-ink-muted">Severity:</span>
        {(['ALL', 'critical', 'warning', 'watch'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-2.5 py-1 rounded capitalize transition-colors ${
              severityFilter === sev
                ? 'bg-teal text-bg-paper font-semibold'
                : 'bg-bg text-ink hover:bg-bg-muted border border-line'
            }`}
          >
            {sev}
          </button>
        ))}

        <span className="text-ink-muted ml-4">Status:</span>
        {(['ALL', 'active', 'acknowledged', 'resolved'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1 rounded capitalize transition-colors ${
              statusFilter === st
                ? 'bg-teal text-bg-paper font-semibold'
                : 'bg-bg text-ink hover:bg-bg-muted border border-line'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded border text-xs space-y-3 transition-all ${
              alert.severity === 'critical'
                ? 'border-critical-border bg-critical-subtle/30'
                : alert.severity === 'warning'
                ? 'border-warning-border bg-warning-subtle/30'
                : 'border-line bg-bg-paper'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 font-mono">
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    alert.severity === 'critical'
                      ? 'bg-critical text-bg-paper'
                      : alert.severity === 'warning'
                      ? 'bg-warning text-bg-paper'
                      : 'bg-bg-muted text-ink-muted border border-line'
                  }`}
                >
                  {alert.severity === 'critical' && <ShieldAlert className="w-3 h-3" />}
                  {alert.severity === 'warning' && <AlertTriangle className="w-3 h-3" />}
                  {alert.severity === 'watch' && <Clock className="w-3 h-3" />}
                  <span>{alert.severity}</span>
                </span>
                <span className="font-serif font-bold text-base text-ink">
                  {alert.medicineName}
                </span>
                <span className="text-ink-muted">in {alert.districtName} ({alert.stateId})</span>
              </div>

              <div className="flex items-center space-x-3 font-mono text-[11px] text-ink-muted">
                <span>Alert ID: {alert.id}</span>
                <span>&bull;</span>
                <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Rationale & Statistical Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 rounded bg-bg-paper border border-line font-mono text-xs">
              <div>
                <span className="text-[10px] text-ink-muted uppercase">DAYS OF COVER</span>
                <div
                  className={`font-bold text-sm ${
                    alert.daysOfCover < 7
                      ? 'text-critical'
                      : alert.daysOfCover < 14
                      ? 'text-warning'
                      : 'text-ink'
                  }`}
                >
                  {alert.daysOfCover} days remaining
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink-muted uppercase">CURRENT DISTRICT STOCK</span>
                <div className="font-bold text-sm text-ink">
                  {alert.currentStock.toLocaleString()} units
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink-muted uppercase">STOCK-OUT PROBABILITY (14D)</span>
                <div className="font-bold text-sm text-critical">
                  {Math.round(alert.stockoutProbabilityLeadTime * 100)}% within lead time
                </div>
              </div>

              <div>
                <span className="text-[10px] text-ink-muted uppercase">STATUS</span>
                <div className="font-bold text-sm capitalize text-teal">
                  {alert.status}
                </div>
              </div>
            </div>

            <p className="text-ink text-xs leading-relaxed font-sans">
              <strong>Epidemiological Rationale: </strong>
              {alert.reason}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-line text-xs gap-2">
              <div className="text-ink-muted text-[11px] font-mono">
                {alert.acknowledgedBy && (
                  <span>Acknowledged by {alert.acknowledgedBy} &bull; </span>
                )}
                {alert.resolvedBy && <span>Resolved by {alert.resolvedBy}</span>}
              </div>

              <div className="flex items-center space-x-2">
                {alert.status === 'active' && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded bg-bg hover:bg-bg-muted border border-line text-ink font-medium transition-colors"
                  >
                    Acknowledge Alert
                  </button>
                )}

                {alert.status !== 'resolved' && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded bg-teal hover:bg-teal-hover text-bg-paper font-semibold transition-colors shadow-xs"
                  >
                    Mark Stock Resolved
                  </button>
                )}

                {alert.status === 'resolved' && (
                  <span className="flex items-center space-x-1 text-success font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolution logged in audit trail</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-bg-paper border border-line rounded p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
            <h3 className="font-serif font-bold text-base text-ink">
              No matching alerts
            </h3>
            <p className="text-xs text-ink-muted">
              All facilities currently maintain inventory above configured risk thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
