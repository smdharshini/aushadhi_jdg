import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { forecastDemand } from '../math/regression';
import { BookOpen } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ForecastChartPoint {
  date: string;
  type: 'actual' | 'forecast';
  actualQuantity: number | null;
  forecastQuantity: number | null;
  lower95: number | null;
  upper95: number | null;
  lower80: number | null;
  upper80: number | null;
}

export const ForecastPage: React.FC = () => {
  const {
    districts,
    medicines,
    selectedDistrictId,
    setSelectedDistrictId,
    selectedMedicineId,
    setSelectedMedicineId,
    activeScenario,
    phcs,
  } = useApp();

  // Guarantee non-'ALL' selections for focused forecasting
  const currentDistrictId =
    selectedDistrictId !== 'ALL' ? selectedDistrictId : 'TN_MDU';
  const currentMedicineId =
    selectedMedicineId !== 'ALL' ? selectedMedicineId : 'med-01';

  const [forecastWeeks, setForecastWeeks] = useState<number>(8);
  const [multiplier, setMultiplier] = useState<number>(
    activeScenario && activeScenario.districtId === currentDistrictId ? activeScenario.demandMultiplier : 1.0
  );

  const currentDistrict = districts.find((d) => d.id === currentDistrictId) || districts[0];
  const currentMedicine = medicines.find((m) => m.id === currentMedicineId) || medicines[0];

  // Find a representative PHC in this district to grab the 52-week consumption history
  const districtPhc = phcs.find((p) => p.districtId === currentDistrictId) || phcs[0];

  // Retrieve raw synthetic consumption history from local storage / store
  const historyKey = `${districtPhc.id}_${currentMedicine.id}`;
  const historyData = useMemo(() => {
    try {
      const saved = localStorage.getItem('aushadhi_synthetic_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.consumptionHistory && parsed.consumptionHistory[historyKey]) {
          return parsed.consumptionHistory[historyKey];
        }
      }
    } catch {}

    // Fallback generated baseline if key not parsed
    const fallback = [];
    const baseDate = new Date('2025-10-01');
    for (let i = 0; i < 52; i++) {
      const d = new Date(baseDate.getTime() + i * 7 * 86400000);
      const seasonal = 1.0 + Math.sin((2 * Math.PI * i) / 52) * 0.35;
      fallback.push({
        weekIndex: i,
        date: d.toISOString().slice(0, 10),
        actualQuantity: Math.round(currentMedicine.dailyConsumptionBaseline * 7 * seasonal),
        rainfallIndex: 0.3,
        temperatureIndex: 0.5,
        outbreakFlag: 0,
      });
    }
    return fallback;
  }, [historyKey, currentMedicine]);

  // Compute forecast points using our Ridge regression engine
  const forecastPoints = useMemo(() => {
    return forecastDemand(historyData, forecastWeeks, multiplier);
  }, [historyData, forecastWeeks, multiplier]);

  // Format combined dataset for Recharts: past actuals + future forecast bands
  const chartData = useMemo(() => {
    const combined: ForecastChartPoint[] = [];

    // Show last 16 historical weeks for readability
    const recentHistory = historyData.slice(-16);
    recentHistory.forEach((h: { date: string; actualQuantity: number }) => {
      combined.push({
        date: h.date,
        type: 'actual',
        actualQuantity: h.actualQuantity,
        forecastQuantity: null,
        lower95: null,
        upper95: null,
        lower80: null,
        upper80: null,
      });
    });

    // Bridge point: last historical point acts as forecast origin
    if (recentHistory.length > 0 && forecastPoints.length > 0) {
      const last = recentHistory[recentHistory.length - 1];
      combined[combined.length - 1].forecastQuantity = last.actualQuantity;
      combined[combined.length - 1].lower95 = last.actualQuantity;
      combined[combined.length - 1].upper95 = last.actualQuantity;
      combined[combined.length - 1].lower80 = last.actualQuantity;
      combined[combined.length - 1].upper80 = last.actualQuantity;
    }

    // Future Forecast weeks
    forecastPoints.forEach((f) => {
      combined.push({
        date: f.targetDate,
        type: 'forecast',
        actualQuantity: null,
        forecastQuantity: f.predictedDemand,
        lower95: f.lowerBound95,
        upper95: f.upperBound95,
        lower80: f.lowerBound80,
        upper80: f.upperBound80,
      });
    });

    return combined;
  }, [historyData, forecastPoints]);

  const avgForecastDemand = forecastPoints.length > 0
    ? Math.round(forecastPoints.reduce((acc, p) => acc + p.predictedDemand, 0) / forecastPoints.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
            <span>RIDGE / POISSON REGRESSION</span>
            <span>&bull;</span>
            <span>CYCLIC SEASONAL HARMONICS</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Transparent Demand Forecasting Engine
          </h1>
        </div>

        {/* Horizon selector & multiplier */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <label className="text-ink-muted">Horizon:</label>
          {[4, 6, 8].map((w) => (
            <button
              key={w}
              onClick={() => setForecastWeeks(w)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                forecastWeeks === w
                  ? 'bg-teal text-bg-paper font-bold'
                  : 'bg-bg hover:bg-bg-muted border border-line text-ink'
              }`}
            >
              +{w} Weeks
            </button>
          ))}
        </div>
      </div>

      {/* Target Selector Filter */}
      <div className="bg-bg-paper border border-line rounded p-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-ink-muted">District:</span>
          <select
            value={currentDistrictId}
            onChange={(e) => setSelectedDistrictId(e.target.value)}
            className="border border-line rounded px-2.5 py-1 bg-bg font-medium text-ink focus:border-teal focus:outline-hidden"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.stateId})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-mono text-ink-muted">Medicine:</span>
          <select
            value={currentMedicineId}
            onChange={(e) => setSelectedMedicineId(e.target.value)}
            className="border border-line rounded px-2.5 py-1 bg-bg font-medium text-ink focus:border-teal focus:outline-hidden max-w-[240px] truncate"
          >
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.strength})
              </option>
            ))}
          </select>
        </div>

        {/* Live Multiplier Slider */}
        <div className="flex items-center space-x-2 ml-auto">
          <span className="font-mono text-ink-muted">Outbreak Multiplier:</span>
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            className="w-24 accent-teal cursor-pointer"
          />
          <span className="font-mono font-bold text-teal min-w-[35px]">
            {multiplier.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Demand Forecast Chart */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <h2 className="font-serif font-bold text-base text-ink">
              Weekly Consumption: Actual vs Projected
            </h2>
            <p className="text-xs text-ink-muted">
              {currentMedicine.name} ({currentMedicine.strength}) &bull; {currentDistrict.name} District
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-0.5 bg-ink" />
              <span>Actual History</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-0.5 bg-teal border-b-2 border-teal" />
              <span>Point Forecast</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-teal/20 rounded-xs" />
              <span>80% Interval</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-teal/10 rounded-xs" />
              <span>95% Interval</span>
            </div>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid stroke="#E2DDD2" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#52635B"
                fontSize={11}
                tickFormatter={(val) => val.slice(5)}
                tickLine={false}
              />
              <YAxis
                stroke="#52635B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-bg-paper border border-line p-2.5 rounded shadow-sm text-xs font-mono space-y-1">
                        <div className="font-bold text-ink border-b border-line pb-1">
                          Week of {label}
                        </div>
                        {data.actualQuantity !== null && (
                          <div className="text-ink">
                            Actual: <span className="font-bold">{data.actualQuantity} units</span>
                          </div>
                        )}
                        {data.forecastQuantity !== null && (
                          <>
                            <div className="text-teal">
                              Predicted: <span className="font-bold">{data.forecastQuantity} units</span>
                            </div>
                            <div className="text-ink-muted text-[10px]">
                              80% CI: [{data.lower80} &ndash; {data.upper80}]
                            </div>
                            <div className="text-ink-muted text-[10px]">
                              95% CI: [{data.lower95} &ndash; {data.upper95}]
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* 95% Confidence Interval Band */}
              <Area
                type="monotone"
                dataKey="upper95"
                stroke="none"
                fill="#0F5C4D"
                fillOpacity={0.08}
              />
              <Area
                type="monotone"
                dataKey="lower95"
                stroke="none"
                fill="#FFFFFF"
                fillOpacity={1.0}
              />

              {/* 80% Confidence Interval Band */}
              <Area
                type="monotone"
                dataKey="upper80"
                stroke="none"
                fill="#0F5C4D"
                fillOpacity={0.15}
              />

              {/* Actual Consumption Line */}
              <Line
                type="monotone"
                dataKey="actualQuantity"
                stroke="#14211C"
                strokeWidth={2}
                dot={{ r: 2, fill: '#14211C' }}
                connectNulls={false}
              />

              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="forecastQuantity"
                stroke="#0F5C4D"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#0F5C4D' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-line text-xs font-mono">
          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">AVERAGE WEEKLY RUN-RATE</span>
            <div className="text-lg font-bold text-ink mt-0.5">
              {avgForecastDemand} units/week
            </div>
            <p className="text-[10px] text-ink-muted">~{Math.round(avgForecastDemand / 7)} units/day per facility</p>
          </div>

          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">CONFIDENCE BOUND (8-WEEK HORIZON)</span>
            <div className="text-lg font-bold text-teal mt-0.5">
              &plusmn;{forecastPoints.length > 0 ? Math.round(forecastPoints[forecastPoints.length - 1].upperBound80 - forecastPoints[forecastPoints.length - 1].predictedDemand) : 0} units
            </div>
            <p className="text-[10px] text-ink-muted">80% predictive standard error</p>
          </div>

          <div className="p-3 rounded bg-bg border border-line">
            <span className="text-ink-muted">ACTIVE SURGE MULTIPLIER</span>
            <div className="text-lg font-bold text-warning mt-0.5">
              {multiplier.toFixed(1)}x
            </div>
            <p className="text-[10px] text-ink-muted">
              {multiplier > 1.0 ? 'Outbreak surge mode applied' : 'Standard seasonal baseline'}
            </p>
          </div>
        </div>
      </div>

      {/* Model Rationale & Feature Breakdown */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-3">
        <div className="flex items-center space-x-2 text-ink">
          <BookOpen className="w-4 h-4 text-teal" />
          <h2 className="font-serif font-bold text-base">
            Regression Formulation & Feature Attribution
          </h2>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          The forecast is generated using a regularized Ridge formulation with non-negative projection.
          Features include auto-regressive lags (1-week, 2-week, 4-week moving average), Fourier cyclic harmonic terms
          sin(2&pi;t/52) and cos(2&pi;t/52) capturing monsoon fever cycles, historical rainfall indices, and active epidemiological surge flags.
        </p>
      </div>
    </div>
  );
};
