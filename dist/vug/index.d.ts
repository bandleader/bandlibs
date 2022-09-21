interface VugOptions {
    _tempLangVersion?: number;
}
export declare function ViteTransformPlugin(opts?: VugOptions): {
    name: string;
    enforce: "pre";
    transform(code: string, id: string): string;
};
export declare function load(vugCode: string, opts?: VugOptions): {
    ast: any;
    toVueTemplate: (whitespace?: boolean) => string;
    toRenderFunc: () => string;
};
export declare function vug(vugCode: TemplateStringsArray, ...args: unknown[]): void;
export declare function transformVugTemplateStrings(code: string, opts?: {
    templateTag?: string;
}): string;
export declare const VueConsolidatePlugin: () => {
    render(code: string, data: object, callback: (err: any, result?: string) => void): void;
};
export {};
