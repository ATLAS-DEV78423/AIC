import { describe, it, expect } from 'vitest';
import { resolve } from '../src/resolver';
import { parse } from '../src/parser';
import { tokenize } from '../src/lexer';
import { REGISTRY } from '../src/registry';

function r(input: string) {
  const ast = parse(tokenize(input));
  return resolve(ast, REGISTRY);
}

describe('WFL Resolver', () => {
  it('resolves a simple button', () => {
    const result = r('btn::pri:"Click"');
    expect(result.componentName).toBe('Button');
    expect(result.props).toMatchObject({ variant: 'primary' });
    expect(result.content).toBe(':"Click"');
  });

  it('resolves a navbar with children', () => {
    const result = r('nav::gls > btn::pri');
    expect(result.componentName).toBe('Navbar');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].componentName).toBe('Button');
  });

  it('resolves edit overrides', () => {
    const result = r('btn::pri edi $bg::#ff5733');
    expect(result.props.style).toContain('#ff5733');
  });

  it('resolves theme modifiers to className', () => {
    const result = r('nav::gls');
    expect(result.className).toContain('backdrop-blur-md');
  });

  it('throws for unknown tokens', () => {
    expect(() => r('zzz')).toThrow('Unknown component token');
  });
});
