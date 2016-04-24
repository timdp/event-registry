'use strict'

import EmitterEventListenerSet from './lib/emitter-event-listener-set'
import EmitterEventMap from './lib/emitter-event-map'

export default class EventRegistry {
  constructor () {
    this._listeners = new EmitterEventListenerSet()
    this._finals = new EmitterEventMap()
    this._finalListener = () => this.clear()
  }

  addListener (emitter, event, listener) {
    emitter.on(event, listener)
    this._listeners.addEmitterEventListener(emitter, event, listener)
    return this
  }

  on (emitter, event, listener) {
    return this.addListener(emitter, event, listener)
  }

  once (emitter, event, listener) {
    emitter.once(event, listener)
    this._listeners.addEmitterEventListener(emitter, event, listener)
    return this
  }

  removeListener (emitter, event, listener) {
    emitter.removeListener(event, listener)
    this._listeners.removeEmitterEventListener(emitter, event, listener)
    return this
  }

  removeAllListeners (emitter, event = null) {
    const events = (event != null) ? [event]
      : this._listeners.getEmitterEvents(emitter)
    const isNotFinal = (listener) => (listener !== this._finalListener)
    for (let event of events) {
      const listeners = emitter.listeners(event).filter(isNotFinal)
      for (let listener of listeners) {
        this.removeListener(emitter, event, listener)
      }
    }
    return this
  }

  fin (emitter, event) {
    if (!this._finals.hasEmitterEvent(emitter, event)) {
      this._finals.setEmitterEventValue(emitter, event, this._finalListener)
      this.once(emitter, event, this._finalListener)
    }
    return this
  }

  onceFin (emitter, event, listener) {
    this.once(emitter, event, listener)
    this.fin(emitter, event)
    return this
  }

  unfin (emitter, event) {
    if (this._finals.hasEmitterEvent(emitter, event)) {
      const listener = this._finals.getEmitterEventValue(emitter, event)
      this.removeListener(emitter, event, listener)
      this._finals.removeEmitterEventValue(emitter, event)
    }
    return this
  }

  clear () {
    this._listeners.cleanUp()
    this._finals.cleanUp()
    return this
  }
}
