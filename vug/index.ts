import * as V1 from './v1'
import * as V2 from './v2'
export { V1, V2 } // for advanced uses

/*
To get Vug support in Vue templates, there are a few options.
1) Use `ViteTransformPlugin`. In your vite.config.ts, import Vug and then in `plugins`, add Vug.ViteTransformPlugin() to the list.
    It transforms the file before Vite even sends it to the template compiler, so it works well.
    Just add it BEFORE the Vue() plugin -- otherwise Vue will already complain that it doesn't know how to process Vug. (Even though I specified `enforce: "pre"`).
    (Before I figured this out, I used <template vug> instead of <template lang="vug">, and that actually worked quite well.
    THIS IS THE RECOMMENDED OPTION.
    IT IS SIMPLEST.
    It also opens the door to doing fancy stuff later with styles etc.
2) Use `VueConsolidatePlugin` to add Vug as a supported preprocessor. So you can do <template lang="vug">.
    To get vite to use us, however, you have to override the requirer. Change the vue plugin init as follows:
        vue({
          template: {
            preprocessCustomRequire: (lang: string): lang === "vug" ? Vug.VueConsolidatePlugin() : undefined
          }
        }) 
    (See https://github.com/vuejs/core/blob/471f66a1f6cd182f3e106184b2e06f7753382996/packages/compiler-sfc/src/compileTemplate.ts#L124)
    The downside is that this disables all other preprocessors, which is usually fine.
    If you do want to use other ones, you'll have to install consolidate and delegate to it:
        import consolidate from '@vue/consolidate' // requires npm install @vue/consolidate
        preprocessCustomRequire: (lang: string): lang === "vug" ? Vug.VueConsolidatePlugin() : consolidate[lang]
    It would be nice to patch `consolidate` right there in the file, however that didn't work -- @vue/compiler-sfc (which is used by the vue plugin) includes its own copy.
        import consolidate from '@vue/consolidate'
        consolidate['vug'] = Vug.viteRenderer() // no effect :-(
3) You can however simply patch that copy to add support, but that's messy, and won't work on your build server, and will break when you update vite, etc.
    In your `vite.config.ts`:
        globalThis.Vug = Vug
    In `node_modules/@vue/compiler-sfc/dist/compiler-sfc.cjs.js`:
    Look for `exports.pug =` or (any other language), and add this alongside it:
        exports.vug = { render(...args) { globalThis.Vug.VueConsolidatePlugin().render(...args) } }
    (You can't do just `exports.vug = globalThis.Vug.VueConsolidatePlugin()` I think because it runs before you do)
4) You could maybe fake one of the existing packages?
    In your `vite.config.ts`, as before:
        globalThis.Vug = Vug
    In your node_modules create a `plates/index.js` as follows:
        module.exports = { bind: text => globalThis.Vug.load(text).toVueTemplate() }
    That way, when consolidate tries `require('plates')` it'll get your package, and you're following the plates interface. 
    You would still need to make sure that node_modules/plates ends up on your build server too. You could commit it to the repo. You could make a script that writes it on the spot.
*/

