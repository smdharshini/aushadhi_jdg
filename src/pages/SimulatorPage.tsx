import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Flame,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { SimulationScenario, StateId } from '../types';

export const SimulatorPage: React.FC = () => {
  const {
    states,
    districts,
    medicines,
    activeScenario,
    applyScenario,
  } = useApp();

  // Presets
  const PRESET_SCENARIOS: SimulationScenario[] = [
    {
      id: 'SCENARIO_MDU_DENGUE',
      name: 'Madurai Dengue & Viral Fever Outbreak',
      description: 'Acute post-monsoon mosquito vector spike. Outpatient fever consultations surge by 150%, accelerating Paracetamol and ORS depletion.',
      stateId: 'TN',
      districtId: 'TN_MDU',
      medicineId: 'med-01',
      demandMultiplier: 2.5,
      durationWeeks: 4,
    },
    {
      id: 'SCENARIO_BR_FLOOD',
      name: 'North Bihar Monsoon Inundation & Waterborne Surge',
      description: 'Severe Kosi basin flooding disrupts road supply corridors. Diarrheal outbreaks drive immediate 2.8x demand for Oral Rehydration Salts.',
      stateId: 'BR',
      districtId: 'BR_MUZ',
      medicineId: 'med-02',
      demandMultiplier: 2.8,
      durationWeeks: 6,
    },
    {
      id: 'SCENARIO_MH_HEATWAVE',
      name: 'Vidarbha Severe Summer Heatwave Spike',
      description: 'Temperatures exceed 46°C across Nagpur and surrounding rural belts, creating acute dehydration cases and heat stroke admissions.',
      stateId: 'MH',
      districtId: 'MH_NGP',
      medicineId: 'med-02',
      demandMultiplier: 2.2,
      durationWeeks: 3,
    },
  ];

  // Custom Scenario Builder State
  const [customStateId, setCustomStateId] = useState<StateId>('TN');
  const [customDistrictId, setCustomDistrictId] = useState<string>('TN_MDU');
  const [customMedicineId, setCustomMedicineId] = useState<string>('med-01');
  const [customMultiplier, setCustomMultiplier] = useState<number>(2.0);

  const filteredDistricts = districts.filter((d) => d.stateId === customStateId);

  const handleLaunchScenario = (sc: SimulationScenario) => {
    applyScenario(sc);
  };

  const handleLaunchCustom = () => {
    const dName = districts.find((d) => d.id === customDistrictId)?.name || customDistrictId;
    const mName = medicines.find((m) => m.id === customMedicineId)?.name || customMedicineId;

    const custom: SimulationScenario = {
      id: `CUSTOM_${Date.now()}`,
      name: `Custom Demand Shock: ${dName} (${mName})`,
      description: `Simulated ${customMultiplier}x demand shock on ${mName} in ${dName} district.`,
      stateId: customStateId,
      districtId: customDistrictId,
      medicineId: customMedicineId,
      demandMultiplier: customMultiplier,
      durationWeeks: 4,
    };
    applyScenario(custom);
  };

  const handleDeactivate = () => {
    applyScenario(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
            <span>EPIDEMIOLOGICAL SHOCK SANDBOX</span>
            <span>&bull;</span>
            <span>LIVE REBALANCING ENGINE</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Emergency Scenario Simulator
          </h1>
        </div>

        {activeScenario && (
          <button
            onClick={handleDeactivate}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg hover:bg-bg-muted border border-line text-ink text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-ink-muted" />
            <span>Deactivate Simulation</span>
          </button>
        )}
      </div>

      {/* Active Scenario Banner */}
      {activeScenario ? (
        <div className="bg-warning-subtle border border-warning-border rounded p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-warning font-mono font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>SIMULATION CURRENTLY RUNNING</span>
            </div>
            <span className="font-mono text-xs font-bold text-warning px-2 py-0.5 rounded bg-bg-paper border border-warning-border">
              {activeScenario.demandMultiplier}x Demand Surge
            </span>
          </div>

          <div>
            <h2 className="font-serif font-bold text-lg text-ink">
              {activeScenario.name}
            </h2>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-3xl">
              {activeScenario.description}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center space-x-1 text-teal hover:underline font-semibold"
            >
              <span>View Dashboard Reaction &rarr;</span>
            </Link>
            <Link
              to="/app/alerts"
              className="inline-flex items-center space-x-1 text-critical hover:underline font-semibold"
            >
              <span>View Triggered Alerts &rarr;</span>
            </Link>
            <Link
              to="/app/transfers"
              className="inline-flex items-center space-x-1 text-teal hover:underline font-semibold"
            >
              <span>Inspect Redistribution Rebalance &rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-bg-paper border border-line rounded p-5 text-xs text-ink-muted flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-teal" />
            <span>System operating under standard seasonal baselines. Select an outbreak scenario below to inject real-time stress.</span>
          </div>
        </div>
      )}

      {/* Presets Grid */}
      <div className="space-y-3">
        <h2 className="font-serif font-bold text-lg text-ink">
          Curated Epidemiological Emergency Scenarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRESET_SCENARIOS.map((sc) => {
            const isActive = activeScenario?.id === sc.id;

            return (
              <div
                key={sc.id}
                className={`border rounded p-5 space-y-3 flex flex-col justify-between transition-all ${
                  isActive
                    ? 'border-warning bg-warning-subtle/50 shadow-xs'
                    : 'border-line bg-bg-paper hover:border-ink-muted'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-bg-muted border border-line text-ink">
                      {sc.stateId} &bull; {sc.districtId}
                    </span>
                    <span className="font-mono text-xs font-bold text-warning">
                      {sc.demandMultiplier}x Multiplier
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-ink">
                    {sc.name}
                  </h3>

                  <p className="text-xs text-ink-muted leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-line">
                  {isActive ? (
                    <div className="flex items-center space-x-1 text-success text-xs font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Currently Active</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleLaunchScenario(sc)}
                      className="inline-flex items-center space-x-1.5 w-full justify-center bg-teal hover:bg-teal-hover text-bg-paper px-3 py-2 rounded text-xs font-semibold transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Inject Scenario Surge</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
        <div className="border-b border-line pb-3">
          <h2 className="font-serif font-bold text-base text-ink">
            Custom Emergency Scenario Builder
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Design an arbitrary demand shock on any district and medicine to stress-test the automated solver.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-ink-muted">Target State:</label>
            <select
              value={customStateId}
              onChange={(e) => {
                const s = e.target.value as StateId;
                setCustomStateId(s);
                const firstD = districts.find((d) => d.stateId === s);
                if (firstD) setCustomDistrictId(firstD.id);
              }}
              className="w-full border border-line rounded p-2 bg-bg text-ink font-medium focus:border-teal focus:outline-hidden"
            >
              {Object.values(states).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-ink-muted">Target District:</label>
            <select
              value={customDistrictId}
              onChange={(e) => setCustomDistrictId(e.target.value)}
              className="w-full border border-line rounded p-2 bg-bg text-ink font-medium focus:border-teal focus:outline-hidden"
            >
              {filteredDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-ink-muted">Medicine Under Stress:</label>
            <select
              value={customMedicineId}
              onChange={(e) => setCustomMedicineId(e.target.value)}
              className="w-full border border-line rounded p-2 bg-bg text-ink font-medium focus:border-teal focus:outline-hidden"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.strength})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-ink-muted">
              Surge Multiplier: <strong>{customMultiplier}x</strong>
            </label>
            <input
              type="range"
              min="1.2"
              max="4.0"
              step="0.1"
              value={customMultiplier}
              onChange={(e) => setCustomMultiplier(parseFloat(e.target.value))}
              className="w-full accent-teal mt-2 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleLaunchCustom}
            className="inline-flex items-center space-x-2 bg-teal hover:bg-teal-hover text-bg-paper px-4 py-2 rounded text-xs font-semibold transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Apply Custom Shock to Grid</span>
          </button>
        </div>
      </div>
    </div>
  );
};
