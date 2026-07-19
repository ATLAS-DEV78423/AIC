#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { resolve } from './resolver.js';
import { generate, GeneratedOutput, Import } from './generator.js';
import { Registry } from './types.js';
import { REGISTRY, REGISTRY_LIB, mergeRegistries } from './registry.js';

function mergeImports(imports: Import[]): Import[] {
  const seen = new Set<string>();
  return imports.filter(i => {
    const key = `${i.path}|${i.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function compile(wflSource: string, registry?: Registry): GeneratedOutput {
  const reg = registry || REGISTRY;
  const lines = wflSource.split('\n').map(l => l.trim()).filter(l => Boolean(l) && !l.startsWith('#'));
  if (lines.length === 0) throw new Error('Empty WFL expression');

  const results = lines.map(line => {
    try {
      const tokens = tokenize(line);
      const ast = parse(tokens);
      const resolved = resolve(ast, reg);
      return generate(resolved);
    } catch (err: any) {
      const msg = err.message || String(err);
      const posMatch = msg.match(/at position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const marker = ' '.repeat(Math.max(0, pos)) + '^';
        throw new Error(`${msg}\n  ${line}\n  ${marker}`);
      }
      throw new Error(`${msg}\n  In expression: "${line}"`);
    }
  });

  if (results.length === 1) return results[0];

  return {
    imports: mergeImports(results.flatMap(r => r.imports)),
    jsx: `<main>\n${results.map(r => r.jsx).join('\n')}\n      </main>`,
    css: results.map(r => r.css).filter(Boolean).join('\n\n'),
    stateCode: results.map(r => r.stateCode).filter(Boolean).join('\n'),
  };
}

/** Wrap compiled output in a complete .tsx file string */
export function formatComponentOutput(output: GeneratedOutput, componentName: string = 'Page'): string {
  let result = `"use client";\n\n`;

  for (const imp of output.imports) {
    result += `import { ${imp.name} } from "${imp.path}";\n`;
  }

  result += `\nexport default function ${componentName}() {\n`;

  if (output.stateCode) {
    result += `  ${output.stateCode}\n\n`;
  }

  result += `  return (\n`;

  if (output.css) {
    result += `    <>\n`;
    result += output.jsx;
    result += `\n      <style>\n${output.css}\n      </style>\n    </>\n`;
  } else {
    result += output.jsx;
    result += '\n';
  }

  result += `  );\n}\n`;
  return result;
}

// CLI
const VERSION = '0.1.0';
const isCli = process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js');
if (isCli) {
  const args = process.argv.slice(2);

  // --version flag: print version and exit
  if (args[0] === '--version' || args[0] === '-v') {
    console.log(VERSION);
    process.exit(0);
  }

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.error(`wfl-lang v${VERSION}`);
    console.error('Usage:');
    console.error('  wfl "nav::gls > btn::pri"             # inline expression → raw output');
    console.error('  wfl compile page.wfl                   # compile file → stdout');
    console.error('  wfl compile page.wfl --out page.tsx    # compile file → file');
    console.error('  wfl build src/ --out dist/             # compile directory');
    console.error('  wfl --lib ...                          # use component-based registry (legacy)');
    console.error('  wfl --registry my-comps.json ...       # use custom component registry');
    process.exit(1);
  }

  try {
    // --lib flag uses REGISTRY_LIB (component mode) instead of Tailwind-native REGISTRY
    const libIdx = args.indexOf('--lib');
    const useLib = libIdx >= 0;
    if (useLib) args.splice(libIdx, 1);

    // Load custom registry if --registry flag is set
    const regIdx = args.indexOf('--registry');
    let registry: Registry | undefined;
    if (regIdx >= 0 && args[regIdx + 1]) {
      const regPath = args[regIdx + 1];
      const regJson = JSON.parse(readFileSync(regPath, 'utf-8'));
      // Remove --registry and its value from args so they don't interfere with paths
      args.splice(regIdx, 2);
      registry = mergeRegistries(useLib ? REGISTRY_LIB : REGISTRY, regJson);
    } else if (useLib) {
      registry = REGISTRY_LIB;
    }

    const sub = args[0];
    const reg = registry;

    if (sub === 'compile' || sub === 'build') {
      const paths = args.filter(a => !a.startsWith('--'));
      const outIdx = args.indexOf('--out');
      const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

      const target = paths[1];
      if (!target) throw new Error(`Missing path for ${sub} command`);

      const stat = statSync(target);
      if (stat.isDirectory()) {
        const files = readdirSync(target).filter((f: string) => f.endsWith('.wfl'));
        if (files.length === 0) throw new Error(`No .wfl files found in ${target}`);
        for (const file of files) {
          const inPath = `${target}/${file}`;
          const source = readFileSync(inPath, 'utf-8');
          const output = formatComponentOutput(compile(source, reg));
          const outFile = file.replace('.wfl', '.tsx');
          if (outPath) {
            writeFileSync(`${outPath}/${outFile}`, output);
            console.log(`  ${outFile}`);
          } else {
            console.log(`// ${file} → ${outFile}`);
            console.log(output);
          }
        }
      } else {
        const source = readFileSync(target, 'utf-8');
        const componentName = target.replace(/.*\//, '').replace('.wfl', '');
        const output = formatComponentOutput(compile(source, reg), componentName);
        if (outPath) {
          writeFileSync(outPath, output);
          console.log(`Wrote ${outPath}`);
        } else {
          console.log(output);
        }
      }
    } else {
      // Inline expression (no subcommand)
      const input = args.join(' ');
      const output = compile(input, reg) as GeneratedOutput;
      console.log('// Imports:');
      output.imports.forEach(i => console.log(`import { ${i.name} } from "${i.path}";`));
      console.log('\n// JSX:');
      console.log(output.jsx);
      if (output.css) {
        console.log('\n// CSS:');
        console.log(output.css);
      }
    }
  } catch (err: any) {
    const msg = err.message || String(err);
    console.error(`\n  ${msg.replace(/\n/g, '\n  ')}\n`);
    process.exit(1);
  }
}
