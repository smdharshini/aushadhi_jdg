import { FederatedModelWeights, StateId } from '../types';

export interface LocalTrainingResult {
  stateId: StateId;
  sampleCount: number;
  weights: number[];
  bias: number;
  localLoss: number;
}

export function computeSampleWeightedFedAvg(
  results: LocalTrainingResult[]
): FederatedModelWeights {
  if (results.length === 0) {
    return { weights: [], bias: 0 };
  }

  const totalSamples = results.reduce((acc, r) => acc + r.sampleCount, 0);
  if (totalSamples === 0) {
    return { weights: results[0].weights.map(() => 0), bias: 0 };
  }

  const numWeights = results[0].weights.length;
  const aggregatedWeights: number[] = new Array(numWeights).fill(0);
  let aggregatedBias = 0;

  for (const res of results) {
    const weightFactor = res.sampleCount / totalSamples;
    for (let j = 0; j < numWeights; j++) {
      aggregatedWeights[j] += res.weights[j] * weightFactor;
    }
    aggregatedBias += res.bias * weightFactor;
  }

  return {
    weights: aggregatedWeights,
    bias: aggregatedBias,
  };
}

export function computeMape(
  X: number[][],
  y: number[],
  model: FederatedModelWeights
): number {
  if (X.length === 0 || y.length === 0) return 0;

  let sumPercentageError = 0;
  let validCount = 0;

  for (let i = 0; i < X.length; i++) {
    const actual = y[i];
    if (actual <= 0) continue;

    let predicted = model.bias;
    for (let j = 0; j < X[i].length; j++) {
      predicted += (model.weights[j] || 0) * X[i][j];
    }
    predicted = Math.max(1, predicted);

    const pe = Math.abs((actual - predicted) / actual) * 100;
    sumPercentageError += pe;
    validCount++;
  }

  return validCount > 0 ? Number((sumPercentageError / validCount).toFixed(2)) : 0;
}

export function computeMseLoss(
  X: number[][],
  y: number[],
  model: FederatedModelWeights
): number {
  if (X.length === 0 || y.length === 0) return 0;

  let sumSq = 0;
  for (let i = 0; i < X.length; i++) {
    let pred = model.bias;
    for (let j = 0; j < X[i].length; j++) {
      pred += (model.weights[j] || 0) * X[i][j];
    }
    const diff = y[i] - pred;
    sumSq += diff * diff;
  }

  return Number((sumSq / X.length).toFixed(2));
}

// Local Gradient Descent Epochs (runs inside state boundary)
export function trainLocalStateModel(
  X: number[][],
  y: number[],
  initialWeights: number[],
  initialBias: number,
  epochs = 5,
  learningRate = 0.005,
  l2Reg = 0.01
): { weights: number[]; bias: number; loss: number } {
  const n = X.length;
  const p = X[0].length;

  const weights = [...initialWeights];
  let bias = initialBias;

  for (let ep = 0; ep < epochs; ep++) {
    const gradW = new Array(p).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i++) {
      let pred = bias;
      for (let j = 0; j < p; j++) {
        pred += weights[j] * X[i][j];
      }
      const error = pred - y[i];

      gradB += error;
      for (let j = 0; j < p; j++) {
        gradW[j] += error * X[i][j];
      }
    }

    // Apply gradient update with L2 regularization
    bias -= (learningRate * gradB) / n;
    for (let j = 0; j < p; j++) {
      gradW[j] = gradW[j] / n + l2Reg * weights[j];
      weights[j] -= learningRate * gradW[j];
    }
  }

  const loss = computeMseLoss(X, y, { weights, bias });
  return { weights, bias, loss };
}
