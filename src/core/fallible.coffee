  _idCounter = 0
  getUniqueId = () ->
    ++_idCounter

  hasAnyProp = (object) ->
    for own key of object
      return true
    return false

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
    # Returns True if a the trigger still needs to be pulled
    _removeError = (id, trigger) ->
      if typeof id == 'string'
        if _hasOwnProp.call(_named, id)
          name = id
          id = _named[name]
          delete _named[name]
        else
          id = undefined

      if id?
        errors = _errors()

        if _hasOwnProp.call(errors, id)
          delete errors[id]

          # remove associated name if not already done
          if not name?
            for own name, nameId of _named
              if nameId == id
                delete _named[name]
                break

          if trigger != false
            _errors.valueHasMutated()
            return false
          else
            return true

      return false

    # Returns true iff the specified error exists
    _errorExists = (id) ->
      _hasOwnProp.call(_errors(), id)

    _registerError = (errors, message, name, trigger) ->
      if typeof name == 'string' and _hasOwnProp.call(_named, name)
        throw new Error('name already exists')

      if message?
        id = getUniqueId()

        errors[id] = message

        if typeof name == 'string'
          _named[name] = id

        disposable = new Disposable(
          name,
          message
          target
          () -> _removeError(id)
          () -> not _errorExists(id)
        )

        if trigger != false
          _errors.valueHasMutated()
      else
        disposable = new Disposable(
          name,
          message,
          target
        )

      return disposable

    # get all the messages
    getMessages = (message, collection = []) ->
      recurse = (message) ->
        if typeof message == 'function'
          message = message()
          recurse(message)
        else if Array.isArray(message)
          for subMessage in message
            recurse(subMessage)
        else if typeof message == 'string' or typeof message == 'object'
          collection.push(message)

        return

      recurse(message)

      return collection

    # get a single message
    getMessage = (message) ->
      if typeof message == 'function'
        message = message()
        return getMessage(message)
      else if Array.isArray(message)
        for subMessage in message
          subMessage = getMessage(subMessage)
          if subMessage?
            return subMessage
      else if typeof message == 'string' or typeof message == 'object'
        return message

      return

    # A list of all errors
    target.errors = ko.pureComputed({
      read: () ->
        collection = []

        for own id, message of _errors()
          getMessages(message, collection)

        return collection

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
      errors = _errors()

      if arguments.length == 1
        message = name
        name = undefined

        if hasAnyProp(errors)
          errors = {}
          _named = {}
          disposable = _registerError(errors, message, name, false)
          _errors(errors)
        else
          disposable = _registerError(errors, message, name, true)
      else
        trigger = _removeError(name, false)
        disposable = _registerError(errors, message, name, false)
        if trigger or not disposable.isDisposed()
          _errors.valueHasMutated()

      return disposable

    # Get the first error
    target.errors.get = (name) ->
      if typeof name == 'string'
        if _hasOwnProp.call(_named, name)
          return getMessage(_errors()[_named[name]])
      else
        for own id, message of _errors()
          message = getMessage(message)
          if message?
            return message

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
