export function middleware(callback: (context: {req: any}) => any) {
    return async (req: any, resp: any) => {
        const param = (key: string) => req.query?.[key] || req.body?.[key]
        const method: string = param('method')
        try {
            const context = { req }
            const backend = callback(context)
            if (typeof backend[method] !== 'function') {
                // throw `Method '${method}' does not exist. Methods are: ${Object.keys(backend)}`
                throw `Method '${method}' does not exist`
            } else {
                const args = JSON.parse(param('args'))
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
type UnpackedPromise<T> = T extends Promise<infer U> ? U : T
type GenericFunction<TS extends any[], R> = (...args: TS) => R
type PromisifyFunc<T> = {
    [K in keyof T]: T[K] extends GenericFunction<infer TS, infer R>
        ? (...args: TS) => Promise<UnpackedPromise<R>>
        : never
}
export function client<T extends Record<string, AnyFunc>>(endpoint = "/api") {
    const single = function<TMethod extends keyof T & string>(method: TMethod, ...args: Parameters<T[TMethod]>) {
        const questionOrAmp = endpoint.includes('?') ? '&' : '?'
        const result = fetch(endpoint + questionOrAmp, { method: "POST", body: new URLSearchParams({ method, args: JSON.stringify(args)}) })
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
    }) as { [Prop in keyof T]: T[Prop] extends (...args: infer TArgs) => infer TReturn ? (...args: TArgs) => Promisify<TReturn> : never }
    return { single, proxy }
}

// const exampleBackend = {
//     foo: async (b: string) => 12,
//     bar: (a: number, b: string) => "hey",
// }
// const cl = client<typeof exampleBackend>()
// const test1 = cl.single("foo", 'str')
// const test2 = cl.single("bar", 1, '1')
// const test3 = cl.proxy().bar(2, '3') // For some reason it doesn't ALWAYS check the types of the second argument...
