import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'

export function blankDirDangerously(dir: string) {
    if (fs.existsSync(dir)) fs.rmdirSync(dir, { recursive: true })
    fs.mkdirSync(dir)
}
export function shell(cmd: string) {
    console.log("> " + cmd)
    child_process.execSync(cmd, { stdio: 'inherit' })
}
export function tarFiles(tarPath: string, filesSepSpace: string) {
    return shell(`tar -cvf ${tarPath} ${filesSepSpace}`)
}
export function createZip(fileList: string, outFilePath = `./tmp-${Math.random().toString(36).substring(7)}.zip`) {
    if (!fs.existsSync("/usr/bin/zip")) shell("apk add zip") // Install zip if not installed
    shell(`zip -r ${outFilePath} ${fileList}`)
    return outFilePath
}
export function envRef(name: string) {
    // Checks an environment variable and returns a REFERENCE to it in bash style: $VARNAME
    if (!process.env[name]) throw `Environment variable '${name}' is expected to be set`
    return '$' + name
}
export function foldableSection(headerText: string, fn: Function, preCollapse = false) {
    const sectionName = Math.random().toString(36).substring(7)
    console.log(`\u001b[0Ksection_start:${Date.now()}:${sectionName}${preCollapse ? '[collapsed=true]' : ''}\r\u001b[0K${headerText}`)
    try {
        fn()
    } finally {
        console.log(`\u001b[0Ksection_end:${Date.now()}:${sectionName}\r\u001b[0K`)
    }
}
const _colored = (num: number) => (text: string|TemplateStringsArray, ...vals: string[]) => `\u001b[${num}m${Array.isArray(text) ? text.map((x,i) => x + (vals[i] || '')).join('') : text}\u001b[0m`
const _colorLog = (num: number) => (text: string|TemplateStringsArray, ...vals: string[]) => console.log(_colored(num)(text ,...vals))
export const colorLog = {
    red: _colorLog(31),
    green: _colorLog(32),
    yellow: _colorLog(33),
    blue: _colorLog(34),
    magenta: _colorLog(35),
    cyan: _colorLog(36),
    lightGray: _colorLog(37),
    darkGray: _colorLog(90),
    lightRed: _colorLog(91),
    lightGreen: _colorLog(92),
    lightYellow: _colorLog(93),
    lightBlue: _colorLog(94),
    lightMagenta: _colorLog(95),
    lightCyan: _colorLog(96),
    white: _colorLog(97),
}
export const colored = {
    red: _colored(31),
    green: _colored(32),
    yellow: _colored(33),
    blue: _colored(34),
    magenta: _colored(35),
    cyan: _colored(36),
    lightGray: _colored(37),
    darkGray: _colored(90),
    lightRed: _colored(91),
    lightGreen: _colored(92),
    lightYellow: _colored(93),
    lightBlue: _colored(94),
    lightMagenta: _colored(95),
    lightCyan: _colored(96),
    white: _colored(97),
}
export function ensureDir(pathToFile: string) {
    const pathName = path.dirname(pathToFile)
    fs.mkdirSync(pathName, { recursive: true })
    return pathToFile
}
export function downloadTo(url: string, localPath = randId()) {
    return fetch(url).then(x => x.text()).then(x => fs.writeFileSync(localPath, x)).then(() => localPath)
}
export function randId() {
    return Math.random().toString(36).substring(7)
}
