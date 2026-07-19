import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer.js';
import { parse } from '../src/parser.js';
import { compile } from '../src/index.js';

// ── Lexer ──
describe('tokenize', () => {
  it('tokenizes a basic component', () => {
    const tokens = tokenize('btn::pri:"Click"');
    expect(tokens.map(t => t.type)).toEqual(['TYPE', 'MOD_SEP', 'MOD', 'CONTENT']);
    expect(tokens[0].value).toBe('btn');
  });

  it('tokenizes nested structure', () => {
    const tokens = tokenize('nav > btn::pri');
    expect(tokens.map(t => t.type)).toEqual(['TYPE', 'CHILD', 'TYPE', 'MOD_SEP', 'MOD']);
  });

  it('tokenizes animations', () => {
    const tokens = tokenize('btn ~fade ~bounce');
    expect(tokens.filter(t => t.type === 'ANIM').map(t => t.value)).toEqual(['~fade', '~bounce']);
  });

  it('tokenizes state and events', () => {
    const tokens = tokenize('inp::txt @query !onChange::setQuery');
    const types = tokens.map(t => t.type);
    expect(types).toContain('STATE');
    expect(types).toContain('EVENT');
    expect(tokens.find(t => t.type === 'STATE')?.value).toBe('@query');
    expect(tokens.find(t => t.type === 'EVENT')?.value).toBe('!onChange');
  });

  it('tokenizes iteration', () => {
    const tokens = tokenize('*3 > card');
    expect(tokens.map(t => t.type)).toEqual(['ITERATE', 'CHILD', 'TYPE']);
  });

  it('tokenizes conditionals', () => {
    const tokens = tokenize('?@isAdmin | btn | txt');
    expect(tokens.map(t => t.type)).toEqual(['CONDITIONAL', 'PIPE', 'TYPE', 'PIPE', 'TYPE']);
  });

  it('tokenizes themes/edits', () => {
    const tokens = tokenize('btn edi $bg::#333 !onClick::handle');
    expect(tokens.map(t => t.type)).toContain('EDIT');
    expect(tokens.map(t => t.type)).toContain('THEME');
  });

  it('skips comments', () => {
    const tokens = tokenize('btn::pri # this is a comment');
    expect(tokens.map(t => t.type)).toEqual(['TYPE', 'MOD_SEP', 'MOD']);
  });

  it('handles groups', () => {
    const tokens = tokenize('nav > (a + b)');
    expect(tokens.map(t => t.type)).toEqual(['TYPE', 'CHILD', 'LPAREN', 'TYPE', 'SIBLING_H', 'TYPE', 'RPAREN']);
  });

  it('handles floats, bare strings, and edge tokens', () => {
    const tokens = tokenize('edi $w::50%');
    expect(tokens.map(t => t.type)).toContain('THEME');
  });
});

// ── Parser ──
describe('parse', () => {
  it('parses a simple component', () => {
    const ast = parse(tokenize('btn::pri:"Click"'));
    expect(ast.type).toBe('component');
    if (ast.type === 'component') {
      expect(ast.element).toBe('btn');
      expect(ast.modifiers).toEqual(['pri']);
      expect(ast.content).toBe(':"Click"');
    }
  });

  it('parses component with animation', () => {
    const ast = parse(tokenize('btn::pri ~fade'));
    if (ast.type === 'component') {
      expect(ast.animations).toContain('~fade');
    }
  });

  it('parses nesting', () => {
    const ast = parse(tokenize('nav > btn::pri'));
    if (ast.type === 'component') {
      expect(ast.element).toBe('nav');
      expect(ast.children).toHaveLength(1);
    }
  });

  it('parses iteration', () => {
    const ast = parse(tokenize('*3 > card'));
    if (ast.type === 'iteration') {
      expect(ast.source.kind).toBe('literal');
      if (ast.source.kind === 'literal') expect(ast.source.count).toBe(3);
    }
  });

  it('parses conditional', () => {
    const ast = parse(tokenize('?@user | txt:"Hi" | btn:"Sign In"'));
    if (ast.type === 'conditional') {
      expect(ast.variable).toBe('?@user');
      expect(ast.falseBranch).not.toBeNull();
    }
  });

  it('parses state variable', () => {
    const ast = parse(tokenize('inp @query'));
    if (ast.type === 'component') {
      expect(ast.state).toBe('@query');
    }
  });

  it('throws on unknown component with suggestion', () => {
    expect(() => parse(tokenize('foobar'))).toThrow('registry');
  });

  it('throws on empty input', () => {
    expect(() => parse([])).toThrow('Empty');
  });
});

