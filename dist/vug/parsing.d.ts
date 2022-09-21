import * as EmitRenderFunc from "./emit-renderFunc";
export declare class VugNode {
    tag: string;
    words: VugWord[];
    children: VugNode[];
    constructor(tag: string, words?: VugWord[], children?: VugNode[]);
    getWord(key: string): string | void;
    getWordErrIfCalc(key: string): string;
}
export declare class VugWord {
    key: string;
    value: string;
    isExpr: boolean;
    constructor(key: string, value: string, isExpr: boolean);
}
export declare function compile(text: string): {
    ast: VugNode[];
    toAstJson: () => string;
    toVueTemplate: () => string;
    toRenderFunc: (renderFuncOpts?: EmitRenderFunc.RenderFuncOpts) => string;
};
export declare function splitThree(what: string, sepChar?: string): string[];
export declare function parseDoc(html: string): VugNode[];
