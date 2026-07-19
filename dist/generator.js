import { collectAnimationCss } from './animate.js';
function formatPropValue(value) {
    if (typeof value === 'string')
        return `"${value}"`;
    if (typeof value === 'number')
        return `{${value}}`;
    return `{${value}}`; // boolean
}
// Walk resolved tree to collect all animation tokens
function collectAnimationTokens(node) {
    const tokens = [...(node.animations || [])];
    for (const child of node.children) {
        tokens.push(...collectAnimationTokens(child));
    }
    return tokens;
}
// Walk resolved tree to collect all unique state variable names (without @)
function collectStateVars(node) {
    const vars = new Set();
    function walk(n) {
        if (n.state)
            vars.add(n.state.replace('@', ''));
        for (const child of n.children)
            walk(child);
        if (n.conditional?.falseBranch)
            walk(n.conditional.falseBranch);
    }
    walk(node);
    return vars;
}
export function generate(component) {
    const imports = [];
    const jsx = generateJSX(component, imports);
    const allTokens = collectAnimationTokens(component);
    const css = collectAnimationCss(allTokens);
    const stateVars = collectStateVars(component);
    const stateCode = stateVars.size > 0
        ? [...stateVars].map(v => `const [${v}, set${v.charAt(0).toUpperCase() + v.slice(1)}] = useState('')`).join('\n')
        : '';
    if (stateVars.size > 0) {
        imports.push({ path: 'react', name: 'useState' });
    }
    return { imports, jsx, css, stateCode };
}
function generateJSX(node, imports, depth = 0) {
    // Handle iteration (*N > comp or *@state > comp)
    if (node.iteration) {
        if (node.iteration.kind === 'literal') {
            const count = node.iteration.count;
            const childJsx = node.children.map(c => generateJSX(c, imports, depth)).join('\n');
            return Array.from({ length: count }, () => childJsx).join('\n');
        }
        else {
            const stateVar = node.iteration.name.replace('@', '');
            const varExpr = depth > 0 ? `item.${stateVar}` : stateVar;
            const childJsx = node.children.map(c => generateJSX(c, imports, depth + 1)).join('\n');
            const keyExpr = node.iterationKey ? `item.${node.iterationKey}` : 'i';
            return `{${varExpr}.map((item, i) => <React.Fragment key={${keyExpr}}>${childJsx}</React.Fragment>)}`;
        }
    }
    // Handle conditional (?@var | comp_a | comp_b)
    if (node.conditional) {
        const stateVar = node.conditional.variable.replace('?@', '');
        const trueJsx = node.children.map(c => generateJSX(c, imports, depth)).join('\n');
        if (node.conditional.falseBranch) {
            const falseJsx = generateJSX(node.conditional.falseBranch, imports, depth);
            return `{${stateVar} ? (${trueJsx}) : (${falseJsx})}`;
        }
        return `{${stateVar} && (${trueJsx})}`;
    }
    // Handle synthetic group (empty element name from parentheses)
    if (!node.componentName) {
        return node.children.map(c => generateJSX(c, imports, depth)).join('\n');
    }
    // Collect unique imports — skip for native HTML (empty importPath)
    if (node.importPath && !imports.some(i => i.path === node.importPath && i.name === node.componentName)) {
        imports.push({ path: node.importPath, name: node.componentName });
    }
    // Build props string
    const propParts = [];
    for (const [key, value] of Object.entries(node.props)) {
        propParts.push(`${key}=${formatPropValue(value)}`);
    }
    if (node.className) {
        const existingIdx = propParts.findIndex(p => p.startsWith('className='));
        if (existingIdx >= 0) {
            propParts[existingIdx] = `className="${node.className}"`;
        }
        else {
            propParts.push(`className="${node.className}"`);
        }
    }
    // Auto-bind state variable to value prop
    if (node.state) {
        const varName = node.state.replace('@', '');
        propParts.push(`value={${varName}}`);
    }
    // Separate slotted children (render as props) from inline children (render inside tags)
    const slottedChildren = node.children.filter(c => c.slot);
    const inlineChildren = node.children.filter(c => !c.slot);
    // Add slotted children as JSX expression props: slotName={<Component>...</Component>}
    for (const child of slottedChildren) {
        const childJsx = generateJSX(child, imports, depth);
        propParts.push(`${child.slot}={${childJsx}}`);
    }
    const propsStr = propParts.join(' ');
    // Build inline children JSX
    const childrenStr = inlineChildren.map(c => generateJSX(c, imports, depth)).join('\n');
    // Handle content
    const content = node.content ? node.content.replace(/^:"/, '').replace(/"$/, '') : '';
    // Handle events
    const eventAttrs = node.events.map(e => {
        const handler = e.handler.replace('!', '');
        let callback = e.callback;
        // Auto-wrap onChange when callback matches state setter
        if (handler === 'onChange' && node.state) {
            const varName = node.state.replace('@', '');
            const setter = `set${varName.charAt(0).toUpperCase() + varName.slice(1)}`;
            if (callback === setter) {
                callback = `(e) => ${setter}(e.target.value)`;
            }
        }
        // Auto-preventDefault on form submit
        if (handler === 'onSubmit') {
            callback = `(e) => { e.preventDefault(); ${callback}(e) }`;
        }
        return `${handler}={${callback}}`;
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
//# sourceMappingURL=generator.js.map