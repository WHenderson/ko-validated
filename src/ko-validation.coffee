applyKov = (ko) ->
  ko.extenders.fallible = (target, options) ->

    if ko.extenders.fallible.isFallible(target)
      return target

    # contains the errors for target
    _errors = ko.observable({})

    # used for generating a unique id for each error
    _idCounter = 0

    _hasOwnProp = ({}).hasOwnProperty

    _removeError = (id) ->
      errors = _errors()

      if _hasOwnProp.call(errors, id)
        delete errors[id]
        _errors.valueHasMutated()

      return

    _errorExists = (id) ->
      _hasOwnProp.call(_errors(), id)

    target.errors = ko.pureComputed({
      read: () ->
        messages = []

        addMessage = (message) ->
          if typeof message == 'function'
            message = message()

          if message?
            if typeof message == 'string'
              messages.push(message)
            else
              for subMessage in message
                addMessage(subMessage)

          return

        for own id, message of _errors()
          addMessage(message)

        return messages

      write: (messages) ->
        target.errors.set(messages)
        return
    })

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

    target.errors.set = (messages) ->
      if typeof messages == 'string' or typeof messages == 'function'
        messages = [message]

      errors = {}
      if messages?
        for message in messages
          errors[++_idCounter] = message

      _errors(errors)

      return

    target.errors.clear = () ->
      _errors({})
      return

    target.error = ko.pureComputed({
      read: () ->
        firstMessage = undefined

        findMessage = (message) ->
          if typeof message == 'function'
            message = message()

          if typeof message == 'string'
            firstMessage = message
            return true
          else if message?
            for subMessage in message
              if findMessage(subMessage)
                return true

          return false

        for own id, message of _errors()
          if findMessage(message)
            return firstMessage

        return undefined

      write: (message) ->
        errors = {}
        if message?
          errors[++_idCounter] = message
        _errors(errors)
        return
    })

    return target

  ko.extenders.fallible.isFallible = (target) ->
    return target.errors? and target.error?


  return ko
