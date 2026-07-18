import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer.js';

describe('WFL Lexer', () => {
  it('tokenizes a simple component with content', () => {
    const tokens = tokenize('btn::pri:"Click"');
    expect(tokens).toEqual([
      { type: 'TYPE', value: 'btn', position: 0 },
      { type: 'MOD_SEP', value: '::', position: 3 },
      { type: 'MOD', value: 'pri', position: 5 },
      { type: 'CONTENT', value: ':"Click"', position: 8 },
    ]);
  });

  it('tokenizes child nesting with >', () => {
    const tokens = tokenize('nav > btn');
    expect(tokens).toEqual([
      { type: 'TYPE', value: 'nav', position: 0 },
      { type: 'CHILD', value: '>', position: 4 },
      { type: 'TYPE', value: 'btn', position: 6 },
    ]);
  });

  it('tokenizes horizontal siblings with +', () => {
    const tokens = tokenize('btn::pri + btn::sec');
    expect(tokens).toContainEqual({ type: 'SIBLING_H', value: '+', position: 9 });
  });

  it('tokenizes vertical siblings with ^', () => {
    const tokens = tokenize('txt::h1 ^ txt::p');
    expect(tokens).toContainEqual({ type: 'SIBLING_V', value: '^', position: 8 });
  });

  it('tokenizes edit overrides', () => {
    const tokens = tokenize('btn edi $bg::#000');
    expect(tokens).toContainEqual({ type: 'EDIT', value: 'edi', position: 4 });
    expect(tokens).toContainEqual({ type: 'THEME', value: '$bg', position: 8 });
  });

  it('tokenizes event bindings', () => {
    const tokens = tokenize('btn !onClick::handleSubmit');
    expect(tokens).toContainEqual({ type: 'EVENT', value: '!onClick', position: 4 });
  });

  it('tokenizes state variables', () => {
    const tokens = tokenize('@user');
    expect(tokens).toEqual([{ type: 'STATE', value: '@user', position: 0 }]);
  });

  it('tokenizes literal iteration', () => {
    const tokens = tokenize('*3 > card');
    expect(tokens).toEqual([
      { type: 'ITERATE', value: '*3', position: 0 },
      { type: 'CHILD', value: '>', position: 3 },
      { type: 'TYPE', value: 'card', position: 5 },
    ]);
  });

  it('tokenizes state-based iteration', () => {
    const tokens = tokenize('*@todos > card');
    expect(tokens).toContainEqual({ type: 'ITERATE', value: '*@todos', position: 0 });
  });

  it('tokenizes conditionals', () => {
    const tokens = tokenize('?@user | avatar');
    expect(tokens).toContainEqual({ type: 'CONDITIONAL', value: '?@user', position: 0 });
    expect(tokens).toContainEqual({ type: 'PIPE', value: '|', position: 7 });
  });

  it('returns empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('strips comments (lines starting with #)', () => {
    const tokens = tokenize('btn::pri # this is a comment');
    expect(tokens).not.toContainEqual(expect.objectContaining({ type: 'TYPE', value: '#' }));
    expect(tokens.some(t => t.value === '#')).toBe(false);
  });

  it('handles complex landing page input', () => {
    const input = `nav::gls::fix > btn::pri::r:"Get Started"`;
    const tokens = tokenize(input);
    expect(tokens.length).toBeGreaterThan(5);
    expect(tokens[0]).toEqual({ type: 'TYPE', value: 'nav', position: 0 });
  });

  it('tokenizes theme directives', () => {
    const tokens = tokenize('$thm::dark');
    expect(tokens[0]).toEqual({ type: 'THEME', value: '$thm', position: 0 });
  });

  it('strips leading/trailing whitespace', () => {
    const tokens = tokenize('  btn::pri  ');
    expect(tokens[0]).toEqual({ type: 'TYPE', value: 'btn', position: 2 });
  });

  it('tokenizes animation directives', () => {
    const tokens = tokenize('btn::pri ~fade300 ~bounce');
    expect(tokens).toContainEqual({ type: 'ANIM', value: '~fade300', position: 9 });
    expect(tokens).toContainEqual({ type: 'ANIM', value: '~bounce', position: 18 });
  });

  it('tokenizes bare fade animation', () => {
    const tokens = tokenize('txt ~fade');
    expect(tokens).toContainEqual({ type: 'ANIM', value: '~fade', position: 4 });
  });

  it('tokenizes slot syntax [header]', () => {
    const tokens = tokenize('[header]');
    expect(tokens).toContainEqual({ type: 'SLOT', value: '[header]', position: 0 });
  });
});
