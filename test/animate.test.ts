import { describe, it, expect } from 'vitest';
import { getAnimation, ANIMATIONS, parseAnimationToken, collectAnimationCss } from '../src/animate';

describe('WFL Animation Presets', () => {
  it('resolves ~fade to fade animation with default duration', () => {
    const result = parseAnimationToken('~fade');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('fade');
    expect(result!.duration).toBe(300);
  });

  it('resolves ~slide300 to slide animation with 300ms', () => {
    const result = parseAnimationToken('~slide300');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('slide');
    expect(result!.duration).toBe(300);
  });

  it('returns null for unknown animation', () => {
    expect(parseAnimationToken('~unknown')).toBeNull();
  });

  it('generates CSS keyframes for fade', () => {
    const anim = parseAnimationToken('~fade');
    const css = getAnimation(anim!.name, anim!.duration);
    expect(css).toContain('@keyframes');
    expect(css).toContain('anim-fade');
  });

  it('collects animation CSS from multiple tokens', () => {
    const css = collectAnimationCss(['~fade', '~slide500']);
    expect(css).toContain('anim-fade');
    expect(css).toContain('anim-slide');
    expect(css).toContain('500ms');
  });
});
