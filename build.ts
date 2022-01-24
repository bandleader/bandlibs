import { OutputOptions, rollup, RollupBuild } from 'rollup';
import * as typescript from 'rollup-plugin-typescript2'
import { terser } from "rollup-plugin-terser"
import * as fs from 'fs'

async function go() {
  await build("./vue-fiddle-helper/for-script-tag.ts", "vue-fiddle-helper", "VueFiddle")
}
go()

async function build(mainFile: string, outFilePrefix: string, iifeName: string) {
  // Create bundle
  let bundle: RollupBuild, buildFailed = false
  try {    
    bundle = await rollup({
      plugins: [typescript()],
      input: mainFile
    })
    const outputOptions: OutputOptions[] = [
      {
        file: outFilePrefix + ".browser.min.js",
        format: 'iife',
        name: iifeName,
        plugins: [terser()],
      },
      {
        file: outFilePrefix + ".es6.js",
        format: 'es',
      },
      {
        file: outFilePrefix + ".cjs.js",
        format: 'cjs',
      },
    ]
    for (const outputOption of outputOptions) {
      const { output } = await bundle.generate(outputOption)
  
      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          throw "No assets supposed to be here"
        } else {
          // Remove the TSLib 'important' comment
          const line = "***************************************************************************** */\n"
          if (chunkOrAsset.code.includes(line)) chunkOrAsset.code = chunkOrAsset.code.split(line)[1]
          
          // Write file
          console.info("Writing", chunkOrAsset.name, "to", chunkOrAsset.fileName)        
          fs.writeFileSync(`./dist/${chunkOrAsset.fileName}`, chunkOrAsset.code)
        }
      }
    }
  } catch (error) {
    buildFailed = true
    console.error(error)
  }
  if (bundle) {
    await bundle.close()
  }
  process.exit(buildFailed ? 1 : 0)
}
