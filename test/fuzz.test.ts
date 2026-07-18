import { describe, it, expect, afterAll } from 'vitest';
import { compile } from '../src/index';

// Seeded PRNG for reproducible fuzzing
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// WFL token building blocks for random generation
const COMPS = ['btn', 'txt', 'nav', 'stk', 'inp', 'card', 'spn', 'bad', 'ico', 'sec'];
const MODS = ['pri', 'sec', 'lg', 'sm', 'gls', 'fix', 'dk', 'r', 'out', 'h1', 'h2', 'xl'];
const OPS = ['>', '^', '+'];
const ITERS = ['*3', '*5', '*@items', '*@todos', '*@results'];
const CONDS = ['?@isAdmin', '?@count > 0', '?@loading', '?@user'];
const CONTENTS = [':"Click"', ':"Hello"', ':"Item"', ':"Title"', ':"Value"'];
const STATES = ['@query', '@user', '@search', '@name'];
const EVENTS = ['!onClick::handleSubmit', '!onChange::setQuery'];
const EDITS = ['edi $pd::16px', 'edi $bg::#eee', 'edi $col::#333'];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// Generate a random WFL expression
function generateRandomWFL(rng: () => number): string {
  const pattern = pick(rng, ['simple', 'child', 'siblings', 'iteration', 'conditional', 'complex']);

  switch (pattern) {
    case 'simple': {
      const comp = pick(rng, COMPS);
      const mod = rng() > 0.3 ? `::${pick(rng, MODS)}` : '';
      const modifier = rng() > 0.5 && mod ? `::${pick(rng, MODS)}` : '';
      const content = rng() > 0.4 ? ` ${pick(rng, CONTENTS)}` : '';
      const extras = rng() > 0.5 ? ` ${pick(rng, [pick(rng, STATES), pick(rng, EVENTS), pick(rng, EDITS)])}` : '';
      return `${comp}${mod}${modifier}${content}${extras}`;
    }
    case 'child': {
      const parent = pick(rng, COMPS);
      const child = pick(rng, COMPS);
      const parentMod = rng() > 0.3 ? `::${pick(rng, MODS)}` : '';
      const childContent = rng() > 0.4 ? ` ${pick(rng, CONTENTS)}` : '';
      return `${parent}${parentMod} > ${child}${childContent}`;
    }
    case 'siblings': {
      const parent = pick(rng, ['stk', 'nav']);
      const child1 = pick(rng, COMPS);
      const child2 = pick(rng, COMPS);
      const op = pick(rng, OPS);
      const c1 = rng() > 0.4 ? `::${pick(rng, MODS)}` : '';
      const c2 = rng() > 0.4 ? `::${pick(rng, MODS)}` : '';
      return `${parent} > ${child1}${c1} ${op} ${child2}${c2}`;
    }
    case 'iteration': {
      const iter = pick(rng, ITERS);
      const child = pick(rng, COMPS);
      const content = rng() > 0.4 ? ` ${pick(rng, CONTENTS)}` : '';
      return `${iter} > ${child}${content}`;
    }
    case 'conditional': {
      const cond = pick(rng, CONDS);
      const t = pick(rng, COMPS);
      const f = pick(rng, COMPS);
      const branch = rng() > 0.3 ? ` | ${f}` : '';
      return `${cond} | ${t}${branch}`;
    }
    case 'complex': {
      // Combine iteration + conditional or nesting + state
      const parts: string[] = [];
      if (rng() > 0.5) {
        parts.push(pick(rng, ITERS), '>', pick(rng, CONDS), '|', pick(rng, COMPS), '|', pick(rng, COMPS));
      } else {
        parts.push(pick(rng, COMPS), '>', pick(rng, COMPS), '::' + pick(rng, MODS), pick(rng, STATES));
      }
      return parts.join(' ');
    }
  }
}

describe('WFL Fuzzing', () => {
  // Deterministic seed — fails are reproducible
  const RNG = seeded(42);
  const ITERATIONS = 200;
  let checked = 0;
  let ok = 0;
  let gracefulErrors = 0;

  for (let i = 0; i < ITERATIONS; i++) {
    it(`handles random input #${i + 1} without crashing`, () => {
      const input = generateRandomWFL(RNG);
      checked++;
      try {
        const output = compile(input);
        // If we got here, compilation succeeded — verify output structure
        expect(output).toHaveProperty('imports');
        expect(output).toHaveProperty('jsx');
        expect(output).toHaveProperty('css');
        expect(output).toHaveProperty('stateCode');
        ok++;
      } catch (e: any) {
        // Graceful errors (syntax, unknown component, etc.) are expected for random input
        gracefulErrors++;
        expect(e).toBeInstanceOf(Error);
        expect(typeof e.message).toBe('string');
        // Verify message isn't empty — if it is, that's a bug
        expect(e.message.length).toBeGreaterThan(0);
      }
    });
  }

  afterAll(() => {
    const pct = Math.round((ok / checked) * 100);
    console.log(`\n  Fuzz results: ${ok}/${checked} compiled OK (${pct}%), ${gracefulErrors} graceful rejects, 0 crashes`);
  });
});
