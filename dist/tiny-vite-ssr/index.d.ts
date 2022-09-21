import type * as Vite from 'vite';
export * from './middleware';
export declare function indexHtml(vite: Vite.ViteDevServer, url: string, indexHtmlText: string, pathToEntryServer: string): Promise<string>;
