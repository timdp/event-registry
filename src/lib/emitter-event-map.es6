'use strict'

export default class EmitterEventMap {
  constructor () {
    this._contents = new Map()
  }

  has (emitter, event) {
    return (this._contents.has(emitter) &&
      this._contents.get(emitter).has(event))
  }

  get (emitter, event) {
    return this._contents.has(emitter) ? this._contents.get(emitter).get(event)
      : null
  }

  add (emitter, event, value) {
    if (!this._contents.has(emitter)) {
      this._contents.set(emitter, new Map())
    }
    const emitterMap = this._contents.get(emitter)
    emitterMap.set(event, value)
  }

  remove (emitter, event) {
    if (!this._contents.has(emitter)) {
      return
    }
    const emitterMap = this._contents.get(emitter)
    emitterMap.delete(event)
    if (emitterMap.size === 0) {
      emitterMap.delete(emitter)
    }
  }

  cleanUp () {
    for (let emitterMap of this._contents.values()) {
      emitterMap.clear()
    }
    this._contents.clear()
  }
}
