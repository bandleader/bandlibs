import { VugNode } from "./parsing";
export declare function processCssProp(key: string, value: string): null | Record<string, string>;
export declare function mainTransform(n: VugNode): VugNode;
export declare function flexArg(n: VugNode): VugNode;
export declare const imbaDict: Record<string, string>;
export declare const cssProperties: string[];
