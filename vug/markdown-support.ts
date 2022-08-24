import { clone } from "./macros"
import { VugNode } from "./parsing"

export function lineTransform(line: string) {
    const convLine = (txt: string): string => globalThis.convertMarkdownLine ? globalThis.convertMarkdownLine(txt) : txt
    const re = (regexp: RegExp, transform: (x: RegExpMatchArray)=>string) => (input: string) => { const result = input.match(regexp); if (!result) return null; return transform(result) }
    const funcs: ((input: string) => string|null)[] = [
        re(/^(#+) (.*)/, x => `h${x[1].length} -- ${convLine(x[2])}`),
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

export function fixMarkdownMacro(n: VugNode) {
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