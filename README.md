# event-registry

[![npm](https://img.shields.io/npm/v/event-registry.svg)](https://www.npmjs.com/package/event-registry) [![Dependencies](https://img.shields.io/david/timdp/event-registry.svg)](https://david-dm.org/timdp/event-registry) [![Build Status](https://img.shields.io/travis/timdp/event-registry/master.svg)](https://travis-ci.org/timdp/event-registry) [![Coverage Status](https://img.shields.io/coveralls/timdp/event-registry/master.svg)](https://coveralls.io/r/timdp/event-registry) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

Keeps track of EventEmitter listeners and automatically removes them upon
selected events. Useful when you want to avoid EventEmitter memory leaks caused
by listeners not being removed.

## Usage

```javascript
import EventRegistry from 'event-registry'

const eventRegistry = new EventRegistry()
const emitter = getSomeEventEmitter()
const otherEmitter = getSomeOtherEventEmitter()

// Attach a listener using EventEmitter.prototype.on and remember it.
eventRegistry.on(emitter, 'data', someDataListener)

// Attach a one-off listener using EventEmitter.prototype.on and remember it.
eventRegistry.once(emitter, 'end', someEndListener)

// A single registry can track any number of event emitters.
eventRegistry.on(otherEmitter, 'progress', someProgressListener)

// When the 'end' event is emitted, remove all remembered listeners.
// Note that this will also remove the progress listener from otherEmitter.
eventRegistry.fin(emitter, 'end')
```

## API

### EventEmitter Proxies

An `EventRegistry` proxies the following functions to the `emitter`:

- `addListener(emitter, event, listener)` AKA `on(emitter, event, listener)`
- `once(emitter, event, listener)`
- `removeListener(emitter, event, listener)`
- `removeAllListeners(emitter, [event])`

Additionally, it keeps track of every `listener` passed. When a **final event**
occurs (see below), it will **remove** all of these listeners.

### Final Events

#### `fin(emitter, event)`

Marks the given `event` on the `emitter` as final. When that event occurs, all
listeners will be removed.

#### `unfin(emitter, event)`

Undoes a call to `fin`. Marks the `event` on the `emitter` as non-final.

#### `onceFin(emitter, event, listener)`

Shorthand for `once(emitter, event, listener)` followed by `fin(emitter, event)`.
Saves you a statement in this common scenario.

#### `clear()`

Removes all attached listeners and marks all final events as non-final.
Basically what happens when a final event is emitted.

## Author

[Tim De Pauw](https://github.com/timdp)

## License

MIT
