export declare function isVisible(el: HTMLElement, partial?: boolean): boolean;
export declare function reveal(els: HTMLElement[], effect?: any, speed?: number, staggerChildren?: number, delay?: number): void;
export default reveal;
export declare const vueDirective: {
    inserted: (el: HTMLElement, { value, modifiers }: {
        value: any;
        modifiers: any;
    }) => void;
    mounted: (el: HTMLElement, { value, modifiers }: {
        value: any;
        modifiers: any;
    }) => void;
};
