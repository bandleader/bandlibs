import * as Express from 'express'
import * as Vite from 'vite'
import * as fs from 'fs'
import * as path from 'path'
import * as TVS from '.'

export async function devMiddleware(opts: {pathToIndexHtml: string, pathToMainJsEntrypoint: string}) {
  const app = Express()
  const viteServer = await Vite.createServer({
    server: { middlewareMode: "ssr" },
  })
  app.use(viteServer.middlewares)
  app.use(async (req, res, next) => 
    looksLikeHtmlRequest(req)
        ? res.send(await TVS.indexHtml(viteServer, req.originalUrl, fs.readFileSync(opts.pathToIndexHtml, { encoding: "utf8" }), opts.pathToMainJsEntrypoint)
        : next()
    ))
  return app
}

function looksLikeHtmlRequest(req: Express.Request) {
    return req.method === "GET" && !(/\.[A-Za-z]+$/.test(req.originalUrl))
}

