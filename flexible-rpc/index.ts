export function middleware(callback: (context: {req: any}) => any) {
    return async (req: any, resp: any, next: Function) => {
        const method: string = req.query.method
        if (!method) return next()
        try {
            const context = { req }
            const backend = callback(context)
            if (typeof backend[method] !== 'function') {
                // throw `Method '${method}' does not exist. Methods are: ${Object.keys(backend)}`
                throw `Method '${method}' does not exist`
            } else {
                const args = JSON.parse(req.query.args)
                const result = await backend[method].apply(context, args)
                resp.json({result})
            }
        } catch (err) {
          console.error(`Error in RPC action '${method}':`, err)
          resp.json({err})
        }
    }
}

type AnyFunc = (...args: any) => any
type Promisify<T> = T extends Promise<any> ? T : Promise<T>
export function client<T extends Record<string, AnyFunc>>(endpoint = "/api") {
    const single = function<TMethod extends keyof T>(method: TMethod, ...args: Parameters<T[TMethod]>) {
        const questionOrAmp = endpoint.includes('?') ? '&' : '?'
        const result = fetch(endpoint + questionOrAmp + "method=" + method + "&args=" + encodeURIComponent(JSON.stringify(args)), { method: "POST" })
        const jsonResult = result.then(x => x.json())
        return jsonResult.then(json => {
            if (json.err) {
                console.error("RPC: Server returned error:", json.err)
                throw "Server returned error: " + JSON.stringify(json.err)    
            }
            return json.result
        }) as Promisify<ReturnType<T[typeof method]>>
    }
    const proxy = () => new Proxy({}, {
        get(targ, prop) {
            return (...args: any[]) => single(prop as string, ...args as any)
        }
    })
    return { single, proxy }
}

// const exampleBackend = {
//     foo: async (b: string) => 12
// }
// const test = client<typeof exampleBackend>().single("foo",'1')
