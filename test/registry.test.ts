import { describe, it, expect } from 'vitest';
import { createRegistry, REGISTRY } from '../src/registry';

describe('WFL Registry', () => {
  it('has all core components', () => {
    const expected = ['btn', 'card', 'nav', 'sec', 'stk', 'grd', 'txt', 'h1', 'h2', 'h3', 'inp', 'sel', 'bge', 'ava', 'img', 'icon', 'lnk', 'code', 'quote', 'cnt'];
    expected.forEach(t => {
      expect(REGISTRY[t]).toBeDefined();
    });
  });

  it('btn has primary variant', () => {
    const btn = REGISTRY['btn'];
    expect(btn.variantProps['pri']).toBeDefined();
    expect(btn.variantProps['pri']).toMatchObject({ variant: 'primary' });
  });

  it('resolves modifiers to correct props', () => {
    const btn = REGISTRY['btn'];
    expect(btn.modifiers['pri']).toMatchObject({ prop: 'variant', value: 'primary' });
    expect(btn.modifiers['lg']).toMatchObject({ prop: 'size', value: 'lg' });
  });

  it('stk has vertical and horizontal variants', () => {
    const stk = REGISTRY['stk'];
    expect(stk.variantProps['v']).toMatchObject({ direction: 'column' });
    expect(stk.variantProps['h']).toMatchObject({ direction: 'row' });
  });

  it('createRegistry returns a copy', () => {
    const copy = createRegistry();
    expect(copy).not.toBe(REGISTRY);
    expect(copy['btn']).toMatchObject(REGISTRY['btn']);
  });
});
