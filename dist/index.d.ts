#!/usr/bin/env node
import { GeneratedOutput } from './generator.js';
import { Registry } from './types.js';
export declare function compile(wflSource: string, registry?: Registry): GeneratedOutput;
/** Wrap compiled output in a complete .tsx file string */
export declare function formatComponentOutput(output: GeneratedOutput, componentName?: string): string;
