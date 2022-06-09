import { OutputOptions, rollup, RollupBuild } from 'rollup';
import * as typescript from 'rollup-plugin-typescript2'
import { terser } from "rollup-plugin-terser"
import * as fs from 'fs'

async function go() {
  try {    
    await build("./vue-fiddle-helper/for-script-tag.ts", "vue-fiddle-helper", "VueFiddle")
    await build("./vug/index.ts", "vug", "Vug")
    await build("./vue-class-plus/index.ts", "vue-class-plus", "VCP")
    await build("./tiny-vite-ssr/index.ts", "tiny-vite-ssr")
    await build("./flexible-rpc/index.ts", "flexible-rpc")
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
go()

async function build(mainFile: string, outFilePrefix: string, iifeName?: string) {
  // Create bundle
  console.log("-------------------\nBUILDING", outFilePrefix)
  const bundle = await rollup({
    plugins: [typescript()],
    input: mainFile
  })
  const outputOptions: OutputOptions[] = [
    {
      file: outFilePrefix + ".es6.js",
      format: 'es',
    },
    {
      file: outFilePrefix + ".cjs.js",
      format: 'cjs',
    },
  ]
  if (iifeName) outputOptions.push({
    file: outFilePrefix + ".browser.min.js",
    format: 'iife',
    name: iifeName,
    plugins: [terser()],
  })
  for (const outputOption of outputOptions) {
    const { output } = await bundle.generate(outputOption)

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.type === 'asset') {
        throw "No assets supposed to be here"
      } else {
        // Remove the TSLib 'important' comment
        const toRemove = "/*! *****************************************************************************\n  Copyright (c) Microsoft Corporation.\n\n  Permission to use, copy, modify, and/or distribute this software for any\n  purpose with or without fee is hereby granted.\n\n  THE SOFTWARE IS PROVIDED \"AS IS\" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\n  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\n  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\n  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\n  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\n  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\n  PERFORMANCE OF THIS SOFTWARE.\n  ***************************************************************************** */"
        while (chunkOrAsset.code.includes(toRemove)) chunkOrAsset.code = chunkOrAsset.code.replace(toRemove, '')
        
        // Write file
        console.info("Writing", chunkOrAsset.name, "to", chunkOrAsset.fileName)        
        fs.writeFileSync(`./dist/${chunkOrAsset.fileName}`, chunkOrAsset.code)
      }
    }
  }
  bundle.close()
}
