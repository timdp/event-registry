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
      this._map.setEmitterEventValue(emitter, event, [])
    }
    const listeners = this._map.getEmitterEventValue(emitter, event)
    listeners.push(listener)
  }

  removeEmitterEventListener (emitter, event, listener) {
    if (!this._map.hasEmitterEvent(emitter, event)) {
      return
    }
    const listeners = this._map.getEmitterEventValue(emitter, event)
    const idx = listeners.indexOf(listener)
    if (idx < 0) {
      return
    }
    listeners.splice(idx, 1)
    if (listeners.length === 0) {
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
        listeners.length = 0
        this._map.removeEmitterEventValue(emitter, event)
      }
    }
    this._map.cleanUp()
  }
}
