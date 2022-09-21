export declare function addEl<T extends HTMLElement = HTMLElement>(where: string | Element, tagName: string, attrs?: Partial<T> | any): T & {
    loadPromise: () => Promise<void>;
};
export declare function waitForLoad(el: HTMLElement): Promise<void>;
export declare function partition<T>(arr: T[], fn: (i: T) => boolean | number, minGroups?: number): T[][];