// ── Compilation (end-to-end) ──
describe('compile', () => {
  it('compiles a button', () => {
    const result = compile('btn::pri:"Click"');
    expect(result.jsx).toContain('button');
    expect(result.jsx).toContain('Click');
  });

  it('compiles a nav with child', () => {
    const result = compile('nav > btn::pri:"Home"');
    expect(result.jsx).toContain('<nav');
    expect(result.jsx).toContain('</nav>');
  });

  it('compiles layout with siblings', () => {
    const result = compile('stk::v > txt::h1:"Title" ^ txt:"Body"');
    expect(result.jsx).toContain('Title');
    expect(result.jsx).toContain('Body');
  });

  it('compiles with state and event', () => {
    const result = compile('inp::txt @query !onChange::setQuery');
    expect(result.stateCode).toContain('useState');
    expect(result.stateCode).toContain('query');
    expect(result.jsx).toContain('value={query}');
    expect(result.jsx).toContain('onChange');
  });

  it('compiles iteration', () => {
    const result = compile('*3 > card::out');
    expect(result.jsx).toContain('map');
    expect(result.jsx).toContain('React.Fragment');
  });

  it('compiles conditional', () => {
    const result = compile('?@isAdmin | btn::del:"Delete" | txt:"No access"');
    expect(result.jsx).toContain('isAdmin');
    expect(result.jsx).toContain('Delete');
    expect(result.jsx).toContain('No access');
  });

  it('generates animation CSS', () => {
    const result = compile('btn::pri ~fade ~bounce');
    expect(result.css).toContain('@keyframes anim-fade');
    expect(result.css).toContain('@keyframes anim-bounce');
  });

  it('void elements are self-closing (no content children)', () => {
    const result = compile('inp::txt:"Type here"');
    expect(result.jsx).toMatch(/<input\s[^>]*\/>/);
    expect(result.jsx).not.toContain('Type here');
  });

  it('handles custom duration animation', () => {
    const result = compile('btn ~fade500');
    expect(result.css).toContain('@keyframes anim-fade');
    expect(result.jsx).toContain('animation-duration: 500ms');
  });

  it('compiles multi-line pages', () => {
    const result = compile('nav > btn::pri:"Home"\nsec::hero > txt::h1:"Welcome"');
    expect(result.jsx).toContain('<main>');
    expect(result.jsx).toContain('Home');
    expect(result.jsx).toContain('Welcome');
  });

  it('compiles with edit overrides', () => {
    const result = compile('btn::pri:"Click" edi $bg::#333');
    expect(result.jsx).toContain('background');
  });

  it('compiles groups', () => {
    const result = compile('nav > (btn::pri + btn::sec)');
    expect(result.jsx).toContain('nav');
    expect(result.jsx).toContain('button');
  });

  it('handles img with modifiers', () => {
    const result = compile('img::rnd::full');
    expect(result.jsx).toContain('img');
    expect(result.jsx).toMatch(/<img\s/);
  });
});

describe('error messages', () => {
  it('gives helpful message for empty input', () => {
    expect(() => compile('')).toThrow('💡');
  });

  it('gives helpful message for unknown component', () => {
    expect(() => compile('zzzzz::pri')).toThrow(/not in the registry|💡/);
  });
});
