import { describe, expect, it } from 'vitest';
import {
  computeMape,
  computeMseLoss,
  computeSampleWeightedFedAvg,
  LocalTrainingResult,
  trainLocalStateModel,
} from '../federated';

describe('Federated Learning FedAvg Engine', () => {
  it('computes sample-weighted FedAvg weights correctly', () => {
    const results: LocalTrainingResult[] = [
      {
        stateId: 'TN',
        sampleCount: 100,
        weights: [2.0, 4.0],
        bias: 10,
        localLoss: 1.5,
      },
      {
        stateId: 'MH',
        sampleCount: 300,
        weights: [6.0, 8.0],
        bias: 30,
        localLoss: 2.1,
      },
    ];

    // Total samples = 400.
    // TN weight = 100/400 = 0.25
    // MH weight = 300/400 = 0.75
    // Aggregated w[0] = 0.25 * 2.0 + 0.75 * 6.0 = 0.5 + 4.5 = 5.0
    // Aggregated w[1] = 0.25 * 4.0 + 0.75 * 8.0 = 1.0 + 6.0 = 7.0
    // Aggregated bias = 0.25 * 10 + 0.75 * 30 = 2.5 + 22.5 = 25.0
    const agg = computeSampleWeightedFedAvg(results);
    expect(agg.weights[0]).toBeCloseTo(5.0);
    expect(agg.weights[1]).toBeCloseTo(7.0);
    expect(agg.bias).toBeCloseTo(25.0);
  });

  it('trains local state model and decreases MSE loss', () => {
    // y = 3 * x + 5
    const X = [[1], [2], [3], [4], [5]];
    const y = [8, 11, 14, 17, 20];

    const initialLoss = computeMseLoss(X, y, { weights: [0], bias: 0 });
    const local = trainLocalStateModel(X, y, [0], 0, 10, 0.02, 0.0);

    expect(local.loss).toBeLessThan(initialLoss);
  });

  it('computes MAPE correctly', () => {
    const X = [[1], [2]];
    const y = [100, 200];
    // Perfect model
    const perfectModel = { weights: [100], bias: 0 };
    expect(computeMape(X, y, perfectModel)).toBe(0);

    // 10% overestimate model: predicted = 110, 210
    // (10/100 + 10/200) / 2 = (0.10 + 0.05)/2 = 7.5%
    const slightModel = { weights: [100], bias: 10 };
    expect(computeMape(X, y, slightModel)).toBeCloseTo(7.5);
  });
});
