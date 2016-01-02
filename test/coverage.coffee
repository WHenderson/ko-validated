assert = require('chai').assert

suite('coverage', () ->
  ko = undefined
  setup(() ->
    #applyKov = require('../dist/ko-validated.coffee')
    applyKov = require('../index')
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

  if false
    suite('ko.pureErrors', () ->
      test('standard', () ->
        vm = {
          a: ko.observable(1).extend({ fallible: true })
          b: ko.observable(2).extend({ fallible: true })
          c: ko.observable(3).extend({ fallible: true })
        }

        vm.errors = ko.pureErrors(
          (addError) ->
            if not vm.a()?
              addError(vm.a, "a must have a value")

            if not vm.b()?
              addError(vm.b, "a must have a value")

            if not vm.c()?
              addError(vm.c, "a must have a value")

            if vm.a() % 2 != 1
              addError(vm.a, "a must be odd")

            if vm.b() == vm.c()
              addError(vm.c, "b and c must not be equal")

            return
        )

        # convert comprehensive error information into a simplified list for testing
        vm.simpleErrors = ko.computed(() ->
          for error in vm.errors()
            error.message
        )

        assert.deepEqual(vm.simpleErrors(), [])

        vm.a(null)

        assert.deepEqual(vm.simpleErrors(), [
          'a must have a value'
          'a must be odd'
        ])

        assert.equal(vm.a.error(), 'a must have a value')

        vm.c(vm.b())

        assert.deepEqual(vm.simpleErrors(), [
          'a must have a value'
          'a must be odd'
          'b and c must not be equal'
        ])

        assert.equal(vm.a.error(), 'a must have a value')
        assert.equal(vm.b.error(), undefined)
        assert.equal(vm.c.error(), 'b and c must not be equal')
      )
    )

  suite('fallibleRead', () ->
    test('functionality', () ->
      vm = {
        a: ko.observable('a').extend({fallible: true})
        b: ko.observable('b').extend({fallible: true})
      }
      vm.c = ko.computed(() -> vm.a() + vm.b() + 'c').extend({ fallible: true })
      vm.pc = ko.pureComputed(() -> vm.a() + vm.b() + 'pc').extend({ fallible: true })
      vm.results = ko.computed({
        read: () ->
          return {
            #a: vm.a()
            #b: vm.b()
            c: vm.c()
            pc: vm.pc()
          }
        deferEvaluation: true
      }).extend({ fallibleRead: true })

      vm.a.error('error A')
      vm.b.error('error B')
      vm.c.error('error C')
      vm.pc.error('error PC')

      console.log(vm.results.errors())
    )
  )
)

