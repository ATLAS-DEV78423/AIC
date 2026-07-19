import { Registry } from './types.js';
export declare const REGISTRY: Registry;
export declare const REGISTRY_LIB: Registry;
/** Merge multiple registries (later override earlier at the entry level). */
export declare function mergeRegistries(...registries: Registry[]): Registry;
