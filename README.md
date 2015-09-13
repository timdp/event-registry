# event-registry

[![npm](https://img.shields.io/npm/v/event-registry.svg)](https://www.npmjs.com/package/event-registry) [![Dependencies](https://img.shields.io/david/timdp/event-registry.svg)](https://david-dm.org/timdp/event-registry) [![Build Status](https://img.shields.io/travis/timdp/event-registry.svg)](https://travis-ci.org/timdp/event-registry) [![Coverage Status](https://img.shields.io/coveralls/timdp/event-registry.svg)](https://coveralls.io/r/timdp/event-registry) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

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

// Undo fin. Don't remove any listeners when 'end' is emitted.
eventRegistry.unfin(emitter, 'end')

// Shorthand for once + fin.
eventRegistry.onceFin(otherEmitter, 'done', someDoneListener)
```

## Author

[Tim De Pauw](https://github.com/timdp)

## License

MIT
