import { describe, it, expect } from 'vitest';
import { compile } from '../src/index';
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { generate } from '../src/generator';
import { REGISTRY } from '../src/registry';

describe('WFL Edge Cases', () => {
  it('handles unicode in content', () => {
    const output = compile('txt:"Hello 🌍 世界 🎉"');
    expect(output.jsx).toContain('Hello 🌍 世界 🎉');
    expect(output.imports).toContainEqual({ path: '@/components/typography/text', name: 'Text' });
  });

  it('handles mixed whitespace (tabs, newlines)', () => {
    // Tab-separated tokens — lexer skips all whitespace
    const output = compile('nav\t>\tbtn::pri:"Tabbed"');
    expect(output.jsx).toContain('<Navbar');
    expect(output.jsx).toContain('<Button');
    expect(output.jsx).toContain('Tabbed');
  });

  it('handles deep nesting (200 levels)', () => {
    // Build deeply nested expression: stk > stk > ... > btn
    const depth = 200;
    const nested = Array.from({ length: depth }, () => 'stk > ').join('') + 'btn::pri:"Deep"';
    const output = compile(nested);
    // Should produce deeply nested <Stack> elements
    expect(output.jsx).toContain('<Stack');
    expect(output.jsx).toContain('Deep');
    expect(output.jsx).toMatch(/<Stack[ >]/g);
    // Count opening stacks
    const stackOpens = output.jsx.match(/<Stack[ >]/g);
    expect(stackOpens).toHaveLength(depth);
  });

  it('handles long modifier chains (30 modifiers)', () => {
    const mods = Array.from({ length: 30 }, (_, i) => `mod${i}`).join('::');
    const input = `btn::${mods}:"Long"`;
    const output = compile(input);
    expect(output.jsx).toContain('Long');
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
  });

  it('handles combined expression: iteration + conditional + state', () => {
    const input = '*@todos > ?@isAdmin | btn::del:"Delete" | txt:"No access" @query';
    const output = compile(input);
    // Iteration
    expect(output.jsx).toContain('todos.map');
    // Conditional
    expect(output.jsx).toContain('isAdmin ?');
    // State on false branch
    expect(output.stateCode).toContain('query');
    expect(output.jsx).toContain('value={query}');
    // Imports from both branches
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
    expect(output.imports).toContainEqual({ path: '@/components/typography/text', name: 'Text' });
  });

  it('handles iteration + state on child', () => {
    const output = compile('*3 > inp::txt @search !onChange::setSearch');
    expect(output.jsx).toContain('search');
    expect(output.stateCode).toContain('search');
    expect(output.imports).toContainEqual({ path: 'react', name: 'useState' });
  });

  it('handles empty string content as self-closing tag', () => {
    const output = compile('txt:""');
    expect(output.jsx).toContain('<Text');
    expect(output.jsx).toMatch(/\/>/); // empty content → self-closing
  });

  it('handles single-line multi-expression page with mixed features', () => {
    const input = [
      'nav::gls::fix > btn::pri:"Home" ^ btn::sec:"About"',
      'sec::hero::dk > txt::h1::xl:"Welcome"',
      '*3 > card::out::sm:"Item"',
      '?@user | ava::md | btn::pri:"Login"',
    ].join('\n');
    const output = compile(input);
    expect(output.jsx).toContain('<Navbar');
    expect(output.jsx).toContain('<main>');
    expect(output.jsx).toContain('{user ?');
    expect(output.imports).toContainEqual({ path: '@/components/ui/card', name: 'Card' });
    expect(output.imports).toContainEqual({ path: '@/components/ui/avatar', name: 'Avatar' });
  });
});
