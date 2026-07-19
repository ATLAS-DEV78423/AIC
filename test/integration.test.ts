import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { generate } from '../src/generator';
import { compile, formatComponentOutput } from '../src/index';
import { REGISTRY, REGISTRY_LIB } from '../src/registry';
import { Registry } from '../src/types';

describe('WFL Integration', () => {
  it('compiles a nav+button end-to-end with Tailwind classes', () => {
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"';
    const output = compile(input);
    // Native HTML tags, not component imports
    expect(output.imports.filter(i => i.path !== 'react')).toHaveLength(0);
    expect(output.jsx).toContain('<nav');
    expect(output.jsx).toContain('<button');
    expect(output.jsx).toContain('Get Started');
    // Tailwind classes present
    expect(output.jsx).toContain('backdrop-blur');
    expect(output.jsx).toContain('rounded-full');
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

  it('compiles multi-line WFL into a page', () => {
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"\nsec::hero::dk > txt::h1::xl:"Welcome"';
    const output = compile(input);
    // No external component imports in Tailwind mode
    expect(output.imports.filter(i => i.path !== 'react')).toHaveLength(0);
    expect(output.jsx).toContain('<nav');
    expect(output.jsx).toContain('<section');
    expect(output.jsx).toContain('<main>');
    expect(output.jsx).toContain('Welcome');
  });

  it('compiles iteration *3 > btn', () => {
    const input = '*3 > btn::pri:"Item"';
    const output = compile(input);
    const btnMatches = output.jsx.match(/<button[ >]/g);
    expect(btnMatches).toHaveLength(3);
  });

  it('compiles conditional ?@isAdmin | btn | txt', () => {
    const input = '?@isAdmin | btn::del:"Delete" | txt:"No access"';
    const output = compile(input);
    expect(output.jsx).toContain('{isAdmin ?');
    expect(output.jsx).toContain('Delete');
    expect(output.jsx).toContain('No access');
  });

  it('compiles expression conditional ?@count > 0', () => {
    const output = compile('?@count > 0 | btn::pri:"Show" | txt:"Empty"');
    expect(output.jsx).toContain('{count > 0 ?');
    expect(output.jsx).toContain('Show');
    expect(output.jsx).toContain('Empty');
  });

  it('compiles expression conditional ?@role == admin', () => {
    const output = compile("?@role == 'admin' | btn::pri:\"Panel\" | txt:\"Guest\"");
    expect(output.jsx).toContain("{role == 'admin' ?");
  });

  it('compiles expression conditional without false branch', () => {
    const output = compile('?@count > 0 | spn');
    expect(output.jsx).toContain('count > 0 &&');
  });

  it('compiles state variable with @query', () => {
    const input = 'inp::txt edi $pd::12px @query';
    const output = compile(input);
    expect(output.stateCode).toContain('const [query, setQuery]');
    expect(output.imports).toContainEqual({ path: 'react', name: 'useState' });
  });

  it('compiles with custom registry', () => {
    const customReg: Registry = {
      greet: {
        component: 'div',
        importPath: '',
        defaultProps: {},
        modifiers: {},
        defaultContent: 'Hello',
      },
    };
    const output = compile('greet', customReg);
    expect(output.jsx).toContain('<div');
    expect(output.jsx).toContain('Hello');
  });

  it('compiles [slot] children as JSX props', () => {
    const input = 'card > [header]txt::h1:"Title" [body]txt::p:"Content"';
    const output = compile(input);
    expect(output.jsx).toMatch(/header=\{[\s\S]*?<p/);
    expect(output.jsx).toMatch(/body=\{[\s\S]*?<p/);
    expect(output.jsx).toContain('Title');
    expect(output.jsx).toContain('Content');
  });

  it('compiles nested iteration *@categories > *@items > card', () => {
    const output = compile('*@categories > *@items > card');
    expect(output.jsx).toContain('{categories.map');
    expect(output.jsx).toContain('item.items.map');
  });

  it('rejects unknown component in custom-only registry', () => {
    const customReg: Registry = {
      mycomp: {
        component: 'MyComp',
        importPath: './mycomp',
        defaultProps: {},
        modifiers: {},
      },
    };
    expect(() => compile('btn', customReg)).toThrow('Unknown component token');
  });

  it('uses REGISTRY_LIB for component-mode imports when explicitly passed', () => {
    const output = compile('btn::pri:"Click"', REGISTRY_LIB);
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
    expect(output.jsx).toContain('<Button');
  });

  describe('formatComponentOutput', () => {
    it('wraps Tailwind output in "use client" and default export', () => {
      const output = compile('btn::pri:"Click"');
      const file = formatComponentOutput(output);
      expect(file.startsWith('"use client"')).toBe(true);
      expect(file).toContain('export default function Page()');
      expect(file).toContain('<button');
    });

    it('includes no external component imports in Tailwind mode', () => {
      const output = compile('nav::gls > btn::pri:"Click"');
      const file = formatComponentOutput(output);
      // No @/components imports in Tailwind mode
      expect(file).not.toContain('import { Navbar }');
      expect(file).not.toContain('import { Button }');
    });

    it('includes state declarations', () => {
      const output = compile('inp::txt @query');
      const file = formatComponentOutput(output);
      expect(file).toContain('const [query, setQuery]');
      expect(file).toContain('import { useState } from "react"');
    });

    it('uses custom component name', () => {
      const output = compile('btn::pri:"OK"');
      const file = formatComponentOutput(output, 'MyButton');
      expect(file).toContain('export default function MyButton()');
    });

    it('embeds CSS in style tag', () => {
      const output = compile('btn::pri ~fade');
      const file = formatComponentOutput(output);
      expect(file).toContain('<style>');
      expect(file).toContain('@keyframes');
    });
  });
});
