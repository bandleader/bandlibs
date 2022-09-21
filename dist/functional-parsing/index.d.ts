import * as GP from './generic-parsing';
export * from './generic-parsing';
export interface File {
    id: string;
    data: string;
}
export declare class FileCursor {
    file: File;
    pos: number;
    constructor(file: File, pos: number);
    rowAndCol(): {
        row: number;
        col: number;
        friendly: string;
        withFile: string;
    };
    curIndent(): number;
    eat(chars: number): FileCursor;
}
export interface BasicTokenInfo {
    text: string;
    start: FileCursor;
    end: FileCursor;
    token: Token<any>;
}
export declare class Token<T extends BasicTokenInfo> {
    _parser: GP.Parser<FileCursor, T>;
    constructor(_parser: GP.Parser<FileCursor, T>);
    get parserWs(): GP.Parser<FileCursor, T & {
        triviaBefore: BasicTokenInfo;
        triviaAfter: BasicTokenInfo;
    }>;
    get parserWsLb(): GP.Parser<FileCursor, T & {
        triviaBefore: BasicTokenInfo;
        triviaAfter: BasicTokenInfo;
    }>;
    named(name: string[] | string): this;
    static fromRegex<T2>(r: RegExp, fn: (x: BasicTokenInfo) => T2): Token<T2 & BasicTokenInfo>;
}
export declare const Basics: {
    LineBreak: GP.Parser<FileCursor, {
        indent: number;
    }>;
    WhitespaceOpt: GP.Parser<FileCursor, BasicTokenInfo>;
    WsLbOpt: GP.Parser<FileCursor, BasicTokenInfo>;
};
