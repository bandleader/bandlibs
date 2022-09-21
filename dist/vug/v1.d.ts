export declare type VugAttr = {
    key: string;
    value?: string;
    isExpr: boolean;
    kind: string;
};
export declare type VugNode = {
    tag: string;
    attrs: VugAttr[];
    innerHtml?: string;
    children: VugNode[];
};
export declare function compile(text: string): WithChildren<{
    info: {
        text: string;
        indent: number;
    };
    tag: string;
    attrs: VugAttr[];
    innerHtml?: string;
    children: VugNode[];
}>[];
export declare function v1Load(text: string): {
    ast: WithChildren<{
        info: {
            text: string;
            indent: number;
        };
        tag: string;
        attrs: VugAttr[];
        innerHtml?: string;
        children: VugNode[];
    }>[];
    toVueTemplate: (whitespace?: boolean) => string;
    toRenderFunc: () => string;
};
declare type WithChildren<T> = T & {
    children: WithChildren<T>[];
};
export {};
