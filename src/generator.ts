import { ResolvedComponent, PropValue } from './types.js';

export interface Import {
  path: string;
  name: string;
}

export interface GeneratedOutput {
  imports: Import[];
  jsx: string;
}

function formatPropValue(value: PropValue): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return `{${value}}`;
  return `{${value}}`; // boolean
}

export function generate(component: ResolvedComponent): GeneratedOutput {
  const imports: Import[] = [];
  const jsx = generateJSX(component, imports);
  return { imports, jsx };
}

function generateJSX(node: ResolvedComponent, imports: Import[]): string {
  // Collect unique imports
  if (!imports.some(i => i.path === node.importPath && i.name === node.componentName)) {
    imports.push({ path: node.importPath, name: node.componentName });
  }

  // Build props string
  const propParts: string[] = [];
  for (const [key, value] of Object.entries(node.props)) {
    propParts.push(`${key}=${formatPropValue(value)}`);
  }

  if (node.className) {
    const existingIdx = propParts.findIndex(p => p.startsWith('className='));
    if (existingIdx >= 0) {
      propParts[existingIdx] = `className="${node.className}"`;
    } else {
      propParts.push(`className="${node.className}"`);
    }
  }

  const propsStr = propParts.join(' ');

  // Build children JSX
  const childrenStr = node.children.map(c => generateJSX(c, imports)).join('\n');

  // Handle content
  const content = node.content ? node.content.replace(/^:"/, '').replace(/"$/, '') : '';

  // Handle events
  const eventAttrs = node.events.map(e => {
    const handler = e.handler.replace('!', '');
    return `${handler}={${e.callback}}`;
  }).join(' ');

  const allProps = [propsStr, eventAttrs].filter(Boolean).join(' ');

  // Self-closing for no children + no content
  if (!childrenStr && !content) {
    return `      <${node.componentName}${allProps ? ' ' + allProps : ''} />`;
  }

  return `      <${node.componentName}${allProps ? ' ' + allProps : ''}>
${content ? `        ${content}` : ''}${childrenStr ? '\n' + childrenStr : ''}
      </${node.componentName}>`;
}
