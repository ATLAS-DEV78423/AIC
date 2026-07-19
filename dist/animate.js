// ── Animation Presets for WFL ──
// Each animation has a @keyframes rule and a generated CSS class.
const KEYFRAMES = {
    fade: `@keyframes anim-fade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}`,
    slide: `@keyframes anim-slide {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}`,
    bounce: `@keyframes anim-bounce {
  0% { opacity: 0; transform: scale(0.3); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}`,
    zoom: `@keyframes anim-zoom {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}`,
    flip: `@keyframes anim-flip {
  0% { opacity: 0; transform: perspective(400px) rotateX(90deg); }
  100% { opacity: 1; transform: perspective(400px) rotateX(0); }
}`,
    lift: `@keyframes anim-lift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}`,
    glow: `@keyframes anim-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(59,130,246,0); }
  50% { box-shadow: 0 0 20px rgba(59,130,246,0.5); }
}`,
    pulse: `@keyframes anim-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}`,
    shake: `@keyframes anim-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}`,
    spin: `@keyframes anim-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
};
const DEFAULT_DURATION = 300;
const KNOWN = new Set(Object.keys(KEYFRAMES));
/** Record of all animation names with their default durations. */
export const ANIMATIONS = {};
for (const name of KNOWN) {
    ANIMATIONS[name] = { name: name, duration: DEFAULT_DURATION };
}
/** Parse "~fade" or "~slide500" → { name, duration }. Returns null for unknown. */
export function parseAnimationToken(token) {
    const raw = token.replace(/^~/, '');
    const m = raw.match(/^([a-zA-Z]+)(\d+)?$/);
    if (!m)
        return null;
    const name = m[1];
    if (!KNOWN.has(name))
        return null;
    const duration = m[2] ? parseInt(m[2], 10) : DEFAULT_DURATION;
    return { name, duration };
}
/** Get the full CSS (@keyframes + class) for a named animation at the given duration. */
export function getAnimation(name, duration) {
    const base = KEYFRAMES[name];
    if (!base)
        return '';
    return `${base}\n\n.anim-${name} { animation: ${name} ${duration}ms ease-out; }`;
}
/** Collect all CSS for a list of animation tokens (e.g. ["~fade", "~slide500"]). */
export function collectAnimationCss(tokens) {
    return tokens
        .map(t => {
        const p = parseAnimationToken(t);
        return p ? getAnimation(p.name, p.duration) : '';
    })
        .filter(Boolean)
        .join('\n\n');
}
//# sourceMappingURL=animate.js.map