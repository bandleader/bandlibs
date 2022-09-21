import { VugNode, VugWord } from "./parsing";
export declare let v1compat: boolean;
export declare function clone(node: VugNode, changes: Record<string, string>): VugNode;
export declare function wordTransformer(fn: (w: VugWord) => VugWord): (n: VugNode) => VugNode;
export declare function runAll(node: VugNode): VugNode;
