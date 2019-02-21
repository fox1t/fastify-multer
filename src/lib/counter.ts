import { EventEmitter } from 'events'

class Counter extends EventEmitter {
  value: number

  constructor() {
    super()
    this.value = 0
  }

  increment() {
    this.value++
  }

  decrement() {
    if (--this.value === 0) {
      this.emit('zero')
    }
  }

  isZero() {
    return this.value === 0
  }

  onceZero(fn: (...args: any[]) => void) {
    if (this.isZero()) {
      return fn()
    }

    this.once('zero', fn)
  }
}

export default Counter
