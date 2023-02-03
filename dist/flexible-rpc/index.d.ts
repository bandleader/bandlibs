export declare function middleware(callback: (context: {
    req: any;
}) => any): (req: any, resp: any) => Promise<void>;
declare type AnyFunc = (...args: any) => any;
declare type Promisify<T> = T extends Promise<any> ? T : Promise<T>;
export declare function client<T extends Record<string, AnyFunc>>(endpoint?: string): {
    single: <TMethod extends keyof T & string>(method: TMethod, ...args: Parameters<T[TMethod]>) => Promisify<ReturnType<T[TMethod]>>;
    proxy: () => {};
};
export {};
