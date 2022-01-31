import * as GP from './generic-parsing'
export * from './generic-parsing'

export interface File {
    id: string
    data: string
}

export class FileCursor {
    public constructor(public file: File, public pos: number) {}
    rowAndCol() { // Can be optimized but this is fine
        let row = 0, col = 0
        for (let i = 0; i < this.pos; i++) {
            if (this.file.data[i] === "\n") { row++; col = 0 }
            else col++
        }
        return { row, col, friendly: `${row+1}:${col+1}`, withFile: `${this.file.id}:${row+1}:${col+1}` }
    }
    curIndent() { // Can be optimized but this is fine
        const lastLineBreak = this.file.data.lastIndexOf("\n", this.pos)
        let indent = 0
        for (let x = lastLineBreak + 1; x < this.pos; x++) {
            if (this.file.data[x] === "\t") indent += 8
            else if (this.file.data[x] === " ") indent += 1
            else break
        }
        return indent
    }
    eat(chars: number) {
        return new FileCursor(this.file, this.pos + chars)
    }
}
/* TODO: 
    'list' helper method
    Lexer that lets you add RegExps, and for each one, returns a parser that runs it on any cursor.
        LATER: Optionally, it will run all its registered ones in order, and cache the result, and return only the one that matches. (Perhaps even if we do this, more than one can match?)
        The parser produces a Token<Cursor> which includes the before and after.
        Optionally it consumes whitespace before and probably after. This is a good place to do it because then the tokens have the right span.
        It should possibly handle indentation as well, but have to think that through again.
            I think this is only when we are looking for a lineBreak token (which is a special mode in the lexer), it has a property of indentLevel. And otherwise linebreaks are eaten I think.
*/

export interface BasicTokenInfo { text: string, start: FileCursor, end: FileCursor, token: Token<any> }

export class Token<T extends BasicTokenInfo> {
    constructor(public _parser: GP.Parser<FileCursor, T>) { this._parser = _parser.transform(x => { x.token = this; return x }) }
    get parserWs() { // Eat whitespace
        return Basics.WhitespaceOpt.then(this._parser, Basics.WhitespaceOpt).transform(([triviaBefore,b,triviaAfter])=>Object.assign(b,{triviaBefore,triviaAfter})).named(this._parser.names)
    }
    get parserWsLb() {
        return Basics.WsLbOpt.then(this._parser, Basics.WsLbOpt).transform(([triviaBefore,b,triviaAfter])=>Object.assign(b,{triviaBefore,triviaAfter})).named(this._parser.names)
    }
    named(name: string[]|string) { this._parser.named(name); return this }
    static fromRegex<T2>(r: RegExp, fn: (x: BasicTokenInfo)=>T2) {
        const basicParser = new GP.Parser<FileCursor, BasicTokenInfo>(c => {
            const m = c.file.data.slice(c.pos).match(r)
            if (!m) return new GP.ParseFail()
            if (m.index !== 0) return new GP.ParseFail()
            const text = m[0], start = c, end = c.eat(text.length)
            return new GP.ParseSuccess({ text, start, end }, end)
        })
        return new Token(basicParser.transform(x => Object.assign(fn(x), x)))
    }
}

export const Basics = {
    LineBreak: new GP.Parser<FileCursor, { indent: number }>(c => {
        if (c.file.data[c.pos] === "\r") c = c.eat(1)
        if (c.file.data[c.pos] === "\n") {
            // Move to next non-whitespace (and return indent level)
            let cur = c.pos + 1
            while (c.file.data[cur] === " " || c.file.data[cur] === "\t") cur++
            return new GP.ParseSuccess({indent: cur - c.pos- 1}, c.eat(cur - c.pos))
        }
    }),
    WhitespaceOpt: Token.fromRegex(/^[ \t]+/, x => x)._parser.optional(),
    WsLbOpt: Token.fromRegex(/^[ \t\r\n]+/, x => x)._parser.optional(),
}
