export declare class Diag<C> {
    msg: string;
    start: C;
    end: C;
    constructor(msg: string, start: C, end: C);
}
export declare abstract class ParseResult<C, O> {
    diags: Diag<C>[];
    success: boolean;
    constructor(diags: Diag<C>[], success: boolean);
}
export declare class ParseSuccess<C, O> extends ParseResult<C, O> {
    output: O;
    after: C;
    constructor(output: O, after: C, diags?: Diag<C>[]);
}
export declare class ParseFail<C, O> extends ParseResult<C, O> {
    constructor(diags?: Diag<C>[]);
}
export declare class Parser<C, O> {
    fn: (cursor: C) => ParseResult<C, O> | void;
    names: string[];
    constructor(fn: (cursor: C) => ParseResult<C, O> | void);
    _resultType: O;
    static from<C, O>(other: Parser<C, O>): Parser<C, O>;
    parse(cursor: C): ParseResult<C, O>;
    named(newName: string | string[]): this;
    transform<O2>(fn: (x: O) => O2): Parser<C, O2>;
    optional(): Parser<C, O>;
    then<T extends any[]>(...parsers: {
        [K in keyof T]: Parser<C, T[K]>;
    }): Parser<C, [O, ...T]>;
    list(before?: Parser<C, any>, sep?: Parser<C, any>, after?: Parser<C, any>): Parser<C, O[]>;
}
