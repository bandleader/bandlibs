import type * as Vite from 'vite'
import { renderToString } from 'vue/server-renderer'
export * from './middleware'

export async function indexHtml(vite: Vite.ViteDevServer, url: string, indexHtmlText: string, pathToEntryServer: string) {
    // TODO: put in error handling logic from https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
    
    let out = await vite.transformIndexHtml(url, indexHtmlText)

    const appModule = await vite.ssrLoadModule(pathToEntryServer)
    const appObject = appModule.createApp()
  
    const renderResult = await renderVueAppOnServer(appObject as any, url)
    out = out.replace(`<!--ssr-outlet-->`, renderResult.html)
    out = out.replace(`</head>`, renderResult.headEndContent + '</head>')
    out = out.replace(`</body>`, renderResult.bodyEndContent + '</body>')
  
    return out
}

async function renderVueAppOnServer(appObj: {app: any, router?: any}, url: string) {
    if (appObj.router) {
        appObj.router.push(url)
        await appObj.router.isReady()
    }
    
    const ssrContext = { headEndContent: [] as Promise<string>[], bodyEndContent: [] as Promise<string>[] }
    const html = await renderToString(appObj.app, ssrContext)

    return { html, headEndContent: await collectSlot(ssrContext.headEndContent), bodyEndContent: await collectSlot(ssrContext.bodyEndContent) }
}

async function collectSlot(slot: Promise<string>[]|void) {
    if (!slot || !slot.length) return ""
    const all = await Promise.all(slot)
    return all.join("\n")
}