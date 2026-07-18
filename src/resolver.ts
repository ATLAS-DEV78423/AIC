import { ASTNode, ComponentNode, ResolvedComponent, Registry, PropValue } from './types.js';

export function resolve(node: ASTNode, registry: Registry): ResolvedComponent {
  if (node.type !== 'component') {
    throw new Error(`Cannot resolve non-component node: ${node.type}`);
  }
  return resolveComponent(node as ComponentNode, registry);
}

function resolveComponent(node: ComponentNode, registry: Registry): ResolvedComponent {
  const entry = registry[node.element];
  if (!entry) {
    throw new Error(`Unknown component token: "${node.element}"`);
  }

  // Start with defaults
  const props: Record<string, PropValue> = { ...entry.defaultProps };
  const classParts: string[] = [];

  // Apply modifiers (ModifierMapping is a discriminated union)
  for (const mod of node.modifiers) {
    const modDef = entry.modifiers[mod];
    if (modDef) {
      if ('prop' in modDef) {
        props[modDef.prop] = modDef.value;
      }
      if ('className' in modDef) {
        classParts.push(modDef.className);
      }
    }
  }

  // Apply edit overrides as inline styles
  for (const edit of node.edits) {
    if (edit.property.startsWith('$bg')) {
      props['style'] = `${props['style'] || ''} background: ${edit.value};`.trim();
    }
    if (edit.property.startsWith('$col')) {
      props['style'] = `${props['style'] || ''} color: ${edit.value};`.trim();
    }
  }

  return {
    element: node.element,
    componentName: entry.component,
    importPath: entry.importPath,
    props,
    className: classParts.join(' '),
    content: node.content,
    children: node.children.map(c => resolve(c, registry)),
    events: node.events.map(e => ({ handler: e.handler, callback: e.callback })),
    state: node.state,
    iteration: null,
    conditional: null,
  };
}
