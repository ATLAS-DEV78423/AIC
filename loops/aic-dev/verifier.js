#!/usr/bin/env node
// AIC Development Loop — Deterministic Verifier
// Binary exit: 0 = pass, 1 = fail
// Checks: tests compile, tests pass, quality check

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

let allPassed = true;

function check(name, command) {
  try {
    execSync(command, { cwd: root, stdio: 'pipe', timeout: 60000 });
    console.log(`  ✅ ${name}`);
    return true;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    if (e.stderr) process.stderr.write(e.stderr.toString());
    if (e.stdout) process.stdout.write(e.stdout.toString());
    return false;
  }
}

console.log('\n🔍 AIC Verifier — Running checks...\n');

// Check 1: TypeScript compiles
allPassed &= check('TypeScript compiles', 'npx tsc --noEmit');

// Check 2: Tests pass
allPassed &= check('Tests pass', 'npx vitest run');

// Check 3: Plan file exists
console.log(`  ${existsSync(resolve(root, 'docs/superpowers/plans')) ? '✅' : '❌'} Plan directory exists`);

// Check 4: No uncommitted changes (warning only)
try {
  const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' });
  if (status.trim()) {
    console.log(`  ⚠️  ${status.trim().split('\n').length} uncommitted files`);
  } else {
    console.log(`  ✅ Working tree clean`);
  }
} catch {
  console.log(`  ⚠️  Could not check git status`);
}

console.log(allPassed ? '\n✅ ALL CHECKS PASSED\n' : '\n❌ SOME CHECKS FAILED\n');
process.exit(allPassed ? 0 : 1);
