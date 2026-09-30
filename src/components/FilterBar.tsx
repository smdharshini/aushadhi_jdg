import React from 'react';
import { useApp } from '../context/AppContext';
import { Filter, RotateCcw } from 'lucide-react';
import { StateId } from '../types';

export const FilterBar: React.FC<{
  showMedicineFilter?: boolean;
  showDistrictFilter?: boolean;
}> = ({ showMedicineFilter = true, showDistrictFilter = true }) => {
  const {
    states,
    districts,
    medicines,
    selectedStateId,
    setSelectedStateId,
    selectedDistrictId,
    setSelectedDistrictId,
    selectedMedicineId,
    setSelectedMedicineId,
  } = useApp();

  const filteredDistricts =
    selectedStateId === 'ALL'
      ? districts
      : districts.filter((d) => d.stateId === selectedStateId);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as StateId | 'ALL';
    setSelectedStateId(val);
    setSelectedDistrictId('ALL');
  };

  const handleReset = () => {
    setSelectedStateId('ALL');
    setSelectedDistrictId('ALL');
    setSelectedMedicineId('ALL');
  };

  return (
    <div className="bg-bg-paper border border-line rounded p-3 mb-4 flex flex-wrap items-center gap-3 text-xs">
      <div className="flex items-center space-x-1.5 text-ink-muted font-medium pr-2 border-r border-line">
        <Filter className="w-3.5 h-3.5 text-teal" />
        <span>FILTERS:</span>
      </div>

      {/* State Filter */}
      <div className="flex items-center space-x-1.5">
        <label htmlFor="state-filter" className="text-ink-muted font-mono">
          State:
        </label>
        <select
          id="state-filter"
          value={selectedStateId}
          onChange={handleStateChange}
          className="border border-line rounded px-2.5 py-1 bg-bg focus:border-teal focus:outline-hidden text-ink font-medium"
        >
          <option value="ALL">All States (4)</option>
          {Object.values(states).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* District Filter */}
      {showDistrictFilter && (
        <div className="flex items-center space-x-1.5">
          <label htmlFor="district-filter" className="text-ink-muted font-mono">
            District:
          </label>
          <select
            id="district-filter"
            value={selectedDistrictId}
            onChange={(e) => setSelectedDistrictId(e.target.value)}
            className="border border-line rounded px-2.5 py-1 bg-bg focus:border-teal focus:outline-hidden text-ink font-medium"
          >
            <option value="ALL">All Districts ({filteredDistricts.length})</option>
            {filteredDistricts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Medicine Filter */}
      {showMedicineFilter && (
        <div className="flex items-center space-x-1.5">
          <label htmlFor="medicine-filter" className="text-ink-muted font-mono">
            Medicine:
          </label>
          <select
            id="medicine-filter"
            value={selectedMedicineId}
            onChange={(e) => setSelectedMedicineId(e.target.value)}
            className="border border-line rounded px-2.5 py-1 bg-bg focus:border-teal focus:outline-hidden text-ink font-medium max-w-[220px] truncate"
          >
            <option value="ALL">All NLEM Medicines (14)</option>
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.strength})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="ml-auto inline-flex items-center space-x-1 px-2.5 py-1 rounded text-ink-muted hover:text-ink hover:bg-bg border border-line transition-colors"
        title="Reset all filters to national overview"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset</span>
      </button>
    </div>
  );
};
