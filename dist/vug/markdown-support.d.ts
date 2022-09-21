import { VugNode } from "./parsing";
export declare function lineTransformBasedOnPrefixes(line: string): string;
export declare function convertSingleLineOfText(txt: string): string;
export declare function aggressiveMarkdownParagraphDetection(tag: string, words: string[]): boolean;
export declare function fixMarkdownMacro(n: VugNode): VugNode;
