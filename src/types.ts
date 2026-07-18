// ── Tokens ──
export type TokenType =
  | 'TYPE'       // btn, nav, stk, txt (2-3 letter component codes)
  | 'MOD'        // pri, lg, gls (modifiers/variants)
  | 'STRING'     // "Hello World"
  | 'CONTENT'    // :"content"  (colon + string)
  | 'CHILD'      // >  (nesting)
  | 'SIBLING_H'  // +  (horizontal sibling)
  | 'SIBLING_V'  // ^  (vertical sibling)
  | 'EDIT'       // edi (override keyword)
  | 'EVENT'      // !onClick, !onChange
  | 'STATE'      // @varName
  | 'ITERATE'    // *N or *@data
  | 'CONDITIONAL'// ?@var
  | 'PIPE'       // |  (conditional separator)
  | 'THEME'      // $thm, $col (style/theme prefix)
  | 'MOD_SEP';   // ::  (modifier chain separator)

export interface Token {
  type: TokenType;
  value: string;
  position: number; // character offset in source
}

// ── AST (discriminated union) ──
export type ASTNode =
  | ComponentNode
  | EditNode
  | EventNode
  | StateNode
  | IterationNode
  | ConditionalNode
  | ThemeNode;

// Iteration source — either a literal count or a state reference
export interface IterationLiteral {
  kind: 'literal';
  count: number;
}
export interface IterationStateRef {
  kind: 'stateRef';
  name: string;
}
export type IterationSource = IterationLiteral | IterationStateRef;

export interface ComponentNode {
  type: 'component';
  element: string;      // btn, nav, txt
  modifiers: string[];  // [pri, lg]
  content: string | null; // "Get Started" or null
  children: ASTNode[];
  edits: EditNode[];
  events: EventNode[];
  state: string | null;
}

export interface EditNode {
  type: 'edit';
  property: string;   // bg, col, txt
  value: string;      // #ff5733, "Go"
}

export interface EventNode {
  type: 'event';
  handler: string;    // onClick
  callback: string;   // handleSignup
}

export interface StateNode {
  type: 'state';
  name: string;       // user, todos
}

export interface IterationNode {
  type: 'iteration';
  source: IterationSource; // *3 or *@todos
  child: ASTNode;
}

export interface ConditionalNode {
  type: 'conditional';
  variable: string;
  trueBranch: ASTNode;
  falseBranch: ASTNode | null;
}

export interface ThemeNode {
  type: 'theme';
  category: string;   // thm, col, fnt
  value: string;      // dark, slate.900, inter
}

// ── Resolved Tree (output of Resolver) ──

/** A component prop value as it leaves the resolver (coerced to string for JSX). */
export type PropValue = string | boolean | number;

export interface ResolvedComponent {
  element: string;
  componentName: string;
  importPath: string;
  props: Record<string, PropValue>;
  className: string;
  content: string | null;
  children: ResolvedComponent[];
  events: { handler: string; callback: string }[];
  state: string | null;
  iteration: IterationSource | null;
  conditional: { variable: string; falseBranch: ResolvedComponent | null } | null;
}

// ── Registry ──

/** A modifier maps to either a prop/value pair (e.g. `variant='primary'`) or a CSS class. */
export type ModifierMapping =
  | { className: string }
  | { prop: string; value: PropValue };

export interface RegistryEntry {
  component: string;
  importPath: string;
  defaultProps: Record<string, PropValue>;
  variantProps: Record<string, Record<string, PropValue>>;
  modifiers: Record<string, ModifierMapping>;
  defaultContent?: string;
}

export type Registry = Record<string, RegistryEntry>;
