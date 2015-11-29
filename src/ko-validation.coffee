applyKov = (ko) ->
  ko.extenders.fallible = (target, options) ->
    # Dispose?
    if options == false
      target._disposeFallible?()
      return target

    # Already constructed
    if ko.extenders.fallible.isFallible(target)
      return target

    # Defaults
    if typeof options == true
      options = {}

    finalOptions = {}
    do ->
      for own key, value in ko.extenders.fallible.options
        finalOptions[key] = options[key] ? value


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
      id = ++_idCounter
      _errors()[id] = message
      _errors.valueHasMutated()

      return {
        message: message
        target: target
        dispose: () ->
          _removeError(id)
        isDisposed: () ->
          _errorExists(id)
      }

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
    target.errors.set = (messages) ->
      errors = {}
      if message?
        errors[++_idCounter] = message
      _errors(errors)
      return

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
      return

    return target

  # Determine if item is fallible
  ko.extenders.fallible.isFallible = (target) ->
    return target.errors? and target.error?

  # Default options for fallible
  ko.extenders.fallible.options = {}
