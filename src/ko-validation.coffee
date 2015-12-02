applyKov = (ko) ->
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

    # used for generating a unique id for each error
    _idCounter = 0

    # helper for calling hasOwnProperty
    _hasOwnProp = ({}).hasOwnProperty

    # Removes the specified error, if it exists
    _removeError = (id) ->
      errors = _errors()

      if _hasOwnProp.call(errors, id)
        delete errors[id]
        _errors.valueHasMutated()

      return

    # Returns true iff the specified error exists
    _errorExists = (id) ->
      _hasOwnProp.call(_errors(), id)

    _errorMetaData = (errors, id, message) ->
      if id?
        metaData = {
          message: message
          target: target
          dispose: () ->
            _removeError(id)
          isDisposed: () ->
            not _errorExists(id)
        }
        errors[id] = message
      else
        metaData = {
          message: message
          target: target
          dispose: () -> undefined
          isDisposed: () -> true
        }

      return metaData

    # A list of all errors
    target.errors = ko.pureComputed({
      read: () ->
        messages = []

        addMessage = (message) ->
          if not message?
            return
          else if typeof message == 'function'
            message = message()
            addMessage(message)
          else if Array.isArray(message)
            for subMessage in message
              addMessage(subMessage)
          else if typeof message == 'string' or typeof message == 'object'
            messages.push(message)
          else
            console?.assert?(false, 'invalid error message')

          return

        for own id, message of _errors()
          addMessage(message)

        return messages

      write: (messages) ->
        target.errors.set(messages)
        return
    })

    # Add an individual error
    target.errors.add = (message) ->
      if message?
        id = ++_idCounter

      metaData = _errorMetaData(_errors(), id, message)
      _errors.valueHasMutated()

      return metaData

    # Get the first error
    target.errors.get = () ->
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

      for own id, message of _errors()
        if findMessage(message)
          return firstMessage

      return undefined

    # Set a single error, clearing other errors
    target.errors.set = (message) ->
      if message?
        id = ++_idCounter

      errors = {}
      metaData = _errorMetaData(errors, id, message)
      _errors(errors)
      return metaData

    target.errors.has = () ->
      return target.error()?

    # Clear all the current errors
    target.errors.clear = () ->
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

  ko.pureErrors = (read, owner) ->
    subscription = undefined

    computed = ko.pureComputed(
      () ->
        errors = []
        addError = (target, message) ->
          if target?
            target = target.extend({ fallible: true })
            errors.push(target.errors.add(message))
          else
            errors.push({
              message: message
              dispose: () -> undefined
              isDisposed: () -> true
            })

          return

        dispose = () ->
          for error in errors
            error.dispose()
          errors = []
          subscription.dispose()
          subscription = undefined
          return

        try
          read.call(owner, addError)
        finally
          subscription = computed.subscribe(dispose, null, 'asleep')

        return errors
    )

    return computed

  return ko

