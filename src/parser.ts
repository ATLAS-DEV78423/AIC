import { Token, ASTNode, ComponentNode, EditNode, EventNode } from './types.js';

export function parse(tokens: Token[]): ASTNode {
  if (tokens.length === 0) throw new Error('Empty WFL expression');
  let pos = 0;

  function peek(): Token | null {
    return pos < tokens.length ? tokens[pos] : null;
  }

  function consume(): Token {
    if (pos >= tokens.length) throw new Error(`Unexpected end of input`);
    return tokens[pos++];
  }

  function parseComponent(): ComponentNode {
    const typeToken = consume();
    // Allow bare state variable at root level
    if (typeToken.type === 'STATE') {
      return { type: 'component', element: '', modifiers: [], content: null, children: [], edits: [], events: [], state: typeToken.value };
    }
    if (typeToken.type !== 'TYPE') {
      throw new Error(`Expected component type at position ${typeToken.position}, got "${typeToken.value}"`);
    }
    const element = typeToken.value;
    const modifiers: string[] = [];
    const children: ASTNode[] = [];
    const edits: EditNode[] = [];
    const events: EventNode[] = [];
    let content: string | null = null;
    let state: string | null = null;

    // Parse ::mod1 ::mod2 modifier chain
    while (peek()?.type === 'MOD_SEP') {
      consume(); // skip ::
      if (peek()?.type === 'MOD') {
        modifiers.push(consume().value);
      }
    }

    // Parse :"content"
    if (peek()?.type === 'CONTENT') {
      content = consume().value;
    }

    // Parse edits, events, state (in any order, any count)
    while (peek() && ['EDIT', 'EVENT', 'STATE'].includes(peek()!.type)) {
      const token = consume();
      if (token.type === 'EDIT') {
        if (peek()?.type === 'THEME') {
          const prop = consume().value;
          if (peek()?.type === 'MOD_SEP') consume(); // skip ::
          const value = peek() && ['MOD', 'STRING'].includes(peek()!.type)
            ? consume().value
            : '';
          edits.push({ type: 'edit', property: prop, value });
        }
      } else if (token.type === 'EVENT') {
        if (peek()?.type === 'MOD_SEP') consume(); // skip ::
        const callback = peek()?.type === 'MOD' ? consume().value : '';
        events.push({ type: 'event', handler: token.value, callback });
      } else if (token.type === 'STATE') {
        state = token.value;
      }
    }

    // Parse children via > nesting
    while (peek()?.type === 'CHILD') {
      consume(); // skip >
      children.push(parseComponent());
      // Collect any siblings (^ or +) at this nesting level
      while (peek() && (peek()!.type === 'SIBLING_V' || peek()!.type === 'SIBLING_H')) {
        consume(); // skip ^ or +
        children.push(parseComponent());
      }
    }

    return {
      type: 'component',
      element,
      modifiers,
      content,
      children,
      edits,
      events,
      state,
    };
  }

  return parseComponent();
}
