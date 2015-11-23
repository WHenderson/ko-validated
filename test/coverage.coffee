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
)
