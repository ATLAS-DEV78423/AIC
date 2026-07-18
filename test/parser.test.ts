import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser.js';
import { tokenize } from '../src/lexer.js';
import type { ComponentNode } from '../src/types.js';

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
});
