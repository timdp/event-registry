'use strict'

import EmitterEventMap from './emitter-event-map'

export default class EmitterEventListenerSet {
  constructor () {
    this._map = new EmitterEventMap()
  }

  getEmitterEvents (emitter) {
    return this._map.getEmitterEvents(emitter)
  }

  addEmitterEventListener (emitter, event, listener) {
    if (!this._map.hasEmitterEvent(emitter, event)) {
      this._map.setEmitterEventValue(emitter, event, new Set())
    }
    const listeners = this._map.getEmitterEventValue(emitter, event)
    listeners.add(listener)
  }

  removeEmitterEventListener (emitter, event, listener) {
    if (!this._map.hasEmitterEvent(emitter, event)) {
      return
    }
    const listeners = this._map.getEmitterEventValue(emitter, event)
    listeners.delete(listener)
    if (listeners.size === 0) {
      this._map.removeEmitterEventValue(emitter, event)
    }
  }

  cleanUp () {
    for (let emitter of this._map.getEmitters()) {
      for (let event of this._map.getEmitterEvents(emitter)) {
        const listeners = this._map.getEmitterEventValue(emitter, event)
        for (let listener of listeners) {
          emitter.removeListener(event, listener)
        }
        listeners.clear()
        this._map.removeEmitterEventValue(emitter, event)
      }
    }
    this._map.cleanUp()
  }
}
