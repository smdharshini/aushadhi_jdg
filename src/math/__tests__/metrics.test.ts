import { describe, expect, it } from 'vitest';
import {
  calculateDaysOfCover,
  calculateStockoutProbability,
  classifyAlertSeverity,
  normalCdf,
} from '../metrics';

describe('Inventory & Risk Metrics', () => {
  it('computes days of cover accurately', () => {
    expect(calculateDaysOfCover(1400, 100)).toBe(14.0);
    expect(calculateDaysOfCover(0, 100)).toBe(0.0);
    expect(calculateDaysOfCover(500, 0)).toBe(999.0);
  });

  it('computes normal CDF accurately', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 4);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 2);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 2);
  });

  it('computes lead-time stock-out probability properly', () => {
    // 14 days lead time with 100/day = 1400 expected demand.
    // If current stock is 1400, stockout probability is approx 0.50 (50%).
    const probExact = calculateStockoutProbability(1400, 100, 14);
    expect(probExact).toBeGreaterThanOrEqual(0.45);
    expect(probExact).toBeLessThanOrEqual(0.55);

    // If current stock is 0, stockout probability is 1.0 (100%).
    expect(calculateStockoutProbability(0, 100, 14)).toBe(1.0);

    // If current stock is very high (e.g. 10000), stockout probability is ~0%.
    expect(calculateStockoutProbability(10000, 100, 14)).toBeCloseTo(0.0, 2);
  });

  it('classifies alert severity into correct tiers', () => {
    expect(classifyAlertSeverity(5, 0.8)).toBe('critical');
    expect(classifyAlertSeverity(12, 0.45)).toBe('warning');
    expect(classifyAlertSeverity(18, 0.2)).toBe('watch');
    expect(classifyAlertSeverity(35, 0.05)).toBeNull();
  });
});
