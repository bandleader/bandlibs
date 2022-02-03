export default function remixDataLoaderVitePlugin() {
    return {
      name: "remixDataLoaderVitePlugin",
      enforce: "pre" as const,
      async transform(code: string, id: string, options?: {ssr: boolean}) {
        // if (id.includes(".vue")) console.log(id, options?.ssr)
        if (!id.endsWith(".vue")) return undefined
        
        const srch = "async function loader("
        if (code.includes(srch)) {
          let scriptToAddToEnd = ""
          
          // On the client, replace the loader function with one that gets the data injected into the source. Rename the old loader function so that it gets excluded by tree-shaking.
          if (!options?.ssr) code = code.replace(srch, `
            async function loader() { 
              const route = window.location.pathname
              if (route === window.dataFromLoader_route) {
                return window.dataFromLoader 
              } else {
                window.dataFromLoader_route = route
                // console.info("Refetching data...", route)
                const text = await fetch(route).then(x => x.text())
                window.dataFromLoader = JSON.parse(text.split('/*DATAFROMLOADER*/')[1])
                return await window.dataFromLoader
              }
            }
            async function __serverLoader(`)
          // On the server, leave the regular loader function, but add some code that assigns it to the SSR context so the server can inject it into the source.
          if (options?.ssr) scriptToAddToEnd += `;
            import { useSSRContext as __vite_useSSRContext } from 'vue'
            const scriptTagPromise = loader().then(data => '<' + 'script' + '>window.dataFromLoader_route = window.location.pathname; window.dataFromLoader = /*DATAFROMLOADER*/' + JSON.stringify(data) + '/*DATAFROMLOADER*/<' + '/script' + '>')
            __vite_useSSRContext().headEndContent = __vite_useSSRContext().headEndContent || []
            __vite_useSSRContext().headEndContent.push(scriptTagPromise)
            ;`
          
          if (!scriptToAddToEnd) { 
            // done
          } else if (!code.includes("</script>")) {
            console.warn(`DataLoaderPlugin warn: </script> not found in module '${id}'`)
          } else {
            code = code.replace("</script>", `${scriptToAddToEnd}</script>`)
          }
  
          return code
        }
        
        return undefined
      }
    }
  }