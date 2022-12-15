declare type Patch = {
    updates: [string, any][];
};
declare function keyValueWatcher(snapper: () => Map<string, any>): {
    bus: Bus<Patch>;
    touch: () => void;
    watch: (interval?: number) => {
        cancel: () => void;
    };
};
declare type BusHandler<T> = (ev: T) => void;
declare class Bus<T> {
    handlers: BusHandler<T>[];
    subscribe(handler: BusHandler<T>): void;
    raise(ev: T): void;
}
declare function objToMap(obj: Record<string, any>): Map<string, any>;
declare function deepObjToMap(obj: Record<string, any>, map?: Map<string, any>, prefix?: string): Map<string, any>;
declare function test2(): void;
declare function ferry(): {
    obj: Record<string, any>;
    outgoingBus: Bus<Patch>;
    eat: (p: Patch) => void;
};
declare function deepSet(obj: any, path: string[] | string, value: any): void;
