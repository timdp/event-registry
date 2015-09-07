'use strict'

import EmitterEventListenerSet from './lib/emitter-event-listener-set'
import EmitterEventSet from './lib/emitter-event-set'

export default class EventRegistry {
  constructor () {
    this._listeners = new EmitterEventListenerSet()
    this._finals = new EmitterEventSet()
  }

  on (emitter, event, listener) {
    emitter.on(event, listener)
    this._listeners.add(emitter, event, listener)
  }

  once (emitter, event, listener) {
    emitter.once(event, listener)
    this._listeners.add(emitter, event, listener)
  }

  removeListener (emitter, event, listener) {
    emitter.removeListener(event, listener)
    this._listeners.remove(emitter, event, listener)
  }

  fin (emitter, event) {
    if (this._finals.has(emitter, event)) {
      return
    }
    const listener = () => this._cleanUp()
    emitter.once(event, listener)
    this._finals.add(emitter, event)
  }

  onceFin (emitter, event, listener) {
    this.once(emitter, event, listener)
    this.fin(emitter, event)
  }

  _cleanUp () {
    this._listeners.cleanUp()
    this._finals.cleanUp()
  }
}
