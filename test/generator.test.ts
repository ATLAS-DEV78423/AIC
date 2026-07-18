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
      content: ':"Click"',
      children: [],
      events: [],
      state: null,
      iteration: null,
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
      content: null,
      children: [],
      events: [],
      state: null,
      iteration: null,
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
      content: null,
      children: [],
      events: [],
      state: null,
      iteration: null,
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
        conditional: null,
      }],
      events: [],
      state: null,
      iteration: null,
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
      content: null,
      children: [],
      events: [{ handler: '!onClick', callback: 'handleClick' }],
      state: null,
      iteration: null,
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
      content: null,
      children: [],
      events: [],
      state: null,
      iteration: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toMatch(/<Image[^>]*\/>/);
  });
});
