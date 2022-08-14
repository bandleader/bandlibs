import * as V2 from './parsing'
import * as V1 from './v1'

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
      if (!id.endsWith(".vue")) return;
      const findTemplateTag = /<template lang=['"]?vug['" >]/g.exec(code)
      if (!findTemplateTag) return;
      const startOfTemplateTag = findTemplateTag.index
      const startOfCode = code.indexOf(">", startOfTemplateTag) + 1
      const endOfCode = code.lastIndexOf("</template>")
      const vugCode = code.substring(startOfCode, endOfCode)
      const output = (opts._tempLangVersion||1.2) >= 2 ? V2.compile(vugCode).toVueTemplate() : V1.v1Load(vugCode).toVueTemplate()
      return code.substring(0, startOfTemplateTag) + "<template>" + output + code.substring(endOfCode) // We have to replace the template tag so the SFC compiler doesn't error because it doesn't know how to process Vue
    }
  }
}

export function load(vugCode: string, opts: VugOptions = {}): { ast: any, toVueTemplate: (whitespace?: boolean) => string } {
  const useV2 = (opts._tempLangVersion||1.2) >= 2
  if (!useV2) return V1.v1Load(vugCode)
  return V2.compile(vugCode)  
}

export function transformVugReact(code: string) {
  while (true) {
    const ind = code.indexOf("vugReact`")
    if (ind<0) break;
    const end = code.indexOf("`", ind+10)
    let contents = code.substring(ind+9, end)
    
    contents = contents.replace(/@click/g, ':onClick') // temp to support Vue syntax
    let converted = V1.v1Load(contents).toRenderFunc()
    converted = converted.replace(/\{\{/g, '" + ') // temp to support Vue syntax
    converted = converted.replace(/\}\}/g, ' + "') // temp to support Vue syntax

    code = code.slice(0, ind) + converted + code.slice(end+1)
    console.log(code)
  }
  return code
}
export function ViteReactPlugin() {
  return {
    name: 'vite-plugin-react-vug',
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!/\.m?(j|t)sx?$/.test(id)) return;
      return transformVugReact(code)
    }
  }
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
