declare type Patch = {
    updates: [string, any][];
};
declare type BusHandler<T> = (ev: T) => void;
declare class Bus<T> {
    handlers: BusHandler<T>[];
    subscribe(handler: BusHandler<T>): void;
    raise(ev: T): void;
}
