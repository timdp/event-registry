import EventRegistry from '../../src'
import weak from 'weak'
import {EventEmitter} from 'events'

if (typeof global.gc !== 'function') {
  console.error('Tests must be run with the --expose-gc option')
  process.exit(1)
}

describe('EventRegistry', () => {
  describe('#new()', () => {
    it('does not throw', () => {
      expect(() => {
        new EventRegistry() /* eslint no-new: 0 */
      }).to.not.throw(Error)
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

    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      const res = reg.on(emitter, 'foo', listener)
      expect(res).to.equal(reg)
    })
  })

  describe('#addListener()', () => {
    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      const res = reg.addListener(emitter, 'foo', listener)
      expect(res).to.equal(reg)
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

    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      const res = reg.once(emitter, 'foo', listener)
      expect(res).to.equal(reg)
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

    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      const res = reg.removeListener(emitter, 'foo', listener)
      expect(res).to.equal(reg)
    })
  })

  describe('#removeAllListeners()', () => {
    it('removes all listeners for any event from the emitter', () => {
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
      expect(listener1.callCount).to.equal(0)
      expect(listener2.callCount).to.equal(0)
      expect(listener3.callCount).to.equal(0)
    })

    it('removes all listeners for the event from the emitter', () => {
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
      expect(listener1.callCount).to.equal(1)
      expect(listener2.callCount).to.equal(1)
      expect(listener3.callCount).to.equal(0)
    })

    it('remembers finals when all listeners are removed', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const removedListener = sinon.spy()
      const calledListener = sinon.spy()
      reg.onceFin(emitter, 'end', removedListener)
      reg.removeAllListeners(emitter)
      reg.onceFin(emitter, 'end', calledListener)
      emitter.emit('end')
      expect(removedListener.callCount).to.equal(0)
      expect(calledListener.callCount).to.equal(1)
    })

    it('remembers finals when an event is supplied', () => {
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
      expect(doneListener.callCount).to.equal(1)
      expect(removedEndListener.callCount).to.equal(0)
      expect(calledEndListener.callCount).to.equal(1)
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
        weak(listener, () => { collected = true })
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

    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const res = reg.fin(emitter, 'foo')
      expect(res).to.equal(reg)
    })
  })

  describe('#onceFin()', () => {
    it('disposes the listener after the final event', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      let collected = false
      ;(() => {
        const listener = () => {}
        weak(listener, () => { collected = true })
        reg.onceFin(emitter, 'end', listener)
      })()
      global.gc()
      expect(collected).to.be.false
      emitter.emit('end')
      global.gc()
      expect(collected).to.be.true
    })

    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      const listener = () => {}
      const res = reg.onceFin(emitter, 'foo', listener)
      expect(res).to.equal(reg)
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

    it('returns itself', () => {
      const reg = new EventRegistry()
      const emitter = new EventEmitter()
      reg.fin(emitter, 'foo')
      const res = reg.unfin(emitter, 'foo')
      expect(res).to.equal(reg)
    })
  })

  describe('#clear()', () => {
    it('returns itself', () => {
      const reg = new EventRegistry()
      const res = reg.clear()
      expect(res).to.equal(reg)
    })
  })
})
