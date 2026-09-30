import { describe, expect, it } from 'vitest';
import { forecastDemand, invertMatrix, trainRidgeRegression } from '../regression';
import { WeeklyConsumption } from '../../types';

describe('Regression & Forecasting Engine', () => {
  it('correctly inverts an identity and invertible 2x2 matrix', () => {
    const I = [
      [1, 0],
      [0, 1],
    ];
    const invI = invertMatrix(I);
    expect(invI[0][0]).toBeCloseTo(1);
    expect(invI[1][1]).toBeCloseTo(1);

    const A = [
      [4, 7],
      [2, 6],
    ];
    const invA = invertMatrix(A);
    // det(A) = 24 - 14 = 10 -> inv: [0.6, -0.7; -0.2, 0.4]
    expect(invA[0][0]).toBeCloseTo(0.6);
    expect(invA[0][1]).toBeCloseTo(-0.7);
    expect(invA[1][0]).toBeCloseTo(-0.2);
    expect(invA[1][1]).toBeCloseTo(0.4);
  });

  it('trains ridge regression on linear synthetic data', () => {
    // y = 2 * x1 + 3 * x2 + 10
    const X = [
      [1, 1],
      [2, 1],
      [3, 2],
      [4, 2],
      [5, 3],
      [6, 3],
    ];
    const y = X.map(([x1, x2]) => 2 * x1 + 3 * x2 + 10);

    const model = trainRidgeRegression(X, y, 0.01);
    expect(model.coefficients.length).toBe(2);
    expect(model.coefficients[0]).toBeGreaterThan(1.5);
    expect(model.coefficients[1]).toBeGreaterThan(2.0);
  });

  it('generates multi-step demand forecast with valid intervals', () => {
    const mockHistory: WeeklyConsumption[] = [];
    const baseDate = new Date('2026-01-01');

    for (let i = 0; i < 26; i++) {
      const d = new Date(baseDate.getTime() + i * 7 * 86400000);
      mockHistory.push({
        weekIndex: i,
        date: d.toISOString().slice(0, 10),
        actualQuantity: 500 + Math.sin((2 * Math.PI * i) / 52) * 100,
        rainfallIndex: 0.2,
        temperatureIndex: 0.5,
        outbreakFlag: 0,
      });
    }

    const forecast = forecastDemand(mockHistory, 4, 1.0);
    expect(forecast.length).toBe(4);
    for (const pt of forecast) {
      expect(pt.predictedDemand).toBeGreaterThan(0);
      expect(pt.lowerBound80).toBeLessThanOrEqual(pt.predictedDemand);
      expect(pt.upperBound80).toBeGreaterThanOrEqual(pt.predictedDemand);
      expect(pt.lowerBound95).toBeLessThanOrEqual(pt.lowerBound80);
      expect(pt.upperBound95).toBeGreaterThanOrEqual(pt.upperBound80);
    }
  });
});
