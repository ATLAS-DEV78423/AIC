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

  it('resolves animation tokens to className', () => {
    const result = r('btn::pri ~bounce');
    expect(result.className).toContain('anim-bounce');
  });

  it('resolves multiple animations to classNames', () => {
    const result = r('txt::h1 ~fade ~slide300');
    expect(result.className).toContain('anim-fade');
    expect(result.className).toContain('anim-slide');
  });

  it('resolves iteration wrapping child', () => {
    const ast = parse(tokenize('*3 > btn::pri:"Item"'));
    const resolved = resolve(ast, REGISTRY);
    expect(resolved.iteration).not.toBeNull();
    expect(resolved.iteration!.kind).toBe('literal');
    expect(resolved.children).toHaveLength(1);
    expect(resolved.children[0].componentName).toBe('Button');
  });

  it('resolves conditional into wrapper node', () => {
    const ast = parse(tokenize('?@user | ava'));
    const resolved = resolve(ast, REGISTRY);
    expect(resolved.conditional).not.toBeNull();
    expect(resolved.conditional!.variable).toBe('?@user');
    expect(resolved.children[0].componentName).toBe('Avatar');
  });

  it('resolves $txt edit override as content replacement', () => {
    const ast = parse(tokenize('txt::h1:"Old" edi $txt::"New"'));
    const resolved = resolve(ast, REGISTRY);
    expect(resolved.content).toBe(':"New"');
  });

  it('resolves $pd and $mg as inline style', () => {
    const ast = parse(tokenize('btn::pri edi $pd::24px $mg::8px'));
    const resolved = resolve(ast, REGISTRY);
    expect(resolved.props.style).toContain('padding: 24px');
    expect(resolved.props.style).toContain('margin: 8px');
  });

  it('resolves $src as direct prop', () => {
    const ast = parse(tokenize('img edi $src::hero.jpg'));
    const resolved = resolve(ast, REGISTRY);
    expect(resolved.props.src).toBe('hero.jpg');
  });

  it('uses defaultContent from registry when no explicit content', () => {
    const result = r('btn::pri');
    expect(result.content).toBe(':"Button"');
  });
});
