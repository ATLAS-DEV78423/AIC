export type TokenType = 'TYPE' | 'MOD' | 'STRING' | 'CONTENT' | 'CHILD' | 'SIBLING_H' | 'SIBLING_V' | 'EDIT' | 'EVENT' | 'STATE' | 'ITERATE' | 'CONDITIONAL' | 'PIPE' | 'THEME' | 'MOD_SEP' | 'ANIM' | 'LPAREN' | 'RPAREN' | 'SLOT';
export interface Token {
    type: TokenType;
    value: string;
    position: number;
}
export type ASTNode = ComponentNode | EditNode | EventNode | StateNode | IterationNode | ConditionalNode;
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
    element: string;
    modifiers: string[];
    animations: string[];
    content: string | null;
    slot?: string | null;
    children: ASTNode[];
    edits: EditNode[];
    events: EventNode[];
    state: string | null;
}
export interface EditNode {
    type: 'edit';
    property: string;
    value: string;
}
export interface EventNode {
    type: 'event';
    handler: string;
    callback: string;
}
export interface StateNode {
    type: 'state';
    name: string;
}
export interface IterationNode {
    type: 'iteration';
    source: IterationSource;
    child: ASTNode;
}
export interface ConditionalNode {
    type: 'conditional';
    variable: string;
    trueBranch: ASTNode;
    falseBranch: ASTNode | null;
}
/** A component prop value as it leaves the resolver (coerced to string for JSX). */
export type PropValue = string | boolean | number;
export interface ResolvedComponent {
    element: string;
    componentName: string;
    importPath: string;
    props: Record<string, PropValue>;
    className: string;
    animations: string[];
    content: string | null;
    slot?: string | null;
    children: ResolvedComponent[];
    events: {
        handler: string;
        callback: string;
    }[];
    state: string | null;
    iteration: IterationSource | null;
    iterationKey: string | null;
    conditional: {
        variable: string;
        falseBranch: ResolvedComponent | null;
    } | null;
}
/** A modifier maps to either a prop/value pair (e.g. `variant='primary'`) or a CSS class. */
export type ModifierMapping = {
    className: string;
} | {
    prop: string;
    value: PropValue;
};
export interface RegistryEntry {
    component: string;
    importPath: string;
    defaultProps: Record<string, PropValue>;
    modifiers: Record<string, ModifierMapping>;
    defaultContent?: string;
}
export type Registry = Record<string, RegistryEntry>;
