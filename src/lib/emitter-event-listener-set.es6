'use strict'

export default class EmitterEventListenerSet {
  constructor () {
    this._contents = new Map()
  }

  has (emitter, event, listener) {
    return (this._contents.has(emitter) &&
      this._contents.get(emitter).has(event) &&
      this._contents.get(emitter).get(event).has(listener))
  }

  add (emitter, event, listener) {
    if (!this._contents.has(emitter)) {
      this._contents.set(emitter, new Map())
    }
    const emitterMap = this._contents.get(emitter)
    if (!emitterMap.has(event)) {
      emitterMap.set(event, new Set())
    }
    emitterMap.get(event).add(listener)
  }

  remove (emitter, event, listener) {
    if (!this._contents.has(emitter)) {
      return
    }
    const emitterMap = this._contents.get(emitter)
    if (!emitterMap.has(event)) {
      return
    }
    const listeners = emitterMap.get(event)
    listeners.delete(listener)
    if (listeners.size === 0) {
      emitterMap.delete(event)
      if (emitterMap.size === 0) {
        this._contents.delete(emitter)
      }
    }
  }

  cleanUp () {
    for (let [emitter, emitterMap] of this._contents.entries()) {
      for (let [event, listeners] of emitterMap.entries()) {
        for (let listener of listeners) {
          emitter.removeListener(event, listener)
        }
        listeners.clear()
      }
      emitterMap.clear()
    }
    this._contents.clear()
  }
}
