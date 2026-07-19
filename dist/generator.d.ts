import { ResolvedComponent } from './types.js';
export interface Import {
    path: string;
    name: string;
}
export interface GeneratedOutput {
    imports: Import[];
    jsx: string;
    css: string;
    stateCode: string;
}
export declare function generate(component: ResolvedComponent): GeneratedOutput;
