import React from 'react';
import { DISTRICTS, MEDICINES, STATES } from '../data/masterData';
import { Database, ShieldCheck } from 'lucide-react';

export const DataPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-line pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-ink-muted mb-1">
          <Database className="w-3.5 h-3.5 text-teal" />
          <span>TRANSPARENCY & DATA PROVENANCE</span>
        </div>
        <h1 className="font-serif font-bold text-3xl text-ink">
          Synthetic Data Disclosure & Schema
        </h1>
        <p className="text-ink-muted text-sm mt-1 leading-relaxed">
          In strict compliance with evaluation rules, all data displayed within Aushadhi Grid is generated
          using deterministic synthetic generators based on real geographic topologies and the National List of Essential Medicines.
        </p>
      </div>

      {/* Zero Patient Data Guarantee */}
      <div className="bg-success-subtle border border-success-border rounded p-5 space-y-2">
        <div className="flex items-center space-x-2 text-success font-mono font-bold text-xs uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Patient-Level Data Guarantee</span>
        </div>
        <p className="text-xs text-ink leading-relaxed">
          Aushadhi Grid contains <strong>no patient names, health records, diagnoses, or individual identifiers</strong>.
          All records represent facility-level stock lots, aggregate daily patient footfall counts,
          inpatient bed occupancy, and staff duty attendance rosters.
        </p>
      </div>

      {/* Dataset Summary Table */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
        <h2 className="font-serif font-bold text-base text-ink">
          Network Topology Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">STATES</span>
            <div className="text-xl font-bold text-ink mt-0.5">4</div>
            <div className="text-[10px] text-ink-muted">TN, MH, BR, KL</div>
          </div>
          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">DISTRICTS</span>
            <div className="text-xl font-bold text-ink mt-0.5">24</div>
            <div className="text-[10px] text-ink-muted">6 real districts/state</div>
          </div>
          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">PHCS</span>
            <div className="text-xl font-bold text-teal mt-0.5">120</div>
            <div className="text-[10px] text-ink-muted">5 sub-district PHCs/district</div>
          </div>
          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">NLEM MEDICINES</span>
            <div className="text-xl font-bold text-ink mt-0.5">14</div>
            <div className="text-[10px] text-ink-muted">Essential categories</div>
          </div>
        </div>
      </div>

      {/* 14 Essential Medicines Table */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-3">
        <h2 className="font-serif font-bold text-base text-ink">
          14 National List of Essential Medicines (NLEM) Tracked
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-line">
            <thead className="bg-bg-muted font-mono text-ink-muted text-[11px] uppercase">
              <tr>
                <th className="p-2 border-b border-line">ID</th>
                <th className="p-2 border-b border-line">Medicine Name</th>
                <th className="p-2 border-b border-line">Strength</th>
                <th className="p-2 border-b border-line">Form</th>
                <th className="p-2 border-b border-line">Category</th>
                <th className="p-2 border-b border-line">Daily Baseline</th>
                <th className="p-2 border-b border-line">Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono text-xs">
              {MEDICINES.map((m) => (
                <tr key={m.id} className="hover:bg-bg-subtle transition-colors">
                  <td className="p-2 text-ink-muted">{m.id}</td>
                  <td className="p-2 font-medium text-ink font-sans">{m.name}</td>
                  <td className="p-2">{m.strength}</td>
                  <td className="p-2">{m.form}</td>
                  <td className="p-2 capitalize">{m.category.replace('_', ' ')}</td>
                  <td className="p-2">{m.dailyConsumptionBaseline} units/day</td>
                  <td className="p-2">{m.leadTimeDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Breakdown */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-3">
        <h2 className="font-serif font-bold text-base text-ink">
          Geographic States & Districts (24 Districts)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          {Object.values(STATES).map((s) => {
            const stateDistricts = DISTRICTS.filter((d) => d.stateId === s.id);
            return (
              <div key={s.id} className="p-3 rounded bg-bg border border-line space-y-1">
                <div className="font-bold text-ink font-sans">
                  {s.name} ({s.code}) &bull; Capital: {s.capital}
                </div>
                <div className="text-ink-muted text-[11px]">
                  Districts: {stateDistricts.map((d) => d.name).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
