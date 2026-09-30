import { DemandForecastPoint, WeeklyConsumption } from '../types';

// Matrix inversion via Gauss-Jordan elimination with partial pivoting
export function invertMatrix(A: number[][]): number[][] {
  const n = A.length;
  // Clone and augment with identity matrix
  const M: number[][] = A.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    const temp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = temp;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) {
      // Degenerate matrix: fallback with ridge diagonal regularization
      return A.map((row, r) => row.map((_, c) => (r === c ? 0.01 : 0)));
    }

    for (let j = 0; j < 2 * n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = 0; j < 2 * n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row.slice(n));
}

// Ridge Regression Model
export interface RidgeModel {
  coefficients: number[];
  intercept: number;
  residualStdDev: number;
  featureMeans: number[];
  featureStdDevs: number[];
}

export function trainRidgeRegression(
  X: number[][],
  y: number[],
  lambda = 0.5
): RidgeModel {
  const n = X.length;
  const p = X[0].length;

  // 1. Standardize features for numerical stability
  const means: number[] = new Array(p).fill(0);
  const stds: number[] = new Array(p).fill(0);

  for (let j = 0; j < p; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += X[i][j];
    means[j] = sum / n;

    let varSum = 0;
    for (let i = 0; i < n; i++) {
      const diff = X[i][j] - means[j];
      varSum += diff * diff;
    }
    stds[j] = Math.sqrt(varSum / n) || 1.0;
  }

  // Mean of target
  const yMean = y.reduce((acc, v) => acc + v, 0) / n;

  // Normalized design matrix
  const Xnorm: number[][] = X.map((row) =>
    row.map((val, j) => (val - means[j]) / stds[j])
  );
  const yCentered: number[] = y.map((v) => v - yMean);

  // Compute XtX (p x p) and Xty (p x 1)
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      Xty[j] += Xnorm[i][j] * yCentered[i];
      for (let k = 0; k < p; k++) {
        XtX[j][k] += Xnorm[i][j] * Xnorm[i][k];
      }
    }
  }

  // Add L2 ridge penalty to diagonal
  for (let j = 0; j < p; j++) {
    XtX[j][j] += lambda;
  }

  // Solve for beta: beta = (XtX + lambda I)^-1 * Xty
  const invXtX = invertMatrix(XtX);
  const betaNormalized: number[] = new Array(p).fill(0);

  for (let i = 0; i < p; i++) {
    let sum = 0;
    for (let j = 0; j < p; j++) {
      sum += invXtX[i][j] * Xty[j];
    }
    betaNormalized[i] = sum;
  }

  // Convert back to original scale
  const coefficients: number[] = betaNormalized.map((b, j) => b / stds[j]);
  let intercept = yMean;
  for (let j = 0; j < p; j++) {
    intercept -= coefficients[j] * means[j];
  }

  // Compute residual standard deviation
  let sumSqResiduals = 0;
  for (let i = 0; i < n; i++) {
    let yHat = intercept;
    for (let j = 0; j < p; j++) {
      yHat += coefficients[j] * X[i][j];
    }
    const diff = y[i] - yHat;
    sumSqResiduals += diff * diff;
  }

  const dof = Math.max(1, n - p - 1);
  const residualStdDev = Math.sqrt(sumSqResiduals / dof);

  return {
    coefficients,
    intercept,
    residualStdDev,
    featureMeans: means,
    featureStdDevs: stds,
  };
}

