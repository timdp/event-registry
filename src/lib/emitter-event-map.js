export default class EmitterEventMap {
  constructor () {
    this._contents = new Map()
  }

  getEmitters () {
    return this._contents.keys()
  }

  hasEmitter (emitter) {
    return this._contents.has(emitter)
  }

  getEmitterEvents (emitter) {
    return this._contents.get(emitter).keys()
  }

  hasEmitterEvent (emitter, event) {
    return (this.hasEmitter(emitter) && this._contents.get(emitter).has(event))
  }

  getEmitterEventValue (emitter, event) {
    return this.hasEmitterEvent(emitter, event)
      ? this._contents.get(emitter).get(event)
      : null
  }

  setEmitterEventValue (emitter, event, value) {
    if (!this.hasEmitter(emitter)) {
      this._contents.set(emitter, new Map())
    }
    const eventToValue = this._contents.get(emitter)
    eventToValue.set(event, value)
  }

  removeEmitterEventValue (emitter, event) {
    if (!this.hasEmitter(emitter)) {
      return
    }
    const eventToValue = this._contents.get(emitter)
    eventToValue.delete(event)
    if (eventToValue.size === 0) {
      eventToValue.delete(emitter)
    }
  }

  cleanUp () {
    for (let eventToValue of this._contents.values()) {
      eventToValue.clear()
    }
    this._contents.clear()
  }
}
