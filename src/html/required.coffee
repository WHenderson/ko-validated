  ko.extenders.required = (target, options) ->
    required = optionValue(options)
    message = optionMessage(options, ko.extenders.pattern.options.message)

    return extend(target, 'required', required, () ->
      () ->
        if required()
          value = target()

          if not value? or /^\s*$/.test(value)
            return message

        return
    )

  ko.extenders.pattern.options = { message: 'is required' }

  ko.bindingHandlers.required = {
    update: (element, valueAccessor) ->
      tagName = element.name.toUpperCase()
      if tagName == 'INPUT' or tagName == 'SELECT' or tagName == 'TEXTAREA'
        value = ko.utils.unwrapObservable(valueAccessor())
        if not value
          if element.required
            element.removeAttribute('required')
        else
          element.required = true
      return
  }
