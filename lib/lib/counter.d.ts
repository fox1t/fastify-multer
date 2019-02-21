/// <reference types="node" />
import { EventEmitter } from 'events';
declare class Counter extends EventEmitter {
    value: number;
    constructor();
    increment(): void;
    decrement(): void;
    isZero(): boolean;
    onceZero(fn: (...args: any[]) => void): void;
}
export default Counter;