// Extract tabular feature row from consumption history window
function extractFeatureRow(
  history: WeeklyConsumption[],
  index: number,
  futureSeasonWeek: number,
  outbreakMultiplier = 1.0
): number[] {
  // lag-1, lag-2, 4-week average
  const lag1 = index >= 1 ? history[index - 1].actualQuantity : history[index].actualQuantity;
  const lag2 = index >= 2 ? history[index - 2].actualQuantity : lag1;

  let sum4 = 0;
  let count4 = 0;
  for (let k = 1; k <= 4; k++) {
    if (index - k >= 0) {
      sum4 += history[index - k].actualQuantity;
      count4++;
    }
  }
  const ma4 = count4 > 0 ? sum4 / count4 : lag1;

  // Seasonal harmonic angles: sin and cos of week of year (1-52)
  const angle = (2 * Math.PI * futureSeasonWeek) / 52;
  const sinSeason = Math.sin(angle);
  const cosSeason = Math.cos(angle);

  // Weather index proxies
  const rainfall = index < history.length ? history[index].rainfallIndex : 0.2;
  const temp = index < history.length ? history[index].temperatureIndex : 0.5;

  // Outbreak flag with multiplier
  const outbreak = (index < history.length ? history[index].outbreakFlag : 0) * outbreakMultiplier;

  return [lag1, lag2, ma4, sinSeason, cosSeason, rainfall, temp, outbreak];
}

// Generate 4 to 8 week forward forecast with 80% and 95% prediction intervals
export function forecastDemand(
  history: WeeklyConsumption[],
  weeksAhead = 8,
  outbreakMultiplier = 1.0
): DemandForecastPoint[] {
  if (history.length < 10) {
    // Insufficient data fallback
    return [];
  }

  const X: number[][] = [];
  const y: number[] = [];

  for (let i = 4; i < history.length; i++) {
    const weekDate = new Date(history[i].date);
    const dayOfYear = Math.floor(
      (weekDate.getTime() - new Date(weekDate.getFullYear(), 0, 1).getTime()) / 86400000
    );
    const weekOfYear = Math.min(52, Math.max(1, Math.ceil(dayOfYear / 7)));

    X.push(extractFeatureRow(history, i, weekOfYear));
    y.push(history[i].actualQuantity);
  }

  const model = trainRidgeRegression(X, y, 0.7);

  // Auto-regressive multi-step rollout
  const forecast: DemandForecastPoint[] = [];
  const simulatedHistory = [...history];

  const lastDate = new Date(history[history.length - 1].date);

  for (let h = 1; h <= weeksAhead; h++) {
    const targetDate = new Date(lastDate.getTime() + h * 7 * 86400000);
    const dayOfYear = Math.floor(
      (targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 1).getTime()) / 86400000
    );
    const weekOfYear = Math.min(52, Math.max(1, Math.ceil(dayOfYear / 7)));

    const featureRow = extractFeatureRow(
      simulatedHistory,
      simulatedHistory.length,
      weekOfYear,
      outbreakMultiplier
    );

    // Point prediction
    let pred = model.intercept;
    for (let j = 0; j < model.coefficients.length; j++) {
      pred += model.coefficients[j] * featureRow[j];
    }

    // Apply outbreak multiplier directly to expected surge
    if (outbreakMultiplier > 1.0) {
      pred *= outbreakMultiplier;
    }

    pred = Math.max(1, Math.round(pred));

    // Horizon inflation for prediction interval
    const horizonFactor = Math.sqrt(1 + (h - 1) * 0.22);
    const se = model.residualStdDev * horizonFactor;

    const lower80 = Math.max(0, Math.round(pred - 1.282 * se));
    const upper80 = Math.round(pred + 1.282 * se);
    const lower95 = Math.max(0, Math.round(pred - 1.96 * se));
    const upper95 = Math.round(pred + 1.96 * se);

    forecast.push({
      weekOffset: h,
      targetDate: targetDate.toISOString().slice(0, 10),
      predictedDemand: pred,
      lowerBound80: lower80,
      upperBound80: upper80,
      lowerBound95: lower95,
      upperBound95: upper95,
    });

    // Feed forward for auto-regressive step
    simulatedHistory.push({
      weekIndex: simulatedHistory.length,
      date: targetDate.toISOString().slice(0, 10),
      actualQuantity: pred,
      rainfallIndex: featureRow[5],
      temperatureIndex: featureRow[6],
      outbreakFlag: outbreakMultiplier > 1 ? 1 : 0,
    });
  }

  return forecast;
}
