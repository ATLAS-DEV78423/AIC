import { Token, TokenType } from './types.js';

interface Pattern {
  type: TokenType;
  regex: RegExp;
}

// Order matters — more specific patterns first to avoid partial matches
const patterns: Pattern[] = [
  { type: 'EDIT', regex: /^edi\b/ },
  { type: 'EVENT', regex: /^![a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: 'STATE', regex: /^@[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: 'THEME', regex: /^\$[a-zA-Z]+/ },
  { type: 'ITERATE', regex: /^\*@[a-zA-Z_][a-zA-Z0-9_]*|^\*\d+/ },
  { type: 'CONDITIONAL', regex: /^\?@[a-zA-Z_][a-zA-Z0-9_]*(\s*(?:>=|<=|==|!=|>|<)\s*(?:\d+|'[^']*'))?/ },
  { type: 'PIPE', regex: /^\|/ },
  { type: 'CONTENT', regex: /^:"[^"]*"/ },
  { type: 'STRING', regex: /^"[^"]*"/ },
  { type: 'MOD_SEP', regex: /^::/ },
  { type: 'CHILD', regex: /^>/ },
  { type: 'LPAREN', regex: /^\(/ },
  { type: 'RPAREN', regex: /^\)/ },
  { type: 'SIBLING_H', regex: /^\+/ },
  { type: 'SIBLING_V', regex: /^\^/ },
  // ANIM matches ~-prefixed animation directives: ~fade, ~slide300, ~bounce, etc.
  { type: 'SLOT', regex: /^\[[a-zA-Z_][a-zA-Z0-9_]*\]/ },
  { type: 'ANIM', regex: /^~[a-zA-Z][a-zA-Z0-9]*/ },
  // TYPE matches known component codes (2-4 letter lowercase) when followed by an operator or end-of-input
  { type: 'TYPE', regex: /^[a-z][a-z0-9]+(?=::|>|\+|\^|\||:|\s|$)/ },
  // MOD catches everything else (modifier values, identifiers) after :: or where TYPE doesn't match
  { type: 'MOD', regex: /^[a-zA-Z0-9#][a-zA-Z0-9#.-]*/ },
];

const commentPattern = /^# .*$/m; // requires space after # (avoids eating hex colors like #000)

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let typeEnabled = true; // track whether TYPE tokens are valid (false after ::)

  while (pos < input.length) {
    // Skip whitespace
    if (/\s/.test(input[pos])) {
      pos++;
      continue;
    }

    // Skip comments (# to end of line)
    const commentMatch = input.slice(pos).match(commentPattern);
    if (commentMatch) {
      pos += commentMatch[0].length;
      continue;
    }

    let matched = false;
    for (const { type, regex } of patterns) {
      // After MOD_SEP (::), modifier values should not match TYPE
      if (type === 'TYPE' && !typeEnabled) continue;

      const match = input.slice(pos).match(regex);
      if (match && match.index === 0) {
        tokens.push({ type, value: match[0], position: pos });
        pos += match[0].length;
        matched = true;

        // Update typeEnabled based on what was matched
        if (type === 'MOD_SEP') {
          typeEnabled = false; // TYPE not valid after ::
        } else if (type === 'TYPE' || type === 'CHILD' || type === 'SIBLING_H' || type === 'SIBLING_V' || type === 'PIPE' || type === 'SLOT') {
          typeEnabled = true; // TYPE valid after component/child/sibling/pipe
        }
        // ANIM doesn't change typeEnabled — animations are component modifiers
        break;
      }
    }

    if (!matched) {
      // Skip unknown characters (lenient parsing for AI-generated input)
      pos++;
    }
  }

  return tokens;
}
