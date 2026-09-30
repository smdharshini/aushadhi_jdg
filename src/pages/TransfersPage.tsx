import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/FilterBar';
import {
  ArrowRightLeft,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { TransferOrder } from '../types';

const getCsvDownloadFilename = () =>
  `aushadhi_transfer_orders_${new Date().toISOString().slice(0, 10)}.csv`;

export const TransfersPage: React.FC = () => {
  const {
    user,
    transfers,
    approveTransfer,
    selectedStateId,
    selectedMedicineId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');

  const filteredTransfers = transfers.filter((t) => {
    if (activeTab === 'pending' && t.status !== 'pending') return false;
    if (activeTab === 'approved' && t.status !== 'approved') return false;
    if (selectedStateId !== 'ALL' && t.stateId !== selectedStateId && t.destStateId !== selectedStateId) return false;
    if (selectedMedicineId !== 'ALL' && t.medicineId !== selectedMedicineId) return false;
    return true;
  });

  // Role authorization check
  const canApprove = (order: TransferOrder): boolean => {
    if (order.status !== 'pending') return false;
    if (user.role === 'national_observer') return true;
    if (user.role === 'state_officer' && (!order.isCrossState || order.stateId === user.assignedStateId)) return true;
    if (user.role === 'district_officer' && order.sourceDistrictId === user.assignedDistrictId) return true;
    return false;
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Order ID',
      'Medicine',
      'Quantity',
      'Batch',
      'Expiry',
      'Source District',
      'Source PHC',
      'Dest District',
      'Dest PHC',
      'Road Distance (km)',
      'ETA (hours)',
      'Estimated Cost (INR)',
      'Status',
      'Required Authorization',
    ];

    const rows = filteredTransfers.map((t) => [
      t.id,
      `"${t.medicineName}"`,
      t.quantity,
      t.batchNumber,
      t.lotExpiryDate,
      `"${t.sourceDistrictName}"`,
      `"${t.sourcePhcName}"`,
      `"${t.destDistrictName}"`,
      `"${t.destPhcName}"`,
      t.roadDistanceKm,
      t.transitHours,
      t.estimatedCostInr,
      t.status,
      t.requiredRole,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', getCsvDownloadFilename());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalCost = filteredTransfers.reduce((acc, t) => acc + t.estimatedCostInr, 0);
  const totalUnits = filteredTransfers.reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
            <span>MIN-COST OPTIMAL FLOW</span>
            <span>&bull;</span>
            <span>HAVERSINE &times; 1.3 ROAD ROUTING</span>
            <span>&bull;</span>
            <span>EXPIRY-AWARE LOT ALLOCATION</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Cross-District Redistribution Orders
          </h1>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg hover:bg-bg-muted border border-line text-ink transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg hover:bg-bg-muted border border-line text-ink transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-ink-muted" />
            <span>Print Manifest</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar showDistrictFilter={false} />

      {/* Tabs & Summary KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 border border-line rounded p-1 bg-bg-paper text-xs font-mono">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'pending'
                ? 'bg-teal text-bg-paper font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Pending Approval ({transfers.filter((t) => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'approved'
                ? 'bg-teal text-bg-paper font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Approved ({transfers.filter((t) => t.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-teal text-bg-paper font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            All Manifests ({transfers.length})
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-ink-muted">
          <span>Orders: <strong className="text-ink">{filteredTransfers.length}</strong></span>
          <span>&bull;</span>
          <span>Units to Move: <strong className="text-teal">{totalUnits.toLocaleString()}</strong></span>
          <span>&bull;</span>
          <span>Transit Cost: <strong className="text-ink">&#8377;{totalCost.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Transfer Orders List */}
      <div className="space-y-4">
        {filteredTransfers.map((order) => {
          const authorized = canApprove(order);

          return (
            <div
              key={order.id}
              className="bg-bg-paper border border-line rounded p-5 space-y-4 shadow-xs"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-sm text-teal">
                    {order.id}
                  </span>
                  <span className="font-serif font-bold text-base text-ink">
                    {order.quantity.toLocaleString()} units of {order.medicineName}
                  </span>
                  {order.isCrossState && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-warning-subtle text-warning border border-warning-border">
                      CROSS-STATE DISPATCH
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 rounded uppercase font-semibold text-[11px] ${
                      order.status === 'approved'
                        ? 'bg-success-subtle text-success border border-success-border'
                        : 'bg-bg-muted text-ink border border-line'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Route Matching Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                {/* Donor Block */}
                <div className="p-3 rounded bg-bg border border-line space-y-1">
                  <span className="text-[10px] text-ink-muted uppercase">SURPLUS DONOR (COVER &gt; 45D)</span>
                  <div className="font-bold text-sm text-ink">{order.sourceDistrictName}</div>
                  <div className="text-ink-muted">{order.sourcePhcName}</div>
                  <div className="text-[11px] text-teal pt-1">
                    Lot: {order.batchNumber} (Exp: {order.lotExpiryDate})
                  </div>
                </div>

                {/* Transit Details Block */}
                <div className="p-3 rounded bg-bg-subtle border border-line space-y-1 flex flex-col justify-center items-center text-center">
                  <div className="flex items-center space-x-2 text-ink">
                    <Truck className="w-4 h-4 text-teal" />
                    <span className="font-bold">{order.roadDistanceKm} km Road Route</span>
                  </div>
                  <div className="text-ink-muted">
                    ETA: ~{order.transitHours} hours (45 km/h + dispatch)
                  </div>
                  <div className="text-ink font-semibold">
                    Cost Estimate: &#8377;{order.estimatedCostInr.toLocaleString()}
                  </div>
                </div>

                {/* Recipient Block */}
                <div className="p-3 rounded bg-bg border border-line space-y-1">
                  <span className="text-[10px] text-critical uppercase font-semibold">
                    DEFICIT RECIPIENT (COVER &lt; 14D)
                  </span>
                  <div className="font-bold text-sm text-ink">{order.destDistrictName}</div>
                  <div className="text-ink-muted">{order.destPhcName}</div>
                  <div className="text-[11px] text-critical pt-1">
                    Post-transfer buffer: &ge; 28 days
                  </div>
                </div>
              </div>

              {/* Card Footer: Authorization & Audit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-line text-xs gap-3">
                <div className="text-ink-muted font-mono text-[11px]">
                  <span>Authorization Tier: </span>
                  <span className="font-semibold text-ink uppercase">
                    {order.requiredRole.replace('_', ' ')}
                  </span>
                  {order.approvedBy && (
                    <span className="ml-2 text-success font-medium">
                      &bull; Approved by {order.approvedBy} on{' '}
                      {new Date(order.approvedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {order.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    {authorized ? (
                      <button
                        onClick={() => approveTransfer(order.id)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded bg-teal hover:bg-teal-hover text-bg-paper font-semibold transition-colors shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Authorize & Issue Transfer Order</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 text-ink-muted italic text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-ink-faint" />
                        <span>Requires {order.requiredRole.replace('_', ' ')} credentials</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTransfers.length === 0 && (
          <div className="bg-bg-paper border border-line rounded p-12 text-center space-y-2">
            <ArrowRightLeft className="w-8 h-8 text-ink-muted mx-auto" />
            <h3 className="font-serif font-bold text-base text-ink">
              No redistribution orders in this view
            </h3>
            <p className="text-xs text-ink-muted">
              Districts currently maintain adequate safety stock, or active filters exclude current records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
