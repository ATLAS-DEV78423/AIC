import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { generate } from '../src/generator';
import { compile, formatComponentOutput } from '../src/index';
import { REGISTRY } from '../src/registry';
import { Registry } from '../src/types';

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

  it('compiles multi-line WFL into a page', () => {
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"\nsec::hero::dk > txt::h1::xl:"Welcome"';
    const output = compile(input);
    expect(output.imports).toContainEqual({ path: '@/components/layout/navbar', name: 'Navbar' });
    expect(output.imports).toContainEqual({ path: '@/components/layout/section', name: 'Section' });
    expect(output.jsx).toContain('<Navbar');
    expect(output.jsx).toContain('<Section');
    expect(output.jsx).toContain('<main>');
  });

  it('compiles iteration *3 > btn', () => {
    const input = '*3 > btn::pri:"Item"';
    const output = compile(input);
    const btnMatches = output.jsx.match(/<Button[ >]/g);
    expect(btnMatches).toHaveLength(3);
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
  });

  it('compiles conditional ?@isAdmin | btn | txt', () => {
    const input = '?@isAdmin | btn::del:"Delete" | txt:"No access"';
    const output = compile(input);
    expect(output.jsx).toContain('{isAdmin ?');
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
    expect(output.imports).toContainEqual({ path: '@/components/typography/text', name: 'Text' });
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
        component: 'Greeting',
        importPath: '@/components/custom/greeting',
        defaultProps: { message: 'Hello' },
        variantProps: {},
        modifiers: {},
      },
    };
    const output = compile('greet:"Hi"', customReg);
    expect(output.imports).toContainEqual({ path: '@/components/custom/greeting', name: 'Greeting' });
    expect(output.jsx).toContain('Greeting');
    expect(output.jsx).toContain('Hi');
  });

  it('compiles [slot] children as JSX props', () => {
    const input = 'card > [header]txt::h1:"Title" [body]txt::p:"Content"';
    const output = compile(input);
    expect(output.jsx).toMatch(/header=\{[\s\S]*?<Text/);
    expect(output.jsx).toMatch(/body=\{[\s\S]*?<Text/);
    expect(output.jsx).toContain('Title');
    expect(output.jsx).toContain('Content');
  });

  it('compiles nested iteration *@categories > *@items > card', () => {
    const output = compile('*@categories > *@items > card');
    expect(output.jsx).toContain('{categories.map');
    expect(output.jsx).toContain('item.items.map');
    expect(output.imports).toContainEqual({ path: '@/components/ui/card', name: 'Card' });
  });

  it('rejects unknown component in custom-only registry', () => {
    const customReg: Registry = {
      mycomp: {
        component: 'MyComp',
        importPath: './mycomp',
        defaultProps: {},
        variantProps: {},
        modifiers: {},
      },
    };
    expect(() => compile('btn', customReg)).toThrow('Unknown component token');
  });

  describe('formatComponentOutput', () => {
    it('wraps output in "use client" and default export', () => {
      const output = compile('btn::pri:"Click"');
      const file = formatComponentOutput(output);
      expect(file.startsWith('"use client"')).toBe(true);
      expect(file).toContain('export default function Page()');
      expect(file).toContain('<Button');
    });

    it('includes all imports', () => {
      const output = compile('nav::gls > btn::pri:"Click"');
      const file = formatComponentOutput(output);
      expect(file).toContain('import { Navbar } from');
      expect(file).toContain('import { Button } from');
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
