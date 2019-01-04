import test from 'ava'
import weak from 'weak'
import sinon from 'sinon'
import { EventEmitter } from 'events'
import EventRegistry from './'

if (typeof global.gc !== 'function') {
  console.error('Tests must be run with the --expose-gc option')
  process.exit(1)
}

test('constructor does not throw', t => {
  t.notThrows(() => {
    new EventRegistry() /* eslint no-new: 0 */
  })
})

test('on() calls the listener for every event', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = sinon.spy()
  reg.on(emitter, 'foo', listener)
  emitter.emit('foo')
  emitter.emit('foo')
  emitter.emit('foo')
  t.is(listener.callCount, 3)
})

test('on() does not call the listener for other events', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = sinon.spy()
  reg.on(emitter, 'foo', listener)
  emitter.emit('bar')
  emitter.emit('baz')
  t.is(listener.callCount, 0)
})

test('on() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  const res = reg.on(emitter, 'foo', listener)
  t.is(res, reg)
})

test('addListener() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  const res = reg.addListener(emitter, 'foo', listener)
  t.is(res, reg)
})

test('once() calls the listener exactly once', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = sinon.spy()
  reg.once(emitter, 'foo', listener)
  emitter.emit('foo')
  emitter.emit('foo')
  emitter.emit('foo')
  t.is(listener.callCount, 1)
})

test('once() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  const res = reg.once(emitter, 'foo', listener)
  t.is(res, reg)
})

test('removeListener() removes the listener', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = sinon.spy()
  reg.on(emitter, 'foo', listener)
  reg.removeListener(emitter, 'foo', listener)
  emitter.emit('foo')
  t.is(listener.callCount, 0)
})

test('removeListener() does not complain about an unknown emitter', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  t.notThrows(() => {
    reg.removeListener(emitter, 'foo', listener)
  })
})

test('removeListener() does not complain about an unknown event', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  reg.on(emitter, 'foo', listener)
  t.notThrows(() => {
    reg.removeListener(emitter, 'bar', listener)
  })
})

test('removeListener() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  const res = reg.removeListener(emitter, 'foo', listener)
  t.is(res, reg)
})

test('removeAllListeners() removes all listeners for any event from the emitter', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener1 = sinon.spy()
  const listener2 = sinon.spy()
  const listener3 = sinon.spy()
  reg.on(emitter, 'foo', listener1)
  reg.on(emitter, 'foo', listener2)
  reg.on(emitter, 'bar', listener3)
  reg.removeAllListeners(emitter)
  emitter.emit('foo')
  emitter.emit('bar')
  t.is(listener1.callCount, 0)
  t.is(listener2.callCount, 0)
  t.is(listener3.callCount, 0)
})

test('removeAllListeners() removes all listeners for the event from the emitter', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener1 = sinon.spy()
  const listener2 = sinon.spy()
  const listener3 = sinon.spy()
  reg.on(emitter, 'foo', listener1)
  reg.on(emitter, 'foo', listener2)
  reg.on(emitter, 'bar', listener3)
  reg.removeAllListeners(emitter, 'bar')
  emitter.emit('foo')
  emitter.emit('bar')
  t.is(listener1.callCount, 1)
  t.is(listener2.callCount, 1)
  t.is(listener3.callCount, 0)
})

test('removeAllListeners() remembers finals when all listeners are removed', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const removedListener = sinon.spy()
  const calledListener = sinon.spy()
  reg.onceFin(emitter, 'end', removedListener)
  reg.removeAllListeners(emitter)
  reg.onceFin(emitter, 'end', calledListener)
  emitter.emit('end')
  t.is(removedListener.callCount, 0)
  t.is(calledListener.callCount, 1)
})

test('removeAllListeners() remembers finals when an event is supplied', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const doneListener = sinon.spy()
  const removedEndListener = sinon.spy()
  const calledEndListener = sinon.spy()
  reg.once(emitter, 'done', doneListener)
  reg.onceFin(emitter, 'end', removedEndListener)
  reg.removeAllListeners(emitter, 'end')
  reg.onceFin(emitter, 'end', calledEndListener)
  emitter.emit('done')
  emitter.emit('end')
  t.is(doneListener.callCount, 1)
  t.is(removedEndListener.callCount, 0)
  t.is(calledEndListener.callCount, 1)
})

test('fin() disposes other listeners after the final event', t => {
  const reg = new EventRegistry()
  const emitter1 = new EventEmitter()
  const emitter2 = new EventEmitter()
  let collected1 = false
  let collected2 = false
  ;(() => {
    const listener = () => {}
    weak(listener, () => { collected1 = true })
    reg.on(emitter1, 'progress', listener)
  })()
  ;(() => {
    const listener = () => {}
    weak(listener, () => { collected2 = true })
    reg.on(emitter2, 'data', listener)
  })()
  reg.fin(emitter1, 'end')
  global.gc()
  t.false(collected1)
  t.false(collected2)
  emitter1.emit('end')
  global.gc()
  t.true(collected1)
  t.true(collected2)
})

test('fin() ignores final events that are already registered', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  reg.fin(emitter, 'end')
  reg.fin(emitter, 'end')
  t.pass()
})

test('fin() distinguishes between events from different emitters', t => {
  const reg = new EventRegistry()
  const emitter1 = new EventEmitter()
  const emitter2 = new EventEmitter()
  let collected = false
  ;(() => {
    const listener = () => {}
    weak(listener, () => { collected = true })
    reg.on(emitter1, 'progress', listener)
  })()
  reg.fin(emitter1, 'end')
  global.gc()
  t.false(collected)
  emitter2.emit('end')
  global.gc()
  t.false(collected)
  emitter1.emit('end')
  global.gc()
  t.true(collected)
})

test('fin() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const res = reg.fin(emitter, 'foo')
  t.is(res, reg)
})

test('onceFin() disposes the listener after the final event', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  let collected = false
  ;(() => {
    const listener = () => {}
    weak(listener, () => { collected = true })
    reg.onceFin(emitter, 'end', listener)
  })()
  global.gc()
  t.false(collected)
  emitter.emit('end')
  global.gc()
  t.true(collected)
})

test('onceFin() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = () => {}
  const res = reg.onceFin(emitter, 'foo', listener)
  t.is(res, reg)
})

test('unfin() removes the listener for the final event', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  const listener = sinon.spy()
  reg.fin(emitter, 'done', listener)
  reg.unfin(emitter, 'done')
  emitter.emit('done')
  t.is(listener.callCount, 0)
})

test('unfin() does not complain about a non-final event', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  reg.unfin(emitter, 'foo')
  t.pass()
})

test('unfin() returns itself', t => {
  const reg = new EventRegistry()
  const emitter = new EventEmitter()
  reg.fin(emitter, 'foo')
  const res = reg.unfin(emitter, 'foo')
  t.is(res, reg)
})

test('clear() returns itself', t => {
  const reg = new EventRegistry()
  const res = reg.clear()
  t.is(res, reg)
})
