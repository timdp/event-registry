'use strict'

export default class EmitterEventSet {
  constructor () {
    this._contents = new Map()
  }

  has (emitter, event) {
    return (this._contents.has(emitter) &&
      this._contents.get(emitter).has(event))
  }

  add (emitter, event) {
    if (!this._contents.has(emitter)) {
      this._contents.set(emitter, new Set())
    }
    const emitterSet = this._contents.get(emitter)
    emitterSet.add(event)
  }

  remove (emitter, event) {
    if (!this._contents.has(emitter)) {
      return
    }
    const emitterSet = this._contents.get(emitter)
    emitterSet.delete(event)
    if (emitterSet.size === 0) {
      emitterSet.delete(emitter)
    }
  }

  cleanUp () {
    for (let emitterSet of this._contents.values()) {
      emitterSet.clear()
    }
    this._contents.clear()
  }
}
