declare function _createVueHelper(e: any): {
    hook: (e: any) => void;
    comp: (e: any, t: any) => void;
    vm: any;
    Vue: any;
};
declare function VueHelper(): ReturnType<typeof _createVueHelper>;
declare function VueHelper(componentName: string, optsOrClass: any): ReturnType<typeof _createVueHelper>;
declare function prop<T>(def: T, moreOpts?: {
    type?: any;
}): {
    type?: any;
};
declare function propRequired<T>(moreOpts?: {
    type?: any;
}): T;
declare function vueClassPlus(e: any, t?: any): any;
