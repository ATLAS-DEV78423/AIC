export type AnimationName = 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'lift' | 'glow' | 'pulse' | 'shake' | 'spin';
export interface AnimConfig {
    name: AnimationName;
    duration: number;
}
/** Record of all animation names with their default durations. */
export declare const ANIMATIONS: Record<AnimationName, AnimConfig>;
/** Parse "~fade" or "~slide500" → { name, duration }. Returns null for unknown. */
export declare function parseAnimationToken(token: string): AnimConfig | null;
/** Get the full CSS (@keyframes + class) for a named animation at the given duration. */
export declare function getAnimation(name: AnimationName, duration: number): string;
/** Collect all CSS for a list of animation tokens (e.g. ["~fade", "~slide500"]). */
export declare function collectAnimationCss(tokens: string[]): string;
