import { ASTNode, ComponentNode, IterationNode, ConditionalNode, ResolvedComponent, Registry, PropValue } from './types.js';
import { parseAnimationToken } from './animate.js';

export function resolve(node: ASTNode, registry: Registry): ResolvedComponent {
  if (node.type === 'iteration') return resolveIteration(node as IterationNode, registry);
  if (node.type === 'conditional') return resolveConditional(node as ConditionalNode, registry);
  if (node.type !== 'component') {
    throw new Error(`Cannot resolve non-component node: ${node.type}`);
  }
  return resolveComponent(node as ComponentNode, registry);
}

function resolveIteration(node: IterationNode, registry: Registry): ResolvedComponent {
  const child = resolve(node.child, registry);
  return {
    element: '',
    componentName: '',
    importPath: '',
    props: {},
    className: '',
    animations: [],
    content: null,
    children: [child],
    events: [],
    state: null,
    iteration: node.source,
    iterationKey: child.iteration ? null : child.iterationKey,
    conditional: null,
    slot: null,
  };
}

function resolveConditional(node: ConditionalNode, registry: Registry): ResolvedComponent {
  const trueBranch = resolve(node.trueBranch, registry);
  const falseBranch = node.falseBranch ? resolve(node.falseBranch, registry) : null;
  return {
    element: '',
    componentName: '',
    importPath: '',
    props: {},
    className: '',
    animations: [],
    content: null,
    children: [trueBranch],
    events: [],
    state: null,
    iteration: null,
    iterationKey: null,
    conditional: { variable: node.variable, falseBranch },
    slot: null,
  };
}

function resolveComponent(node: ComponentNode, registry: Registry): ResolvedComponent {
  // Synthetic group (from parentheses wrapping) — pass through as fragment
  if (!node.element) {
    return {
      element: '',
      componentName: '',
      importPath: '',
      props: {},
      className: '',
      animations: [],
      content: null,
      children: node.children.map(c => resolve(c, registry)),
      events: [],
      state: null,
      iteration: null,
      iterationKey: null,
      conditional: null,
      slot: null,
    };
  }

  const entry = registry[node.element];
  if (!entry) {
    const known = Object.keys(registry).join(', ');
    throw new Error(`Unknown component token: "${node.element}". Known: ${known}`);
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

  // Content override via $txt (or fall back to registry defaultContent)
  let content = node.content;
  if (!content && entry.defaultContent) {
    content = `:"${entry.defaultContent}"`;
  }
  let iterationKey: string | null = null;

  // Apply edit overrides as inline styles and props
  for (const edit of node.edits) {
    const prop = edit.property;
    const value = edit.value.replace(/^"/, '').replace(/"$/, ''); // strip quotes

    if (prop === '$txt') {
      content = `:"${value}"`;
      continue;
    }

    // Map known $props to CSS properties
    const styleMap: Record<string, string> = {
      '$bg': 'background',
      '$col': 'color',
      '$pd': 'padding',
      '$mg': 'margin',
      '$w': 'width',
      '$h': 'height',
      '$fs': 'font-size',
      '$fw': 'font-weight',
      '$br': 'border-radius',
      '$gap': 'gap',
    };

    // Map lowercase HTML attribute names to React camelCase props
    // Allows users to write $minlength::3 instead of remembering $minLength::3
    const htmlToReact: Record<string, string> = {
      minlength: 'minLength',
      maxlength: 'maxLength',
      readonly: 'readOnly',
      tabindex: 'tabIndex',
    };

    if (styleMap[prop]) {
      props['style'] = `${props['style'] || ''} ${styleMap[prop]}: ${value};`.trim();
    } else if (prop === '$src' || prop === '$alt') {
      // Passthrough props: set directly on component
      props[prop.slice(1)] = value;
    } else if (prop === '$key') {
      // Iteration key: store for generator to use in .map() keys
      iterationKey = value;
    } else if (prop.startsWith('$')) {
      const propName = htmlToReact[prop.slice(1)] || prop.slice(1);
      // Coerce boolean and numeric strings for correct React rendering
      // ($required::true → required={true}, not required="true")
      if (value === 'true') props[propName] = true;
      else if (value === 'false') props[propName] = false;
      else if (/^\d+$/.test(value)) props[propName] = parseInt(value, 10);
      // Any other $prop → pass as direct component prop
      else props[propName] = value;
    }
  }

  // Apply animation tokens → CSS classes
  for (const anim of node.animations) {
    const parsed = parseAnimationToken(anim);
    if (parsed) {
      classParts.push(`anim-${parsed.name}`);
      // Add animation duration as inline style if non-default
      if (parsed.duration !== 300) {
        const existing = props['style'] || '';
        props['style'] = `${existing} animation-duration: ${parsed.duration}ms;`.trim();
      }
    }
  }

  return {
    element: node.element,
    componentName: entry.component,
    importPath: entry.importPath,
    props,
    className: classParts.join(' '),
    animations: node.animations,
    content,
    slot: node.slot,
    children: node.children.map(c => resolve(c, registry)),
    events: node.events.map(e => ({ handler: e.handler, callback: e.callback })),
    state: node.state,
    iteration: null,
    iterationKey,
    conditional: null,
  };
}
