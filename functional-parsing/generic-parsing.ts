export class Diag<C> {
    public constructor(public msg: string, public start: C, public end: C) {}
}
export abstract class ParseResult<C,O> {
    public constructor(public diags: Diag<C>[], public success: boolean) {}
}
export class ParseSuccess<C,O> extends ParseResult<C,O> {
    constructor(public output: O, public after: C, diags: Diag<C>[] = []) { super(diags, true) }
}
export class ParseFail<C,O> extends ParseResult<C,O> { 
    constructor(diags: Diag<C>[] = []) { super(diags, false) }
    // toOtherType<OtherO>(): ParseFail<C,OtherO> { return this }
}
export class Parser<C,O> {
    names = ['thing']
    constructor(public fn: (cursor: C) => ParseResult<C,O>|void) {
    }
    _resultType!: O
    static from<C,O>(other: Parser<C,O>) { 
        let firstRun = true
        const ret = new Parser<C,O>(c => {
            if (firstRun) { ret.named(other.names); firstRun = false }
            return other.fn(c)
        })
        return ret
    }
    parse(cursor: C): ParseResult<C,O> {
        const ret = this.fn(cursor)
        if (!ret) return new ParseFail<C,O>()
        return ret
    }
    named(newName: string|string[]) { this.names = Array.isArray(newName) ? newName : [newName]; return this }
    transform<O2>(fn: (x: O)=>O2) {
        return new Parser<C, O2>(c => {
            const r = this.parse(c)
            if (r instanceof ParseSuccess) return new ParseSuccess(fn(r.output), r.after, r.diags)
            return r
        })
    }
    optional() {
        return new Parser<C, O|null>(c => {
            const attempt = this.parse(c)
            return attempt instanceof ParseSuccess 
                ? attempt
                : new ParseSuccess(null, c) // no diags, same cursor
        })
    }
    then<T extends any[]>(...parsers: { [K in keyof T]: Parser<C, T[K]> }) {
        return new Parser<C, [O, ...T]>(c => {
            const results = [] as [O, ...T][], diags = [] as Diag<C>[]
            for (const p of [this, ...parsers]) {
                const r = p.parse(c)
                diags.push(...r.diags)
                if (!(r instanceof ParseSuccess)) return new ParseFail(diags)
                results.push(r.output)
                c = r.after
            }
            return new ParseSuccess(results, c, diags)
        })
    }
    list(before?: Parser<C,any>, sep?: Parser<C,any>, after?: Parser<C,any>) {
        return new Parser<C, O[]>(c => {
            const os: O[] = []
            if (before) {
                const b = before?.parse(c)
                if (!(b instanceof ParseSuccess)) return b
                c = b.after
            }
            while (true) {
                const nxt = this.parse(c)
                if (!(nxt instanceof ParseSuccess)) break //TODO if after a sep, expect another item
                os.push(nxt.output)
                c = nxt.after
                if (sep) {
                    const sp = sep.parse(c)
                    if (!(sp instanceof ParseSuccess)) break
                    c = sp.after
                }
            }
            if (after) {
                const aft = after.parse(c)
                if (!(aft instanceof ParseSuccess)) return new ParseSuccess(os, c, [new Diag("Expected end of list", c, c)])
                c = aft.after
            }
            return new ParseSuccess(os, c)
        })
    }
    /*
    oneOrMore
    zeroOrMore
    or(...)
    */
}
class ParserContext<C,O> {
    constructor(public cursor: C) {}
    diags: Diag<C>[] = []
    eat<Z>(parser: Parser<C,Z>) {
        const result = parser.parse(this.cursor)
        if (result.success) { const s = result as ParseSuccess<C,Z>; this.cursor = s.after; return s.output }
        return null
    }
    addDiag(msg: string, start = this.cursor, end = this.cursor) { this.diags.push(new Diag<C>(msg, start, end))  }
    success(output: O) { return new ParseSuccess(output, this.cursor, this.diags) }
    fail() { return new ParseFail(this.diags) }
    static parser<C,O>(fn: (ctx: ParserContext<C,O>)=>ParseResult<C,O>|undefined) {
        return new Parser<C,O>(c => {
            const ctx = new ParserContext<C,O>(c)
            return fn(ctx)
        })
    }
}
