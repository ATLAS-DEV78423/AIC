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

// ── AST ──
export interface ASTNode {
  type: 'component' | 'edit' | 'event' | 'state' | 'iteration' | 'conditional' | 'theme';
}

export interface ComponentNode extends ASTNode {
  type: 'component';
  element: string;      // btn, nav, txt
  modifiers: string[];  // [pri, lg]
  content: string | null; // "Get Started" or null
  children: ASTNode[];
  edits: EditNode[];
  events: EventNode[];
  state: string | null;
}

export interface EditNode extends ASTNode {
  type: 'edit';
  property: string;   // bg, col, txt
  value: string;      // #ff5733, "Go"
}

export interface EventNode extends ASTNode {
  type: 'event';
  handler: string;    // onClick
  callback: string;   // handleSignup
}

export interface StateNode extends ASTNode {
  type: 'state';
  name: string;       // user, todos
}

export interface IterationNode extends ASTNode {
  type: 'iteration';
  count: number | string; // 3 or '@todos'
  child: ASTNode;
}

export interface ConditionalNode extends ASTNode {
  type: 'conditional';
  variable: string;
  trueBranch: ASTNode;
  falseBranch: ASTNode | null;
}

export interface ThemeNode extends ASTNode {
  type: 'theme';
  category: string;   // thm, col, fnt
  value: string;      // dark, slate.900, inter
}

// ── Resolved Tree (output of Resolver) ──
export interface ResolvedComponent {
  element: string;
  componentName: string;
  importPath: string;
  props: Record<string, string>;
  className: string;
  content: string | null;
  children: ResolvedComponent[];
  events: { handler: string; callback: string }[];
  state: string | null;
  iteration: { count: number | string } | null;
  conditional: { variable: string; falseBranch: ResolvedComponent | null } | null;
}

// ── Registry ──
export interface RegistryEntry {
  component: string;
  importPath: string;
  defaultProps: Record<string, string>;
  variantProps: Record<string, Record<string, string>>;
  modifiers: Record<string, { prop?: string; value?: string; className?: string }>;
  defaultContent?: string;
}

export type Registry = Record<string, RegistryEntry>;
