import { describe, it, expect } from 'vitest';
import { compile } from '../src/index';

interface BenchCase {
  name: string;
  wfl: string;
  minRatio: number;
}

const CASES: BenchCase[] = [
  // Simple component — content and modifiers
  { name: 'simple component', wfl: 'btn::pri::lg:"Click"', minRatio: 2.0 },
  // Component with child
  { name: 'parent > child', wfl: 'nav > btn::pri:"Home"', minRatio: 2.5 },
  // Multi-line page
  { name: 'multi-line page', wfl: 'nav::gls > btn::pri:"Home"\nsec::hero > txt::h1:"Welcome"', minRatio: 3.0 },
  // Iteration with child
  { name: 'literal iteration', wfl: '*3 > card::out::sm:"Item"', minRatio: 2.5 },
  // Conditional with branches
  { name: 'conditional', wfl: '?@isAdmin | btn::del:"Delete" | txt:"No access"', minRatio: 2.5 },
  // Expression conditional
  { name: 'expression conditional', wfl: '?@count > 0 | spn | txt:"Empty"', minRatio: 2.0 },
  // State + event on input
  { name: 'state + event', wfl: 'inp::txt @query !onChange::setQuery', minRatio: 2.0 },
  // Complex — iteration + slot + conditional
  { name: 'complex combo', wfl: 'card > [header]txt::h1:"Title" [body]txt:"Content"', minRatio: 2.0 },
];

describe('WFL Compression Benchmark', () => {
  let totalRatio = 0;
  let totalWeight = 0;

  for (const c of CASES) {
    it(`compresses ${c.name} (≥${c.minRatio}×)`, () => {
      const wflTokens = c.wfl.split(/\s+/).length;
      const output = compile(c.wfl);
      const jsxTokens = output.jsx.split(/\s+/).length;
      const ratio = jsxTokens / wflTokens;

      expect(ratio).toBeGreaterThanOrEqual(c.minRatio);

      // Accumulate for average
      totalRatio += ratio;
      totalWeight++;
    });
  }

  it('maintains average compression ≥3× across all cases', () => {
    // totalRatio/totalWeight computed from the accumulated values above
    // These are test-level accumulators, so we check in last test
    const avg = totalRatio / totalWeight;
    expect(avg).toBeGreaterThanOrEqual(3.0);
    console.log(`\n  Average compression: ${avg.toFixed(2)}× across ${totalWeight} expressions`);
  });
});
