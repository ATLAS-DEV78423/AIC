import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser.js';
import { tokenize } from '../src/lexer.js';
import type { ComponentNode, IterationNode, ConditionalNode } from '../src/types.js';

function p(input: string): ComponentNode {
  return parse(tokenize(input)) as ComponentNode;
}

describe('WFL Parser', () => {
  it('parses a simple component with modifiers', () => {
    const ast = p('btn::pri::lg');
    expect(ast.type).toBe('component');
    expect(ast.element).toBe('btn');
    expect(ast.modifiers).toEqual(['pri', 'lg']);
  });

  it('parses component with content', () => {
    const ast = p('btn::pri:"Click"');
    expect(ast.content).toBe(':"Click"');
  });

  it('parses child nesting', () => {
    const ast = p('nav > btn::pri');
    expect(ast.element).toBe('nav');
    expect(ast.children).toHaveLength(1);
    const child = ast.children[0] as ComponentNode;
    expect(child.element).toBe('btn');
  });

  it('parses edit overrides', () => {
    const ast = p('btn::pri edi $bg::#000');
    expect(ast.edits).toHaveLength(1);
    expect(ast.edits[0].property).toBe('$bg');
    expect(ast.edits[0].value).toBe('#000');
  });

  it('parses event bindings', () => {
    const ast = p('btn !onClick::handleSubmit');
    expect(ast.events).toHaveLength(1);
    expect(ast.events[0].handler).toBe('!onClick');
    expect(ast.events[0].callback).toBe('handleSubmit');
  });

  it('parses component with state variable', () => {
    const ast = p('inp @query');
    expect(ast.state).toBe('@query');
  });

  it('parses multiple modifiers in chain', () => {
    const ast = p('btn::pri::lg::rnd');
    expect(ast.modifiers).toEqual(['pri', 'lg', 'rnd']);
  });

  it('parses complex landing page', () => {
    const ast = p('nav::gls::fix > btn::pri::r:"Get Started"');
    expect(ast.element).toBe('nav');
    expect(ast.children).toHaveLength(1);
    const child = ast.children[0] as ComponentNode;
    expect(child.element).toBe('btn');
    expect(child.modifiers).toContain('pri');
    expect(child.content).toBe(':"Get Started"');
  });

  it('parses state variable at root level', () => {
    const input = '@query';
    const tokens = tokenize(input);
    expect(() => parse(tokens)).not.toThrow();
  });

  it('handles empty token array', () => {
    const tokens = tokenize('');
    expect(() => parse(tokens)).toThrow();
  });

  it('parses vertical siblings with ^', () => {
    const ast = p('stk::v > txt:"A" ^ txt:"B"');
    expect(ast.element).toBe('stk');
    expect(ast.children).toHaveLength(2);
    const child1 = ast.children[0] as ComponentNode;
    const child2 = ast.children[1] as ComponentNode;
    expect(child1.element).toBe('txt');
    expect(child2.element).toBe('txt');
  });

  it('parses animation directives on component', () => {
    const ast = p('btn::pri ~fade300 ~bounce');
    expect(ast.animations).toEqual(['~fade300', '~bounce']);
  });

  it('parses component with animation and content', () => {
    const ast = p('txt::h1 ~fade:"Hello"');
    expect(ast.animations).toContain('~fade');
    expect(ast.content).toBe(':"Hello"');
  });

  it('parses iteration *3 > card', () => {
    const ast = parse(tokenize('*3 > card'));
    expect(ast.type).toBe('iteration');
    if (ast.type === 'iteration') {
      expect(ast.source).toEqual({ kind: 'literal', count: 3 });
      expect(ast.child.type).toBe('component');
    }
  });

  it('parses state-based iteration *@todos > card', () => {
    const ast = parse(tokenize('*@todos > card'));
    expect(ast.type).toBe('iteration');
    if (ast.type === 'iteration') {
      expect(ast.source).toEqual({ kind: 'stateRef', name: '@todos' });
    }
  });

  it('parses conditional ?@user | avatar', () => {
    const ast = parse(tokenize('?@user | ava'));
    expect(ast.type).toBe('conditional');
    if (ast.type === 'conditional') {
      expect(ast.variable).toBe('?@user');
      expect(ast.trueBranch.type).toBe('component');
      expect(ast.falseBranch).toBeNull();
    }
  });

  it('parses parenthesized group as synthetic wrapper', () => {
    const ast = parse(tokenize('nav > (btn::pri + btn::sec)'));
    expect(ast.type).toBe('component');
    if (ast.type === 'component') {
      expect(ast.element).toBe('nav');
      expect(ast.children).toHaveLength(1);
      const group = ast.children[0];
      if ('children' in group) {
        expect((group as any).children).toHaveLength(2);
      }
    }
  });

  it('parses [header] slot on children', () => {
    const ast = p('card > [header]txt::h1:"Title" [body]txt::p:"Content"');
    expect(ast.children).toHaveLength(2);
    expect((ast.children[0] as any).slot).toBe('header');
    expect((ast.children[1] as any).slot).toBe('body');
  });
});
