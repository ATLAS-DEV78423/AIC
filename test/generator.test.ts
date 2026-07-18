import { describe, it, expect } from 'vitest';
import { generate } from '../src/generator';
import { ResolvedComponent } from '../src/types';

describe('WFL Generator', () => {
  it('generates JSX from resolved component', () => {
    const resolved: ResolvedComponent = {
      element: 'btn',
      componentName: 'Button',
      importPath: '@/components/ui/button',
      props: { variant: 'primary' },
      className: '',
      animations: [],
      content: ':"Click"',
      children: [],
      events: [],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('<Button');
    expect(result.jsx).toContain('variant="primary"');
  });

  it('generates imports', () => {
    const resolved: ResolvedComponent = {
      element: 'btn',
      componentName: 'Button',
      importPath: '@/components/ui/button',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.imports).toContainEqual({
      path: '@/components/ui/button',
      name: 'Button',
    });
  });

  it('handles non-string props', () => {
    const resolved: ResolvedComponent = {
      element: 'inp',
      componentName: 'Input',
      importPath: '@/components/ui/input',
      props: { disabled: true, maxLength: 100 },
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('disabled={true}');
    expect(result.jsx).toContain('maxLength={100}');
  });

  it('generates nested components', () => {
    const resolved: ResolvedComponent = {
      element: 'nav',
      componentName: 'Navbar',
      importPath: '@/components/layout/navbar',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [{
        element: 'btn',
        componentName: 'Button',
        importPath: '@/components/ui/button',
        props: { variant: 'primary' },
        className: '',
        content: ':"Go"',
        children: [],
        events: [],
        state: null,
        iteration: null,
        iterationKey: null,
        conditional: null,
      }],
      events: [],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('<Navbar');
    expect(result.jsx).toContain('<Button');
    expect(result.jsx).toContain('Go');
  });

  it('generates event attributes', () => {
    const resolved: ResolvedComponent = {
      element: 'btn',
      componentName: 'Button',
      importPath: '@/components/ui/button',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [{ handler: '!onClick', callback: 'handleClick' }],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('onClick={handleClick}');
  });

  it('uses self-closing tag for elements with no children or content', () => {
    const resolved: ResolvedComponent = {
      element: 'img',
      componentName: 'Image',
      importPath: 'next/image',
      props: { alt: '' },
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toMatch(/<Image[^>]*\/>/);
  });

  it('generates literal iteration JSX', () => {
    const resolved: ResolvedComponent = {
      element: '',
      componentName: '',
      importPath: '',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [{
        element: 'btn',
        componentName: 'Button',
        importPath: '@/components/ui/button',
        props: { variant: 'primary' },
        className: '',
        animations: [],
        content: ':"Go"',
        children: [],
        events: [],
        state: null,
        iteration: null,
        iterationKey: null,
        conditional: null,
      }],
      events: [],
      state: null,
      iteration: { kind: 'literal', count: 3 },
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    const btnMatches = result.jsx.match(/<Button/g);
    expect(btnMatches).toHaveLength(3);
  });

  it('uses index as fallback key when no $key specified', () => {
    const resolved: ResolvedComponent = {
      element: '',
      componentName: '',
      importPath: '',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [{
        element: 'btn',
        componentName: 'Button',
        importPath: '@/components/ui/button',
        props: {},
        className: '',
        animations: [],
        content: null,
        children: [],
        events: [],
        state: null,
        iteration: null,
        iterationKey: null,
        conditional: null,
      }],
      events: [],
      state: null,
      iteration: { kind: 'stateRef', name: '@items' },
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('key={i}');
  });

  it('uses $key property for React key when specified', () => {
    const resolved: ResolvedComponent = {
      element: '',
      componentName: '',
      importPath: '',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [{
        element: 'btn',
        componentName: 'Button',
        importPath: '@/components/ui/button',
        props: {},
        className: '',
        animations: [],
        content: null,
        children: [],
        events: [],
        state: null,
        iteration: null,
        iterationKey: 'id',
        conditional: null,
      }],
      events: [],
      state: null,
      iteration: { kind: 'stateRef', name: '@items' },
      iterationKey: 'id',
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('key={item.id}');
  });

  it('generates conditional JSX (true branch only)', () => {
    const resolved: ResolvedComponent = {
      element: '',
      componentName: '',
      importPath: '',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [{
        element: 'ava',
        componentName: 'Avatar',
        importPath: '@/components/ui/avatar',
        props: {},
        className: '',
        animations: [],
        content: null,
        children: [],
        events: [],
        state: null,
        iteration: null,
        iterationKey: null,
        conditional: null,
      }],
      events: [],
      state: null,
      iteration: null,
      iterationKey: null,
      conditional: { variable: '?@user', falseBranch: null },
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('{user &&');
  });

  it('generates conditional JSX with false branch', () => {
    const resolved: ResolvedComponent = {
      element: '',
      componentName: '',
      importPath: '',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [{
        element: 'btn',
        componentName: 'Button',
        importPath: '@/components/ui/button',
        props: { variant: 'primary' },
        className: '',
        animations: [],
        content: ':"Go"',
        children: [],
        events: [],
        state: null,
        iteration: null,
        iterationKey: null,
        conditional: null,
      }],
      events: [],
      state: null,
      iteration: null,
      iterationKey: null,
      conditional: {
        variable: '?@isAdmin',
        falseBranch: {
          element: 'txt',
          componentName: 'Text',
          importPath: '@/components/typography/text',
          props: {},
          className: '',
          animations: [],
          content: ':"No access"',
          children: [],
          events: [],
          state: null,
          iteration: null,
          iterationKey: null,
          conditional: null,
        },
      },
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('{isAdmin ?');
    expect(result.jsx).toContain(':');
  });

  it('generates useState import and stateCode for state variables', () => {
    const resolved: ResolvedComponent = {
      element: 'inp',
      componentName: 'Input',
      importPath: '@/components/ui/input',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [{ handler: '!onChange', callback: 'setQuery' }],
      state: '@query',
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.stateCode).toContain('const [query, setQuery]');
    expect(result.imports).toContainEqual({ path: 'react', name: 'useState' });
  });

  it('auto-binds state variable to value prop', () => {
    const resolved: ResolvedComponent = {
      element: 'inp',
      componentName: 'Input',
      importPath: '@/components/ui/input',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [],
      state: '@query',
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('value={query}');
  });

  it('generates CSS keyframes for animated components', () => {
    const resolved: ResolvedComponent = {
      element: 'txt',
      componentName: 'Text',
      importPath: '@/components/typography/text',
      props: {},
      className: 'anim-fade',
      animations: ['~fade'],
      content: null,
      children: [],
      events: [],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.css).toContain('@keyframes anim-fade');
    expect(result.css).toContain('.anim-fade');
  });

  it('wraps onChange callback in (e) => setVar(e.target.value) when state matches', () => {
    const resolved: ResolvedComponent = {
      element: 'inp',
      componentName: 'Input',
      importPath: '@/components/ui/input',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [{ handler: '!onChange', callback: 'setQuery' }],
      state: '@query',
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('onChange={(e) => setQuery(e.target.value)}');
  });

  it('does not wrap non-onChange events', () => {
    const resolved: ResolvedComponent = {
      element: 'btn',
      componentName: 'Button',
      importPath: '@/components/ui/button',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: [],
      events: [{ handler: '!onClick', callback: 'handleClick' }],
      state: null,
      iterationKey: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('onClick={handleClick}');
  });
});
