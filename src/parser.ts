import { Token, ASTNode, ComponentNode, EditNode, EventNode, IterationSource } from './types.js';

function errorAt(msg: string, token?: Token | null): string {
  return token ? `${msg} (at position ${token.position})` : msg;
}

export function parse(tokens: Token[]): ASTNode {
  if (tokens.length === 0) throw new Error('Empty WFL expression');
  let pos = 0;

  function peek(): Token | null {
    return pos < tokens.length ? tokens[pos] : null;
  }

  function consume(): Token {
    if (pos >= tokens.length) throw new Error(`Unexpected end of input${tokens.length > 0 ? ` (after token at position ${tokens[tokens.length - 1].position})` : ''}`);
    return tokens[pos++];
  }

  function parseExpression(): ASTNode {
    if (peek()?.type === 'LPAREN') {
      consume(); // skip (
      const firstChild = parseExpression();
      const siblings: ASTNode[] = [];
      while (peek() && (peek()!.type === 'SIBLING_V' || peek()!.type === 'SIBLING_H')) {
        consume();
        siblings.push(parseExpression());
      }
      if (peek()?.type !== 'RPAREN') {
        throw new Error(`Expected ) after grouped expression`);
      }
      consume(); // skip )
      if (siblings.length === 0) return firstChild;
      return {
        type: 'component',
        element: '',
        modifiers: [],
        animations: [],
        content: null,
        slot: null,
        children: [firstChild, ...siblings],
        edits: [],
        events: [],
        state: null,
      };
    }
    if (peek()?.type === 'ITERATE') return parseIteration();
    if (peek()?.type === 'CONDITIONAL') return parseConditional();
    return parseComponent();
  }

  function parseIteration(): ASTNode {
    const iterToken = consume();
    const raw = iterToken.value;
    let source: IterationSource;
    if (raw.startsWith('*@')) {
      source = { kind: 'stateRef', name: raw.slice(1) };
    } else {
      source = { kind: 'literal', count: parseInt(raw.slice(1), 10) };
    }
    if (peek()?.type !== 'CHILD') {
      throw new Error(errorAt(`Expected > after iteration, got "${peek()?.value || 'EOF'}"`, peek()));
    }
    consume(); // skip >
    const child = parseExpression();
    return { type: 'iteration', source, child };
  }

  function parseConditional(): ASTNode {
    const condToken = consume();
    const variable = condToken.value;

    if (peek()?.type !== 'PIPE') {
      throw new Error(errorAt(`Expected | after conditional, got "${peek()?.value || 'EOF'}"`, peek()));
    }
    consume(); // skip |

    const trueBranch = parseExpression();
    let falseBranch: ASTNode | null = null;

    if (peek()?.type === 'PIPE') {
      consume(); // skip second |
      falseBranch = parseExpression();
    }

    return { type: 'conditional', variable, trueBranch, falseBranch };
  }

  function parseComponent(): ComponentNode {
    const typeToken = consume();
    // Allow bare state variable at root level
    if (typeToken.type === 'STATE') {
      return { type: 'component', element: '', modifiers: [], animations: [], content: null, slot: null, children: [], edits: [], events: [], state: typeToken.value };
    }
    if (typeToken.type !== 'TYPE') {
      throw new Error(`Expected component type at position ${typeToken.position}, got "${typeToken.value}"`);
    }
    const element = typeToken.value;
    const modifiers: string[] = [];
    const animations: string[] = [];
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

    // Parse animations (~fade, ~slide300, etc.) before content
    while (peek()?.type === 'ANIM') {
      animations.push(consume().value);
    }

    // Parse :"content"
    if (peek()?.type === 'CONTENT') {
      content = consume().value;
    }

    // Parse edits, events, state (in any order, any count)
    while (peek() && ['EDIT', 'EVENT', 'STATE'].includes(peek()!.type)) {
      const token = consume();
      if (token.type === 'EDIT') {
        while (peek()?.type === 'THEME') {
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

    // Parse children via > nesting, with optional [slot] prefix
    while (peek()?.type === 'CHILD') {
      consume(); // skip >
      // Parse first child at this nesting level (may have slot prefix)
      let slot: string | null = null;
      if (peek()?.type === 'SLOT') {
        const slotToken = consume().value;
        slot = slotToken.slice(1, -1); // strip [ ]
      }
      const child = parseExpression();
      if (child.type === 'component' && slot) {
        (child as ComponentNode).slot = slot;
      }
      children.push(child);

      // Collect any additional children at this level:
      // explicit siblings (^ or +) or implicit slot-prefixed children
      while (peek() && (peek()!.type === 'SIBLING_V' || peek()!.type === 'SIBLING_H' || peek()!.type === 'SLOT')) {
        let siblingSlot: string | null = null;
        // SLOT doesn't need an operator consumed — it implies a sibling
        if (peek()!.type !== 'SLOT') {
          consume(); // skip ^ or +
        }
        if (peek()?.type === 'SLOT') {
          const slotToken = consume().value;
          siblingSlot = slotToken.slice(1, -1);
        }
        const siblingChild = parseExpression();
        if (siblingChild.type === 'component' && siblingSlot) {
          (siblingChild as ComponentNode).slot = siblingSlot;
        }
        children.push(siblingChild);
      }
    }

    return {
      type: 'component',
      element,
      modifiers,
      animations,
      content,
      slot: null,
      children,
      edits,
      events,
      state,
    };
  }

  return parseExpression();
}