interface VugOptions {
  _tempLangVersion?: number
}
export function ViteTransformPlugin(opts: VugOptions = {}) {
  return {
    name: 'vite-plugin-vue-vug',
    enforce: "pre" as const,
    transform(code: string, id: string) {
      const compile = (what: string) => (opts._tempLangVersion||1.2) >= 2 ? V2.Parsing.compile(what) : V1.v1Load(what)
      if (id.endsWith(".astro")) {
        // console.log("CODE:",code.replace(/\r/g, '/r'))
        const astroDelim = "$$render`Vug:\n", styleDelim = "`;\n}"
        if (!code.includes(astroDelim)) return;
        let [top, middle] = code.split(astroDelim), bottom = ""
        top = top.replace('Vug:\n', "")
        ;[middle, bottom] = middle.split(styleDelim)
        bottom ||= ""
        middle = compile(middle).toVueTemplate()
        // console.log("DOING", middle.length)
        return top + astroDelim + middle + styleDelim + bottom
      }
      const isVueFile = id.endsWith('.vue')
      if (!isVueFile && !/\.m?(j|t)sx?$/.test(id)) return;
      
      code = transformVugTemplateStrings(code)

      if (!id.endsWith(".vue")) return;
      const origCode = code

      const findTemplateTag = /<template lang=['"]?vug['" >]/g.exec(code)
      if (!findTemplateTag) return;
      const startOfTemplateTag = findTemplateTag.index
      const startOfCode = code.indexOf(">", startOfTemplateTag) + 1
      const endOfCode = code.lastIndexOf("</template>")
      const vugCode = code.substring(startOfCode, endOfCode)
      const output = compile(vugCode).toVueTemplate()
      code = code.substring(0, startOfTemplateTag) + "<template>" + output + code.substring(endOfCode) // We have to replace the template tag so the SFC compiler doesn't error because it doesn't know how to process Vue
      // require('fs').writeFileSync(`${require('os').tmpdir()}/vugtmp_` + id.split("/").slice(-1)[0], code) // For easy debugging output uncomment

      // Inject some code (experimental)
      if (origCode.includes('route path=')) {
        const decls = "import * as VugVue from 'vue'"
        const statements = `
          const inst = VugVue.getCurrentInstance()
          window.addEventListener('popstate', () => inst.update())
          setTimeout(() => inst.update(), 10)
        `
        const scriptTag = code.match(/<script[^>]+>/)
        const scriptEndTag = code.match(/<\/script>/)
        if (!scriptTag || !scriptEndTag) throw "Can't inject script; tag not found" // TODO add one?
        code = code.replace(scriptTag[0], scriptTag[0] + '\n' + decls + '\n')
        code = code.replace(scriptEndTag[0], '\n' + statements + '\n' + scriptEndTag)
      }

      if (origCode.includes("// VUGDEBUG")) console.log(`===============\nVug output ${new Date()}\n${code}\n===============`)
      return code
    }
  }
}

export function load(vugCode: string, opts: VugOptions = {}): { ast: any, toVueTemplate: (whitespace?: boolean) => string, toRenderFunc: () => string } {
  const useV2 = (opts._tempLangVersion||1.2) >= 2
  if (!useV2) return V1.v1Load(vugCode)
  return V2.Parsing.compile(vugCode)  
}

export function vug(vugCode: TemplateStringsArray, ...args: unknown[]) { throw "Vug.vug() template-tag function was called at runtime -- this means that you haven't properly set up a compile-time plugin to replace calls to it. If you meant to convert Vug code at runtime, use one of the provided methods for doing so." }

export function transformVugTemplateStrings(code: string, opts: {templateTag?: string} = {}) {
  let weFoundOne = false
  const templateTag = opts.templateTag || 'vug'
  const hFuncAlias = "_vugHFunc"
  while (true) {

    const ind = code.indexOf(templateTag + "`")
    if (ind<0) break;
    weFoundOne = true;
    const end = code.indexOf("`", ind+templateTag.length+1)
    let contents = code.substring(ind+templateTag.length+1, end)
    
    contents = contents.replace(/@click/g, ':onClick') // temp to support Vue syntax
    let converted = V2.Parsing.compile(contents).toRenderFunc({h: hFuncAlias}) // callback(contents)
    converted = converted.replace(/\{\{/g, '" + ') // temp to support Vue syntax
    converted = converted.replace(/\}\}/g, ' + "') // temp to support Vue syntax

    code = code.slice(0, ind) + converted + code.slice(end+1)
  }
  if (weFoundOne) {
    // replace imports
    code = code.replace(/import \{ vug \} from ['"][^'"\n]*vug[^'"\n]*['"]/g, `import { h as ${hFuncAlias} } from 'vue'`)
  } 
  return code
}
export const VueConsolidatePlugin = () => ({
  // Implements Vite's `consolidate` interface: https://github.com/vuejs/core/blob/471f66a1f6cd182f3e106184b2e06f7753382996/packages/compiler-sfc/src/compileTemplate.ts#L89  
  render(code: string, data: object, callback: (err: any, result?: string)=>void) {
    try {
      callback(undefined, V1.v1Load(code).toVueTemplate())
    } catch (e) {
      callback(String(e))
    }
  }  
})
