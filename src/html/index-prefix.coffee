  extend = (target, name, value, func) ->
    target.extend({ fallible: true })
    target[name] = value

    error = target.errors.add(ko.pureComputed(func))
    disposeName = '_dispose' + name[0].toUpperCase() + name.slice(1)
    target[disposeName] = () ->
      error.dispose()
      delete target[disposeName]
      return

    if target.bindHtml.peek()
      target.bindHtml.valueHasMutated()

    return target

  optionValue = (options) ->
    if typeof options == 'object'
      return options.value
    else
      return options

  optionMessage = (options, defaultMessage) ->
    if typeof options == 'object'
      return options.message ? defaultMessage
    else
      return defaultMessage
