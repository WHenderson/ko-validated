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
