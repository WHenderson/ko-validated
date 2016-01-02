ko = require('knockout')

applyKov = (ko) ->
  ko.validated = {}


  class Disposable
    constructor: (@name, @message, @target, dispose, isDisposed) ->
      if dispose?
        @dispose = dispose
      if isDisposed?
        @isDisposed = isDisposed

    dispose: () ->
      return

    isDisposed: () ->
      return true

  _idCounter = 0
  getUniqueId = () ->
    ++_idCounter

  ko.extenders.fallible = (target, options) ->
    # Dispose?
    if options == false
      target._disposeFallible?()
      return target

    # Already constructed
    if ko.extenders.fallible.isFallible(target)
      return target

    # contains the errors for target
    _errors = ko.observable({})
    _named = {}

    # helper for calling hasOwnProperty
    _hasOwnProp = ({}).hasOwnProperty

    # Removes the specified error, if it exists
    _removeError = (id, trigger) ->
      if typeof id == 'string'
        if {}.hasOwnProperty(_named, id)
          name = id
          id = _named[id]
          delete _named[name]
        else
          id = undefined

      if id?
        errors = _errors()

        if _hasOwnProp.call(errors, id)
          delete errors[id]

          if trigger != false
            _errors.valueHasMutated()

      return

    # Returns true iff the specified error exists
    _errorExists = (id) ->
      _hasOwnProp.call(_errors(), id)

    _registerError = (errors, message, name, trigger) ->
      if message?
        id = getUniqueId()

        disposable = new Disposable(
          name,
          message
          target
          () -> _removeError(name ? id)
          () -> not _errorExists(id)
        )

        if typeof name == 'string'
          if {}.hasOwnProperty.call(_named, name)
            _removeError(_named[name], false)

          _named[name] = id

        errors[id] = message

        if trigger != false
          _errors.valueHasMutated()
      else
        disposable = new Disposable(
          name,
          message,
          target
        )

        _removeError(name, trigger)

      return disposable

    # A list of all errors
    target.errors = ko.pureComputed({
      read: () ->
        messages = []

        collectMessages = (message) ->
          if not message?
            return
          else if typeof message == 'function'
            message = message()
            collectMessages(message)
          else if Array.isArray(message)
            for subMessage in message
              collectMessages(subMessage)
          else if typeof message == 'string' or typeof message == 'object'
            messages.push(message)
          else
            console?.assert?(false, 'invalid error message')

          return

        for own id, message of _errors()
          collectMessages(message)

        return messages

      write: (messages) ->
        target.errors.set(messages)
        return
    })

    # Add an individual error
    target.errors.add = (name, message) ->
      if arguments.length == 1
        message = name
        name = undefined

      return _registerError(_errors(), message, name, true)

    # Set a single error, clearing other errors
    target.errors.set = (name, message) ->
      if arguments.length == 1
        message = name
        name = undefined

      errors = {}
      _named = {}
      disposable = _registerError(errors, message, name, false)
      _errors(errors)
      return disposable

    # Get the first error
    target.errors.get = (name) ->
      firstMessage = undefined

      findMessage = (message) ->
        if not message?
          return false
        else if typeof message == 'function'
          message = message()
          if findMessage(message)
            return true
        else if Array.isArray(message)
          for subMessage in message
            if findMessage(subMessage)
              return true
        else if typeof message == 'string' or typeof message == 'object'
          firstMessage = message
          return true
        else
          console?.assert?(false, 'invalid error message')

        return false

      if typeof name == 'string'
        if {}.hasOwnProperty.call(_named, name)
          if findMessage(_errors()[_named[name]])
            return firstMessage
      else
        for own id, message of _errors()
          if findMessage(message)
            return firstMessage

      return undefined

    target.errors.has = (name) ->
      return target.errors.get(name)?

    target.errors.remove = (name) ->
      if typeof name == 'string'
        _removeError(name)

      return

    # Clear all the current errors
    target.errors.clear = () ->
      _named = {}
      _errors({})
      return

    # Get the first error, or Set a single error whilst clearing other errors
    target.error = ko.pureComputed({
      read: target.errors.get
      write: target.errors.set
    })

    # Return true iff there are any errors
    target.hasError = ko.pureComputed({
      read: target.errors.has
    })

    # Remove fallible data from the target object
    target._disposeFallible = () ->
      _errors({})
      delete target.error
      delete target.errors
      delete target.hasError
      delete target._disposeFallible
      return

    return target

  # Determine if item is fallible
  ko.extenders.fallible.isFallible = (target) ->
    return target.errors? and target.error?

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


  return ko

applyKov(ko)

module.exports = ko