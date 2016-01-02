  unwrap = (value) ->
    if typeof value == 'function'
      return value()
    else
      return value

  createGetError = (target, options) ->
    () ->
      value = target()
      if not validator(value, options.param, options)
        if typeof options.message == 'function' and not ko.isObservable(options.message)
          return options.message(value, options)
        else
          return options.message
      return

  ko.extensions.required = (target, overrides) ->
    target.extend({ fallible: true })

    if not overrides? or typeof overrides != 'object'
      overrides = { param: overrides }

    options = ko.extend({}, ko.extensions.required.options)
    options = ko.extend(options, overrides)

    target.errors.add('required', createGetError(target, options))

    target.required = ko.pureComputed(() -> target.errors.has('required'))

    return target

  # ToDo: Make options look like the other library
  ko.extensions.required.options = {
    message: 'is required'
    validator: (value) ->
      return value? and value != ''
  }

  required = target.errors.add('required', () ->
    value = target()
    if not value? or value == ''
      return 'is required'
    return
  )
