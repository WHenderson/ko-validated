  getDependencies = do ->
    symState = do ->
      c = ko.computed(() -> return)
      if Object.getOwnPropertySymbols?
        for symbol in Object.getOwnPropertySymbols(c)
          if String(symbol) == 'Symbol(_state)'
            return symbol

      if {}.hasOwnProperty.call(c, '_state')
        return '_state'

      return

    depKey = do ->
      o = ko.observable()
      c = ko.computed({
        read: () -> o()
      })
      for own key, val of c[symState]
        if val? and typeof val == 'object'
          return key
      return

    return (target) ->
      if ko.isComputed(target)
        return target[symState][depKey]
      else
        return {}

  ko.extenders.fallibleRead = (target, options) ->
    if not ko.isComputed(target)
      return target

    target.extend({ fallible: true })

    if options == false
      target._disposeFallibleRead?()
      return

    findInner = (output, computed) ->
      for own key, dependency of getDependencies(computed)
        dependency = dependency._target
        if ko.extenders.fallible.isFallible(dependency)
          if output.indexOf(dependency.errors) == -1
            output.push(dependency.errors)

        if ko.isComputed(dependency)
          findInner(output, dependency)

      return output

    errors = () ->
      try
        #subscription = target.subscribe(() -> return)
        #target()
        return findInner([], target)
      finally
        #subscription.dispose()

    disposable = target.errors.add(errors)

    target._disposeFallibleRead = () ->
      if disposable?
        disposable.dispose()
        disposable = undefined
      return

    return target

