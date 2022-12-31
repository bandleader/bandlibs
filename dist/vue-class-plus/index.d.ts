export declare function prop<T>(def: T, moreOpts?: {
    type?: any;
}): T;
export declare function propRequired<T>(moreOpts?: {
    type?: any;
}): T;
export declare function computed<T>(getter: () => T): () => T;
export default classComponent;
export declare function classComponent(cl: any, opts?: Record<string, any>): any;
