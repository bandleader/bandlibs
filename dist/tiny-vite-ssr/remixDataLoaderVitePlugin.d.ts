export default function remixDataLoaderVitePlugin(): {
    name: string;
    enforce: "pre";
    transform(code: string, id: string, options?: {
        ssr: boolean;
    }): Promise<string>;
};
