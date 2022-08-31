import { clone } from "./macros"
import { VugNode } from "./parsing"
import { marked } from './marked.esm.js'

export function lineTransformBasedOnPrefixes(line: string) {
    const convLine = convertSingleLineOfText
    const re = (regexp: RegExp, transform: (x: RegExpMatchArray)=>string) => (input: string) => { const result = input.match(regexp); if (!result) return null; return transform(result) }
    const slug = (text: string) => text.replace(/ /g, '-').replace(/[^A-Za-z0-9א-ת_./\-]+/g, '').toLowerCase() // trying to match Marked
    const funcs: ((input: string) => string|null)[] = [
        re(/^(#+) (.*)/, x => `h${x[1].length} id=${JSON.stringify(slug(x[2]))} -- ${convLine(x[2])}`),
        re(/^[-*] (.*)/, x => `markdownlistitem-ul -- ${convLine(x[1])}`),
        re(/^[0-9]+[.)] (.*)/, x => `markdownlistitem-ol -- ${convLine(x[1])}`),
        re(/^> (.*)/, x => `markdownlistitem-blockquote.blockquote -- ${convLine(x[1])}`),
        re(/^[+|] (.*)/, x => `p -- ${convLine(x[1])}`),
        re(/^\|\| (.*)/, x => `div -- ${convLine(x[1])}`),
        re(/^\|\|\| (.*)/, x => `-- ${convLine(x[1])}`),
    ]
    const tryThem = funcs.find(f => f(line) !== null)
    if (tryThem) return tryThem(line)
    return line
}

export function convertSingleLineOfText(txt: string) {
    // if (!globalThis.convertMarkdown) return txt
    let ret = (marked.parse(txt) as string).replace(/\n/g, ' ').trim()
    if (ret.startsWith("<p>")) ret = ret.slice(3, ret.length - 4)
    return ret
}

export function aggressiveMarkdownParagraphDetection(tag: string, words: string[]): boolean {
    // After parsing into a tag and words, returns whether the line still looks like a Markdown paragraph rather than a line containing an element, based on heuristics
    /* Known fail cases:
        Let's talk about something          (because the quote causes it to be parsed as one word)
            (maybe we should use simpler word parsing for this test. Though that needs reparsing so it'll be slow)
    */
    const hasAndNotAtEnd = (text: string, char: string) => { const ind = text.indexOf(char); return ind >= 0 && ind != (text.length - char.length) }
    const looksCodey = (w: string) => w === ">" || ["=", ".", ":", "#"].some(ch => hasAndNotAtEnd(w, ch))
    return words.length >= 3 && !looksCodey(tag) && !words.slice(0, 3).some(looksCodey)
}

export function fixMarkdownMacro(n: VugNode) {
    // Handles list items and blockquotes, which need to be grouped together with siblings of the same type, into a container of the appropriate type
    // (markdownlistitem-ul)+       --->        ul > li
    // (markdownlistitem-ol)+       --->        ol > li
    // (blockquote.blockquote)+     --->        blockquote.blockquote > p
    let foundAny = false, children: VugNode[] = [], lastTag = ""
    for (const c of n.children) {
        if (c.tag.startsWith("markdownlistitem-")) {
            foundAny = true
            const kind = c.tag.split("-")[1]
            const item = clone(c, { tag: kind === 'blockquote.blockquote' ? 'p' : "li" })
            if (lastTag === c.tag) {
                children.slice(-1)[0].children.push(item)
            } else {
                const container = new VugNode(kind, [], [item])
                children.push(container)
            }
        } else {
            children.push(c)
        }
        lastTag = c.tag
    }
    if (!foundAny) return n
    return new VugNode(n.tag, n.words, children)
}