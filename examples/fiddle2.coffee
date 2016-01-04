ko = require('../index')
isAn = require('is-an')

registerValidator = (name, defaultOptions, defaultOption = 'params') ->

  ko.extenders[name] = (target, options) ->
    target.extend({ fallible: true })

    # default option
    if not isAn.Object(options)
      o = {}
      o[defaultOption] = options
      options = o

    options = ko.utils.extend(ko.utils.extend({}, ko.extenders[name].options), options)

    target.errors.add(
      name
      () ->
        value = target()

        params = ko.utils.unwrapObservable(options.params) ? []
        if not isAn.Array(params)
          params = [params]

        isValid = options.validator.call(target, value, params, options)

        if isValid == false
          message = options.message
          if typeof message == 'string'
            message = message.replace(
              /(?:\\(.))|{(\d+)}/g
              (match, escape, group) ->
                if escape?
                  return escape
                return params[group]
            )
          return message
        else if isValid == true
          return
        else
          return isValid
    )

    return target

  ko.extenders[name].options = defaultOptions

  return this



registerValidator(
  'required'
  {
    message: 'is required'
    params: [true]
    validator: (value, params) ->
      isRequired = params[0]
      if isRequired
        return value? and value != ''
      else
        return true
  }
)

base = ko.observable().extend({ required: true })

console.log(base.errors())

base(10)

console.log(base.errors())

base(undefined)

console.log(base.errors())

base = ko.observable().extend({ required: false })

console.log(base.errors())
