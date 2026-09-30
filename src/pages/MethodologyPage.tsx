import React from 'react';
import { BookOpen, Cpu, LineChart, Network, Scale } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-line pb-4">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-ink-muted mb-1">
          <BookOpen className="w-3.5 h-3.5 text-teal" />
          <span>SCIENTIFIC & MATHEMATICAL SPECIFICATION</span>
        </div>
        <h1 className="font-serif font-bold text-3xl text-ink">
          System Methodology & Analytical Formulations
        </h1>
        <p className="text-ink-muted text-sm mt-1 leading-relaxed">
          Full mathematical transparency for demand forecasting, federated model aggregation,
          and constrained redistribution optimization. Zero black-box implementations.
        </p>
      </div>

      {/* Section 1: Demand Forecasting Regression */}
      <section className="bg-bg-paper border border-line rounded p-6 space-y-4">
        <div className="flex items-center space-x-2 text-teal font-semibold text-sm">
          <LineChart className="w-4 h-4" />
          <h2>1. Regularized Poisson/Ridge Demand Forecasting</h2>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Consumption forecasting operates auto-regressively over a 52-week historical window per medicine and district.
          The design matrix X incorporates auto-regressive lags, rolling moving averages, Fourier cyclic harmonics,
          and rainfall indices:
        </p>

        <div className="bg-bg p-4 rounded border border-line font-mono text-xs text-ink space-y-2 overflow-x-auto">
          <div className="font-bold">Feature Vector x(t):</div>
          <div>x(t) = [ y(t-1), y(t-2), MA4(t), sin(2&pi;t/52), cos(2&pi;t/52), Rain(t), Temp(t), Outbreak(t) ]</div>
          <div className="pt-2 font-bold">Ridge Normal Equation with L2 Penalty:</div>
          <div>w = (X<sup>T</sup> X + &lambda; I)<sup>-1</sup> X<sup>T</sup> y</div>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Prediction intervals are computed using degrees-of-freedom corrected residual variance s<sup>2</sup> inflated
          by horizon step h:
        </p>
        <div className="bg-bg p-3 rounded border border-line font-mono text-xs text-ink">
          SE(h) = s &times; &radic;(1 + 0.22 &times; (h - 1)) &emsp;&rarr;&emsp; 80% CI = &plusmn; 1.282 &times; SE(h)
        </div>
      </section>

      {/* Section 2: Days of Cover & Lead-Time Stock-out Probability */}
      <section className="bg-bg-paper border border-line rounded p-6 space-y-4">
        <div className="flex items-center space-x-2 text-teal font-semibold text-sm">
          <Scale className="w-4 h-4" />
          <h2>2. Days of Cover & Lead-Time Risk Formulation</h2>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Days of cover (DOC) represents the number of operational days before current usable inventory is exhausted
          under forecast daily demand d:
        </p>

        <div className="bg-bg p-3 rounded border border-line font-mono text-xs text-ink">
          DOC = UsableStock / ForecastDailyDemand
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Lead-time stock-out probability P(Stock-out) models total demand D<sub>L</sub> over supplier replenishment lead time L
          as a normal distribution D<sub>L</sub> &sim; N(&mu;<sub>L</sub>, &sigma;<sub>L</sub><sup>2</sup>):
        </p>

        <div className="bg-bg p-3 rounded border border-line font-mono text-xs text-ink">
          &mu;<sub>L</sub> = d &times; L, &emsp; &sigma;<sub>L</sub> = d &times; COV &times; &radic;L, &emsp;
          Z = (CurrentStock - &mu;<sub>L</sub>) / &sigma;<sub>L</sub>, &emsp; P(Stock-out) = 1 - &Phi;(Z)
        </div>
      </section>

      {/* Section 3: Federated Learning (FedAvg) */}
      <section className="bg-bg-paper border border-line rounded p-6 space-y-4">
        <div className="flex items-center space-x-2 text-teal font-semibold text-sm">
          <Cpu className="w-4 h-4" />
          <h2>3. Federated Learning (FedAvg) Across State Web Workers</h2>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          In compliance with state data sovereignty and the Digital Personal Data Protection (DPDP) Act 2023,
          consumption records remain isolated inside each state's sandboxed Web Worker.
          Each round t, the aggregator broadcasts global weights w<sub>t</sub>.
          State nodes run local gradient descent epochs and return updated weights w<sub>t+1</sub><sup>k</sup> and sample counts n<sub>k</sub>:
        </p>

        <div className="bg-bg p-4 rounded border border-line font-mono text-xs text-ink space-y-1">
          <div className="font-bold">Sample-Weighted Federated Average:</div>
          <div>w<sub>t+1</sub> = &sum;<sub>k=1..K</sub> (n<sub>k</sub> / N) &times; w<sub>t+1</sub><sup>k</sup></div>
          <div className="text-ink-muted text-[11px] pt-1">
            Where N = &sum; n<sub>k</sub> is the national sample total.
          </div>
        </div>
      </section>

      {/* Section 4: Min-Cost Redistribution Problem */}
      <section className="bg-bg-paper border border-line rounded p-6 space-y-4">
        <div className="flex items-center space-x-2 text-teal font-semibold text-sm">
          <Network className="w-4 h-4" />
          <h2>4. Constrained Min-Cost Redistribution Solver</h2>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Redistribution matches surplus donors to critical deficit recipients while minimizing transport cost
          and strictly preserving a safety buffer at donor facilities:
        </p>

        <ul className="list-disc list-inside space-y-1 text-xs text-ink-muted font-sans">
          <li><strong>Donor Criterion:</strong> Days of cover &gt; 45 days. Maximum transferable units capped such that post-transfer cover &ge; 30 days.</li>
          <li><strong>Recipient Criterion:</strong> Days of cover &lt; 14 days. Transfer target fills inventory to 28 days of safety buffer.</li>
          <li><strong>Road Distance Metric:</strong> Haversine great-circle distance scaled by a 1.3 road tortuosity factor for Indian national and state highway networks.</li>
          <li><strong>Lot Expiry Allocation:</strong> First-Expired First-Out (FEFO), ensuring transferred lots do not expire in transit or prior to estimated recipient consumption.</li>
        </ul>
      </section>
    </div>
  );
};
