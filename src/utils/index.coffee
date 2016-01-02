  ko.validated.isFallible = (observable) ->
    ko.isObservable(observable) and
    ko.isObservable(observable.error) and
    typeof observable.hasError == 'function' and
    typeof observable._disposeFallible == 'function'
