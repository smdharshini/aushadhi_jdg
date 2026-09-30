import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { FederatedCoordinator, StateDataset } from '../workers/federatedCoordinator';
import { FederatedRoundResult, StateId } from '../types';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Cpu,
  Lock,
  Play,
  RotateCcw,
  Scale,
  ShieldCheck,
} from 'lucide-react';

export const FederatedLabPage: React.FC = () => {
  const { states } = useApp();

  // Prepare synthetic datasets partitioned by state for the 4 Web Workers
  const stateDatasets: StateDataset[] = useMemo(() => {
    const res: StateDataset[] = [];
    const stateIds: StateId[] = ['TN', 'MH', 'BR', 'KL'];

    stateIds.forEach((sid, sIdx) => {
      const trainX: number[][] = [];
      const trainY: number[] = [];
      const testX: number[][] = [];
      const testY: number[] = [];

      // Generate localized state training samples
      const baseSamples = 120 + sIdx * 30; // varied sample count across states
      for (let i = 0; i < baseSamples; i++) {
        const lag1 = 400 + Math.sin(i * 0.1) * 80 + (sIdx * 20);
        const lag2 = lag1 * 0.95;
        const ma4 = lag1 * 0.98;
        const sinSeason = Math.sin((2 * Math.PI * (i % 52)) / 52);
        const cosSeason = Math.cos((2 * Math.PI * (i % 52)) / 52);
        const rain = sIdx === 0 || sIdx === 3 ? 0.7 : 0.2; // TN/KL higher monsoon
        const temp = 0.5;
        const outbreak = i % 15 === 0 ? 1 : 0;

        const row = [lag1, lag2, ma4, sinSeason, cosSeason, rain, temp, outbreak];
        // Target demand with state-specific bias and national common trend
        const y = Math.max(
          50,
          Math.round(
            0.4 * lag1 +
              0.3 * lag2 +
              0.2 * ma4 +
              60 * sinSeason +
              40 * rain +
              80 * outbreak +
              30 +
              Math.sin(i * 12.9898 + sIdx * 78.233) * 10
          )
        );

        if (i < baseSamples * 0.8) {
          trainX.push(row);
          trainY.push(y);
        } else {
          testX.push(row);
          testY.push(y);
        }
      }

      res.push({
        stateId: sid,
        trainX,
        trainY,
        testX,
        testY,
      });
    });

    return res;
  }, []);

  const [coordinator, setCoordinator] = useState<FederatedCoordinator | null>(
    () => new FederatedCoordinator(stateDatasets)
  );
  const [roundsHistory, setRoundsHistory] = useState<FederatedRoundResult[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(0);

  // Terminate coordinator on unmount
  useEffect(() => {
    return () => {
      coordinator?.terminate();
    };
  }, [coordinator]);

  const handleStepRound = async (numRounds = 1) => {
    if (!coordinator || isTraining) return;
    setIsTraining(true);

    try {
      const newHistory = [...roundsHistory];
      for (let r = 0; r < numRounds; r++) {
        const result = await coordinator.runRound();
        newHistory.push(result);
        setCurrentRoundNumber(result.round);
      }
      setRoundsHistory(newHistory);
    } finally {
      setIsTraining(false);
    }
  };

  const handleResetModel = () => {
    if (coordinator) {
      coordinator.terminate();
    }
    const coord = new FederatedCoordinator(stateDatasets);
    setCoordinator(coord);
    setRoundsHistory([]);
    setCurrentRoundNumber(0);
  };

  const latestResult = roundsHistory[roundsHistory.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & FedAvg Architecture Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-line gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
            <span>FEDAVG ALGORITHM</span>
            <span>&bull;</span>
            <span>WEB WORKERS SANDBOX</span>
            <span>&bull;</span>
            <span>DPDP ACT 2023 DATA SOVEREIGNTY</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink tracking-tight mt-0.5">
            Federated Learning Operations Lab
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStepRound(1)}
            disabled={isTraining}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-teal hover:bg-teal-hover disabled:bg-teal/60 text-bg-paper text-xs font-semibold transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTraining ? 'Training Round...' : 'Train 1 Round'}</span>
          </button>

          <button
            onClick={() => handleStepRound(5)}
            disabled={isTraining}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-bg hover:bg-bg-muted border border-line text-ink text-xs font-semibold transition-colors"
          >
            <span>Train 5 Rounds</span>
          </button>

          <button
            onClick={handleResetModel}
            disabled={isTraining}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded text-ink-muted hover:text-ink hover:bg-bg border border-line text-xs transition-colors"
            title="Reset model to initial random weights"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Why Federated Learning Explainer Callout */}
      <div className="bg-bg-paper border border-line rounded p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-teal font-semibold text-xs font-mono uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>State Data Sovereignty</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Healthcare is a state subject under India's Constitution. States retain exclusive physical custody
            over their Primary Health Centre operational records without transferring them to a central federal lake.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-teal font-semibold text-xs font-mono uppercase">
            <Lock className="w-4 h-4" />
            <span>DPDP Act 2023 Alignment</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Data minimization and purpose limitation strictly honored. Only non-identifiable numerical weight vectors
            w<sub>k</sub> are exchanged. Raw health records never transit the network.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-teal font-semibold text-xs font-mono uppercase">
            <Scale className="w-4 h-4" />
            <span>Collaborative Resilience</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            A state with an emerging Dengue or viral wave improves national forecasting models early,
            enabling neighboring states to prepare before local cases surge.
          </p>
        </div>
      </div>

      {/* Live State Nodes Web Worker Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-teal" />
            <h2 className="font-serif font-bold text-base text-ink">
              State Client Nodes (Sandboxed Web Workers)
            </h2>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            Round: {currentRoundNumber} &bull; Local Epochs: 5 &bull; Learning Rate: 0.005
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stateDatasets.map((ds) => {
            const stateInfo = states[ds.stateId];
            const sampleCount = ds.trainX.length;
            const lossVal = latestResult ? latestResult.stateLosses[ds.stateId] : null;

            return (
              <div
                key={ds.stateId}
                className="bg-bg-paper border border-line rounded p-4 space-y-2.5 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-ink">
                    {stateInfo.name} ({stateInfo.code})
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-success-subtle text-success border border-success-border font-medium">
                    Worker Active
                  </span>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span>Local Samples:</span>
                    <span className="text-ink font-semibold">{sampleCount}</span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Aggregator Share:</span>
                    <span className="text-teal font-semibold">
                      {Math.round((sampleCount / 570) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Validation Loss:</span>
                    <span className="text-ink font-semibold">
                      {lossVal !== null ? `${lossVal}` : 'Initial'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line text-[11px] text-ink-faint font-mono">
                  Data boundary strictly confined
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Performance Comparison: Local-Only vs Federated Model */}
      <div className="bg-bg-paper border border-line rounded p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <h2 className="font-serif font-bold text-base text-ink">
              Quantitative Benchmark: Local-Only vs Federated Model MAPE
            </h2>
            <p className="text-xs text-ink-muted">
              Computed in real time from held-out test records across all 4 state partitions.
            </p>
          </div>

          {latestResult && (
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="p-2 rounded bg-bg border border-line">
                <span className="text-ink-muted">Local-Only MAPE: </span>
                <span className="font-bold text-critical">{latestResult.localOnlyMape}%</span>
              </div>
              <div className="p-2 rounded bg-teal-subtle border border-teal-border text-teal">
                <span>Federated MAPE: </span>
                <span className="font-bold">{latestResult.globalMape}%</span>
              </div>
              <div className="text-success font-semibold">
                (-{Math.max(0, Number((latestResult.localOnlyMape - latestResult.globalMape).toFixed(2)))}% error reduction)
              </div>
            </div>
          )}
        </div>

        {/* Training Convergence Chart */}
        {roundsHistory.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={roundsHistory}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid stroke="#E2DDD2" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="round"
                  stroke="#52635B"
                  fontSize={11}
                  tickLine={false}
                  label={{ value: 'Federated Round', position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  stroke="#52635B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Held-out MAPE (%)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as FederatedRoundResult;
                      return (
                        <div className="bg-bg-paper border border-line p-2.5 rounded shadow-sm text-xs font-mono space-y-1">
                          <div className="font-bold text-ink border-b border-line pb-1">
                            Round {label}
                          </div>
                          <div className="text-critical">
                            Local-Only Model MAPE: {data.localOnlyMape}%
                          </div>
                          <div className="text-teal font-semibold">
                            Federated Global MAPE: {data.globalMape}%
                          </div>
                          <div className="text-ink-muted text-[10px]">
                            Global MSE Loss: {data.globalLoss}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="localOnlyMape"
                  name="Local-Only Model MAPE"
                  stroke="#B3261E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="globalMape"
                  name="Federated Model MAPE"
                  stroke="#0F5C4D"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0F5C4D' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-line rounded space-y-2">
            <Cpu className="w-8 h-8 text-ink-muted mx-auto" />
            <p className="font-serif font-semibold text-sm text-ink">
              Federated model uninitialized
            </p>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Click &quot;Train 1 Round&quot; or &quot;Train 5 Rounds&quot; above to launch parallel gradient descent epochs
              inside the 4 sandboxed State Web Workers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
