import { describe, it, expect } from 'vitest';
import { createRegistry, REGISTRY, REGISTRY_LIB, mergeRegistries } from '../src/registry';

describe('WFL Registry', () => {
  it('has all core components', () => {
    const expected = ['btn', 'card', 'nav', 'sec', 'stk', 'grd', 'txt', 'h1', 'h2', 'h3', 'inp', 'sel', 'bge', 'ava', 'img', 'icon', 'lnk', 'code', 'quote', 'cnt', 'hero', 'feat', 'cta', 'ft', 'tab', 'lst', 'div', 'spn', 'frm', 'lbl', 'txa', 'chk', 'swt', 'rad'];
    expected.forEach(t => {
      expect(REGISTRY[t]).toBeDefined();
    });
  });

  it('btn has primary modifier with Tailwind classes', () => {
    const btn = REGISTRY['btn'];
    const priMod = btn.modifiers['pri'];
    expect(priMod).toBeDefined();
    // Tailwind mode uses className-based modifiers
    expect(priMod).toMatchObject({ className: expect.stringContaining('bg-blue-600') });
  });

  it('resolves modifiers to className instead of props in Tailwind mode', () => {
    const btn = REGISTRY['btn'];
    const priMod = btn.modifiers['pri'];
    expect('className' in priMod).toBe(true);
    expect(typeof (priMod as any).className).toBe('string');
  });

  it('stk has flex class modifiers', () => {
    const stk = REGISTRY['stk'];
    const vMod = stk.modifiers['v'];
    const hMod = stk.modifiers['h'];
    expect(vMod).toMatchObject({ className: 'flex flex-col' });
    expect(hMod).toMatchObject({ className: 'flex flex-row' });
  });

  describe('REGISTRY_LIB (legacy component mode)', () => {
    it('btn has primary variant in REGISTRY_LIB', () => {
      const btn = REGISTRY_LIB['btn'];
      expect(btn.variantProps['pri']).toBeDefined();
      expect(btn.variantProps['pri']).toMatchObject({ variant: 'primary' });
    });

    it('resolves modifiers to prop/value in REGISTRY_LIB', () => {
      const btn = REGISTRY_LIB['btn'];
      expect(btn.modifiers['pri']).toMatchObject({ prop: 'variant', value: 'primary' });
      expect(btn.modifiers['lg']).toMatchObject({ prop: 'size', value: 'lg' });
    });
  });

  it('createRegistry returns a copy', () => {
    const copy = createRegistry();
    expect(copy).not.toBe(REGISTRY);
    expect(copy['btn']).toMatchObject(REGISTRY['btn']);
  });

  describe('mergeRegistries', () => {
    it('merges two registries (later overrides earlier)', () => {
      const a = { btn: { component: 'OldBtn', importPath: 'old', defaultProps: {}, variantProps: {}, modifiers: {} } };
      const b = { btn: { component: 'NewBtn', importPath: 'new', defaultProps: {}, variantProps: {}, modifiers: {} } };
      const merged = mergeRegistries(a, b);
      expect(merged['btn'].component).toBe('NewBtn');
    });

    it('keeps entries from both registries', () => {
      const a = { existing: { component: 'A', importPath: 'a', defaultProps: {}, variantProps: {}, modifiers: {} } };
      const b = { custom: { component: 'B', importPath: 'b', defaultProps: {}, variantProps: {}, modifiers: {} } };
      const merged = mergeRegistries(a, b);
      expect(merged['existing'].component).toBe('A');
      expect(merged['custom'].component).toBe('B');
    });
  });
});
