import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/FilterBar';
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Bed,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    t,
    user,
    phcs,
    alerts,
    transfers,
    districts,
    selectedStateId,
    selectedDistrictId,
    selectedMedicineId,
    acknowledgeAlert,
    approveTransfer,
  } = useApp();

  // Filter PHCs by selected geography
  const filteredPhcs = phcs.filter((p) => {
    if (selectedStateId !== 'ALL' && p.stateId !== selectedStateId) return false;
    if (selectedDistrictId !== 'ALL' && p.districtId !== selectedDistrictId) return false;
    return true;
  });

  // Filter Alerts by selected geography and medicine
  const filteredAlerts = alerts.filter((a) => {
    if (selectedStateId !== 'ALL' && a.stateId !== selectedStateId) return false;
    if (selectedDistrictId !== 'ALL' && a.districtId !== selectedDistrictId) return false;
    if (selectedMedicineId !== 'ALL' && a.medicineId !== selectedMedicineId) return false;
    return true;
  });

  // Key Realtime Metrics
  const totalBeds = filteredPhcs.reduce((acc, p) => acc + p.totalBeds, 0);
  const occupiedBeds = filteredPhcs.reduce((acc, p) => acc + p.occupiedBeds, 0);
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  let totalStaffSlots = 0;
  let presentStaffSlots = 0;
  filteredPhcs.forEach((p) => {
    totalStaffSlots += 4;
    if (p.staff.medicalOfficer) presentStaffSlots++;
    if (p.staff.pharmacist) presentStaffSlots++;
    if (p.staff.staffNurse) presentStaffSlots++;
    if (p.staff.anm) presentStaffSlots++;
  });
  const staffPresentPct = totalStaffSlots > 0 ? Math.round((presentStaffSlots / totalStaffSlots) * 100) : 0;

  const criticalMedicinesCount = filteredAlerts.filter(
    (a) => a.severity === 'critical' && a.status === 'active'
  ).length;

  const pendingTransfers = transfers.filter((t) => {
    if (selectedStateId !== 'ALL' && t.stateId !== selectedStateId && t.destStateId !== selectedStateId)
      return false;
    return t.status === 'pending';
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Role Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
            <span className="uppercase">{user.role.replace('_', ' ')} VIEW</span>
            <span>&bull;</span>
            <span>{user.location}</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Operations Command Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            to="/app/map"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg hover:bg-bg-muted border border-line text-ink transition-colors"
          >
            <span>Network Map View</span>
            <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
          </Link>
          <Link
            to="/entry"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-teal hover:bg-teal-hover text-bg-paper font-medium transition-colors"
          >
            <span>Submit PHC Return</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Realtime KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Reporting PHCs */}
        <div className="bg-bg-paper border border-line rounded p-4">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-mono">PHCS REPORTING TODAY</span>
            <Users className="w-4 h-4 text-teal" />
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            {filteredPhcs.length}{' '}
            <span className="text-xs font-sans font-normal text-success">
              (100% active)
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">
            Aggregated facility census
          </p>
        </div>

        {/* Tile 2: Medicines Below 14 Days Cover */}
        <div className="bg-bg-paper border border-line rounded p-4">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-mono">{t('medicinesAtRisk')}</span>
            <AlertTriangle className="w-4 h-4 text-critical" />
          </div>
          <div className="text-2xl font-mono font-bold text-critical">
            {criticalMedicinesCount}{' '}
            <span className="text-xs font-sans font-normal text-ink-muted">
              alerts active
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">
            Paracetamol, ORS stock depletion risk
          </p>
        </div>

        {/* Tile 3: Bed Occupancy Rate */}
        <div className="bg-bg-paper border border-line rounded p-4">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-mono">{t('bedOccupancy')}</span>
            <Bed className="w-4 h-4 text-teal" />
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            {bedOccupancyRate}%{' '}
            <span className="text-xs font-sans font-normal text-ink-muted">
              ({occupiedBeds}/{totalBeds} beds)
            </span>
          </div>
          <div className="w-full bg-bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                bedOccupancyRate > 85 ? 'bg-critical' : 'bg-teal'
              }`}
              style={{ width: `${Math.min(100, bedOccupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Tile 4: Staff Attendance */}
        <div className="bg-bg-paper border border-line rounded p-4">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="font-mono">{t('staffAttendance')}</span>
            <ShieldCheck className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            {staffPresentPct}%{' '}
            <span className="text-xs font-sans font-normal text-success">
              ({presentStaffSlots}/{totalStaffSlots} roster)
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1">
            MO, Pharmacist, Nurse, ANM
          </p>
        </div>
      </div>

      {/* Main Grid: Priority Alerts & Redistribution Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early Warning Feed */}
        <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-critical" />
              <h2 className="font-serif font-bold text-base text-ink">
                Priority Early Warnings ({filteredAlerts.length})
              </h2>
            </div>
            <Link
              to="/app/alerts"
              className="text-xs text-teal hover:underline font-medium"
            >
              View All Alerts &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {filteredAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded border text-xs space-y-2 ${
                  alert.severity === 'critical'
                    ? 'border-critical-border bg-critical-subtle/50'
                    : 'border-warning-border bg-warning-subtle/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                        alert.severity === 'critical'
                          ? 'bg-critical text-bg-paper'
                          : 'bg-warning text-bg-paper'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-semibold text-ink">
                      {alert.medicineName}
                    </span>
                    <span className="text-ink-muted">in {alert.districtName}</span>
                  </div>
                  <span className="font-mono text-ink-faint text-[10px]">
                    {alert.daysOfCover}d cover
                  </span>
                </div>

                <p className="text-ink text-xs leading-relaxed">{alert.reason}</p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="font-mono text-ink-muted">
                    Stock-out Risk: {Math.round(alert.stockoutProbabilityLeadTime * 100)}%
                  </div>
                  {alert.status === 'active' ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2 py-0.5 rounded bg-bg border border-line hover:border-ink-muted text-ink font-medium transition-colors"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-teal font-medium flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span className="capitalize">{alert.status}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8 text-ink-muted text-xs">
                No active stock alerts for selected geography.
              </div>
            )}
          </div>
        </div>

        {/* Recommended Transfers Feed */}
        <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-teal" />
              <h2 className="font-serif font-bold text-base text-ink">
                Automated Redistribution Orders ({pendingTransfers.length})
              </h2>
            </div>
            <Link
              to="/app/transfers"
              className="text-xs text-teal hover:underline font-medium"
            >
              Order Manager &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTransfers.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded border border-line bg-bg-subtle text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-teal">
                    {order.id}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">
                    Batch: {order.batchNumber} (Exp: {order.lotExpiryDate})
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono text-ink">
                  <div>
                    <span className="text-ink-muted">Donor: </span>
                    <span className="font-semibold">{order.sourceDistrictName}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-teal" />
                  <div>
                    <span className="text-ink-muted">Recipient: </span>
                    <span className="font-semibold text-critical">{order.destDistrictName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-line text-[11px]">
                  <div className="space-x-3 text-ink-muted font-mono">
                    <span>{order.quantity} units {order.medicineName}</span>
                    <span>&bull;</span>
                    <span>{order.roadDistanceKm} km ({order.transitHours}h)</span>
                  </div>

                  <button
                    onClick={() => approveTransfer(order.id)}
                    className="px-2.5 py-1 rounded bg-teal hover:bg-teal-hover text-bg-paper font-medium transition-colors"
                  >
                    Approve Order
                  </button>
                </div>
              </div>
            ))}

            {pendingTransfers.length === 0 && (
              <div className="text-center py-8 text-ink-muted text-xs">
                All redistribution orders approved or no active stock deficits.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* District Operations Inventory Matrix */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-ink">
            District Inventory & Facility Cover Status
          </h2>
          <span className="text-xs font-mono text-ink-muted">
            Aggregated by District
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-line">
            <thead className="bg-bg-muted font-mono text-ink-muted text-[11px] uppercase">
              <tr>
                <th className="p-2.5 border-b border-line">District</th>
                <th className="p-2.5 border-b border-line">State</th>
                <th className="p-2.5 border-b border-line">PHCs</th>
                <th className="p-2.5 border-b border-line">Bed Occupancy</th>
                <th className="p-2.5 border-b border-line">Staff Attendance</th>
                <th className="p-2.5 border-b border-line">Paracetamol Cover</th>
                <th className="p-2.5 border-b border-line">ORS Cover</th>
                <th className="p-2.5 border-b border-line">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono text-xs">
              {districts
                .filter((d) => selectedStateId === 'ALL' || d.stateId === selectedStateId)
                .slice(0, 8)
                .map((d) => {
                  const dPhcs = phcs.filter((p) => p.districtId === d.id);
                  const dAlerts = alerts.filter(
                    (a) => a.districtId === d.id && a.status === 'active'
                  );
                  const pcmAlert = dAlerts.find((a) => a.medicineId === 'med-01');
                  const orsAlert = dAlerts.find((a) => a.medicineId === 'med-02');

                  return (
                    <tr key={d.id} className="hover:bg-bg-subtle transition-colors">
                      <td className="p-2.5 font-medium text-ink font-sans">
                        {d.name}
                      </td>
                      <td className="p-2.5 text-ink-muted">{d.stateId}</td>
                      <td className="p-2.5">{dPhcs.length}</td>
                      <td className="p-2.5">
                        {dPhcs.length > 0
                          ? Math.round(
                              (dPhcs.reduce((a, b) => a + b.occupiedBeds, 0) /
                                dPhcs.reduce((a, b) => a + b.totalBeds, 0)) *
                                100
                            )
                          : 0}
                        %
                      </td>
                      <td className="p-2.5">
                        {dPhcs.length > 0
                          ? Math.round(
                              (dPhcs.reduce(
                                (a, b) =>
                                  a +
                                  (b.staff.medicalOfficer ? 1 : 0) +
                                  (b.staff.pharmacist ? 1 : 0) +
                                  (b.staff.staffNurse ? 1 : 0) +
                                  (b.staff.anm ? 1 : 0),
                                0
                              ) /
                                (dPhcs.length * 4)) *
                                100
                            )
                          : 0}
                        %
                      </td>
                      <td className="p-2.5">
                        {pcmAlert ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              pcmAlert.severity === 'critical'
                                ? 'bg-critical text-bg-paper'
                                : 'bg-warning text-bg-paper'
                            }`}
                          >
                            {pcmAlert.daysOfCover}d ({pcmAlert.severity})
                          </span>
                        ) : (
                          <span className="text-success font-medium">32d (Healthy)</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {orsAlert ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              orsAlert.severity === 'critical'
                                ? 'bg-critical text-bg-paper'
                                : 'bg-warning text-bg-paper'
                            }`}
                          >
                            {orsAlert.daysOfCover}d ({orsAlert.severity})
                          </span>
                        ) : (
                          <span className="text-success font-medium">28d (Healthy)</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <Link
                          to="/app/forecast"
                          className="text-teal hover:underline font-sans font-medium text-xs"
                        >
                          Forecast &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
