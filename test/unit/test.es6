/* global describe, it, expect */

'use strict'

import EventRegistry from '../../src'
import sinon from 'sinon'
import weak from 'weak'
import {EventEmitter} from 'events'

describe('EventRegistry', () => {
  describe('#new()', () => {
    it('does not throw', () => {
      const reg = new EventRegistry()
      expect(reg).to.be.ok
    })
  })

  describe('#on()', () => {
    it('calls the listener for every event', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = sinon.spy()
      reg.on(emitter, 'foo', listener)
      emitter.emit('foo')
      emitter.emit('foo')
      emitter.emit('foo')
      expect(listener.callCount).to.equal(3)
    })

    it('does not call the listener for other events', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = sinon.spy()
      reg.on(emitter, 'foo', listener)
      emitter.emit('bar')
      emitter.emit('baz')
      expect(listener.callCount).to.equal(0)
    })
  })

  describe('#once()', () => {
    it('calls the listener exactly once', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = sinon.spy()
      reg.once(emitter, 'foo', listener)
      emitter.emit('foo')
      emitter.emit('foo')
      emitter.emit('foo')
      expect(listener.callCount).to.equal(1)
    })
  })

  describe('#removeListener()', () => {
    it('removes the listener', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = sinon.spy()
      reg.on(emitter, 'foo', listener)
      reg.removeListener(emitter, 'foo', listener)
      emitter.emit('foo')
      expect(listener.callCount).to.equal(0)
    })

    it('does not complain about an unknown emitter', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      reg.removeListener(emitter, 'foo', listener)
      expect(reg).to.be.ok
    })

    it('does not complain about an unknown event', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      reg.on(emitter, 'foo', listener)
      reg.removeListener(emitter, 'bar', listener)
      expect(reg).to.be.ok
    })
  })

  describe('#fin()', () => {
    it('disposes other listeners after the final event', () => {
      const reg = new EventRegistry()
      const emitter1 = new EventEmitter()
      const emitter2 = new EventEmitter()
      let collected1 = false
      let collected2 = false
      ;(() => {
        const listener = () => {}
        weak(listener, () => collected1 = true)
        reg.on(emitter1, 'progress', listener)
      })()
      ;(() => {
        const listener = () => {}
        weak(listener, () => collected2 = true)
        reg.on(emitter2, 'data', listener)
      })()
      reg.fin(emitter1, 'end')
      global.gc()
      expect(collected1).to.be.false
      expect(collected2).to.be.false
      emitter1.emit('end')
      global.gc()
      expect(collected1).to.be.true
      expect(collected2).to.be.true
    })

    it('ignores final events that are already registered', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      reg.fin(emitter, 'end')
      reg.fin(emitter, 'end')
      expect(reg).to.be.ok
    })

    it('distinguishes between events from different emitters', () => {
      const reg = new EventRegistry()
      const emitter1 = new EventEmitter()
      const emitter2 = new EventEmitter()
      let collected = false
      ;(() => {
        const listener = () => {}
        weak(listener, () => collected = true)
        reg.on(emitter1, 'progress', listener)
      })()
      reg.fin(emitter1, 'end')
      global.gc()
      expect(collected).to.be.false
      emitter2.emit('end')
      global.gc()
      expect(collected).to.be.false
      emitter1.emit('end')
      global.gc()
      expect(collected).to.be.true
    })
  })

  describe('#onceFin()', () => {
    it('disposes the listener after the final event', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      let collected = false
      ;(() => {
        const listener = () => {}
        weak(listener, () => collected = true)
        reg.onceFin(emitter, 'end', listener)
      })()
      global.gc()
      expect(collected).to.be.false
      emitter.emit('end')
      global.gc()
      expect(collected).to.be.true
    })
  })

  describe('#unfin()', () => {
    it('removes the listener for the final event', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = sinon.spy()
      reg.fin(emitter, 'done', listener)
      reg.unfin(emitter, 'done')
      emitter.emit('done')
      expect(listener.callCount).to.equal(0)
    })

    it('does not complain about a non-final event', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      reg.unfin(emitter, 'foo')
      expect(reg).to.be.ok
    })
  })
})
