import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { generate } from '../src/generator';
import { REGISTRY } from '../src/registry';

describe('WFL Integration', () => {
  it('compiles a nav+button end-to-end', () => {
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"';
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    const output = generate(resolved);

    expect(output.imports).toContainEqual({ path: '@/components/layout/navbar', name: 'Navbar' });
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
    expect(output.jsx).toContain('<Navbar');
    expect(output.jsx).toContain('<Button');
    expect(output.jsx).toContain('Get Started');
  });

  it('measures token compression ratio', () => {
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"';
    const wflTokens = input.split(/\s+/).length;

    const tokens = tokenize(input);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    const output = generate(resolved);
    const generatedTokens = output.jsx.split(/\s+/).length;

    const ratio = generatedTokens / wflTokens;
    expect(ratio).toBeGreaterThanOrEqual(2);
  });

  it('handles empty input gracefully', () => {
    expect(() => parse(tokenize(''))).toThrow();
  });
});
