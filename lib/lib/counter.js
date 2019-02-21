"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class Counter extends events_1.EventEmitter {
    constructor() {
        super();
        this.value = 0;
    }
    increment() {
        this.value++;
    }
    decrement() {
        if (--this.value === 0) {
            this.emit('zero');
        }
    }
    isZero() {
        return this.value === 0;
    }
    onceZero(fn) {
        if (this.isZero()) {
            return fn();
        }
        this.once('zero', fn);
    }
}
exports.default = Counter;
//# sourceMappingURL=counter.js.map