  ko.extenders.pattern = (target, options) ->
    pattern = optionValue(options)
    message = optionMessage(options, ko.extenders.pattern.options.message)

    return extend(target, 'pattern', pattern, () ->
      () ->
        patternValue = pattern()
        if patternValue?
          targetValue = target()

          if not RegExp(patternValue).test(targetValue)
            return message

        return
    )

  ko.extenders.pattern.options = { message: 'is invalid' }

  ko.bindingHandlers.pattern = {
    update: (element, valueAccessor) ->
      tagName = element.name.toUpperCase()
      if tagName == 'INPUT'
        value = ko.utils.unwrapObservable(valueAccessor())
        if not value?
          if element.hasAttribute('pattern')
            element.removeAttribute('pattern')
        else
          element.setAttribute('pattern', if typeof value == 'string' then value else value.source)
      return
  }
