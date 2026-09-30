import { AlertSeverity } from '../types';

// Cumulative Distribution Function for standard normal distribution using Abramowitz and Stegun approximation
export function normalCdf(z: number): number {
  if (z < -8.0) return 0.0;
  if (z > 8.0) return 1.0;

  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.3989422804; // 1 / sqrt(2 * pi)

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const pdf = c * Math.exp(-0.5 * absZ * absZ);
  const cdf = 1.0 - pdf * poly;

  return z >= 0.0 ? cdf : 1.0 - cdf;
}

export function calculateDaysOfCover(
  usableStock: number,
  dailyDemandForecast: number
): number {
  if (dailyDemandForecast <= 0) return 999.0;
  if (usableStock <= 0) return 0.0;
  return Number((usableStock / dailyDemandForecast).toFixed(1));
}

export function calculateStockoutProbability(
  currentStock: number,
  dailyDemandForecast: number,
  leadTimeDays = 14,
  covDaily = 0.3 // Coefficient of variation of daily demand
): number {
  if (currentStock <= 0) return 1.0;
  if (dailyDemandForecast <= 0) return 0.0;

  const expectedLeadTimeDemand = dailyDemandForecast * leadTimeDays;
  const leadTimeStdDev = expectedLeadTimeDemand * (covDaily / Math.sqrt(leadTimeDays)) * Math.sqrt(leadTimeDays);

  if (leadTimeStdDev <= 0) {
    return currentStock < expectedLeadTimeDemand ? 1.0 : 0.0;
  }

  const z = (currentStock - expectedLeadTimeDemand) / leadTimeStdDev;
  // Stock-out occurs if Demand > CurrentStock, i.e., 1 - CDF(z)
  const probStockout = 1.0 - normalCdf(z);

  return Number(Math.max(0.0, Math.min(1.0, probStockout)).toFixed(3));
}

export function classifyAlertSeverity(
  daysOfCover: number,
  stockoutProbability: number
): AlertSeverity | null {
  if (daysOfCover < 8 || stockoutProbability >= 0.7) {
    return 'critical';
  }
  if (daysOfCover <= 14 || stockoutProbability >= 0.4) {
    return 'warning';
  }
  if (daysOfCover <= 21) {
    return 'watch';
  }
  return null;
}
