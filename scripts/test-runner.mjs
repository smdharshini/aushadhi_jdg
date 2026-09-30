// Lightweight unit test runner using native Node.js
import assert from 'node:assert';

// Shim vitest
globalThis.describe = (name, fn) => {
  console.log(`\n--- Test Suite: ${name} ---`);
  fn();
};

let passed = 0;
let failed = 0;

globalThis.it = (name, fn) => {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    failed++;
  }
};

globalThis.expect = (actual) => {
  const matcher = {
    toBe: (expected) => {
      assert.strictEqual(actual, expected);
      return matcher;
    },
    toBeCloseTo: (expected, numDigits = 2) => {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -numDigits) / 2;
      assert.ok(
        diff <= tolerance,
        `Expected ${actual} to be close to ${expected} with tolerance ${tolerance} (diff: ${diff})`
      );
      return matcher;
    },
    toBeGreaterThan: (expected) => {
      assert.ok(actual > expected, `Expected ${actual} > ${expected}`);
      return matcher;
    },
    toBeGreaterThanOrEqual: (expected) => {
      assert.ok(actual >= expected, `Expected ${actual} >= ${expected}`);
      return matcher;
    },
    toBeLessThan: (expected) => {
      assert.ok(actual < expected, `Expected ${actual} < ${expected}`);
      return matcher;
    },
    toBeLessThanOrEqual: (expected) => {
      assert.ok(actual <= expected, `Expected ${actual} <= ${expected}`);
      return matcher;
    },
    toBeNull: () => {
      assert.strictEqual(actual, null);
      return matcher;
    },
    toBeDefined: () => {
      assert.notStrictEqual(actual, undefined);
      return matcher;
    },
    toEqual: (expected) => {
      assert.deepStrictEqual(actual, expected);
      return matcher;
    },
    not: {
      toBeNull: () => {
        assert.notStrictEqual(actual, null);
      },
    },
  };
  return matcher;
};

// Test imports
console.log('Loading math engines and tests...');
import '../src/math/__tests__/federated.test.ts';
import '../src/math/__tests__/metrics.test.ts';
import '../src/math/__tests__/redistribution.test.ts';
import '../src/math/__tests__/regression.test.ts';

console.log(`\n========================================`);
console.log(`Test Execution Finished: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
