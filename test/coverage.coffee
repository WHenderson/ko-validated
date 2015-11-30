assert = require('chai').assert

suite('coverage', () ->
  ko = undefined
  setup(() ->
    applyKov = require('../dist/ko-validation.coffee')
    #applyKov = require('../index')
    ko = applyKov(require('knockout'))
  )

  suite('dummy', () ->
    test('dummy', () ->


    )
  )

  suite('extend', () ->
    test('interface', () ->
      ob = ko.observable().extend({
        fallible: true
      })

      assert.isFunction(ob.error)
      assert.isFunction(ob.errors)
      assert.isFunction(ob.errors.add)
      assert.isFunction(ob.errors.set)
      assert.isFunction(ob.errors.get)
      assert.isFunction(ob.errors.has)
      assert.isFunction(ob.errors.clear)
      assert.isFunction(ob.hasError)
      assert.isFunction(ob._disposeFallible)

      ob.extend({ fallible: false })

      assert.isUndefined(ob.error)
      assert.isUndefined(ob.errors)
      assert.isUndefined(ob.hasError)
      assert.isUndefined(ob._disposeFallible)
    )

    test('add errors', () ->
      ob = ko.observable().extend({
        fallible: true
      })

      assert.deepEqual(ob.errors(), [])
      assert.equal(ob.hasError(), false)
      assert.equal(ob.errors.has(), false)
      assert.deepEqual(ob.error(), undefined)

      a = ob.errors.add('a')
      b = ob.errors.add('b')
      c = ob.errors.add('c')

      assert.equal(a.isDisposed(), false)

      assert.deepEqual(ob.errors(), ['a', 'b', 'c'])
      assert.equal(ob.hasError(), true)
      assert.equal(ob.errors.has(), true)
      assert.deepEqual(ob.error(), 'a')

      a.dispose()

      assert.equal(a.isDisposed(), true)

      assert.deepEqual(ob.errors(), ['b', 'c'])
      assert.equal(ob.hasError(), true)
      assert.equal(ob.errors.has(), true)
      assert.deepEqual(ob.error(), 'b')

      b.dispose()
      c.dispose()

      assert.deepEqual(ob.errors(), [])
      assert.equal(ob.hasError(), false)
      assert.equal(ob.errors.has(), false)
      assert.deepEqual(ob.error(), undefined)

      ob.errors.set('d')

      assert.deepEqual(ob.errors(), ['d'])
      assert.equal(ob.hasError(), true)
      assert.equal(ob.errors.has(), true)
      assert.deepEqual(ob.error(), 'd')

      setNone = ob.errors.set()

      assert.equal(setNone.isDisposed(), true)
      setNone.dispose()

      assert.deepEqual(ob.errors(), [])
      assert.equal(ob.hasError(), false)
      assert.equal(ob.errors.has(), false)
      assert.deepEqual(ob.error(), undefined)

      e = ob.errors.add('e')

      assert.deepEqual(ob.errors(), ['e'])
      assert.equal(ob.hasError(), true)
      assert.equal(ob.errors.has(), true)
      assert.deepEqual(ob.error(), 'e')

      ob.errors.clear()

      assert.equal(e.isDisposed(), true)

      assert.deepEqual(ob.errors(), [])
      assert.equal(ob.hasError(), false)
      assert.equal(ob.errors.has(), false)
      assert.deepEqual(ob.error(), undefined)

      addNone = ob.errors.add()

      assert.equal(addNone.isDisposed(), true)
      assert.deepEqual(ob.errors(), [])
      assert.equal(ob.hasError(), false)
      assert.equal(ob.errors.has(), false)
      assert.deepEqual(ob.error(), undefined)

    )

    test('reconstruct', () ->
      ob = ko.observable().extend({
        fallible: true
      })

      props = {}
      for own key, val of ob
        props[key] = val

      ob = ob.extend({
        fallible: true
      })

      assert.deepEqual(Object.keys(props), Object.keys(ob))
      for own key, val of ob
        assert.equal(val, props[key])
    )
  )
)
