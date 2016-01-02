;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.applyKov = factory();
  }
}(this, function () {
var applyKov,
  hasProp = {}.hasOwnProperty;

applyKov = function(ko) {
  var Disposable, _idCounter, getDependencies, getUniqueId;
  ko.validated = {};
  Disposable = (function() {
    function Disposable(name1, message1, target1, dispose, isDisposed) {
      this.name = name1;
      this.message = message1;
      this.target = target1;
      if (dispose != null) {
        this.dispose = dispose;
      }
      if (isDisposed != null) {
        this.isDisposed = isDisposed;
      }
    }

    Disposable.prototype.dispose = function() {};

    Disposable.prototype.isDisposed = function() {
      return true;
    };

    return Disposable;

  })();
  _idCounter = 0;
  getUniqueId = function() {
    return ++_idCounter;
  };
  ko.extenders.fallible = function(target, options) {
    var _errorExists, _errors, _hasOwnProp, _named, _registerError, _removeError;
    if (options === false) {
      if (typeof target._disposeFallible === "function") {
        target._disposeFallible();
      }
      return target;
    }
    if (ko.extenders.fallible.isFallible(target)) {
      return target;
    }
    _errors = ko.observable({});
    _named = {};
    _hasOwnProp = {}.hasOwnProperty;
    _removeError = function(id, trigger) {
      var errors, name;
      if (typeof id === 'string') {
        if ({}.hasOwnProperty(_named, id)) {
          name = id;
          id = _named[id];
          delete _named[name];
        } else {
          id = void 0;
        }
      }
      if (id != null) {
        errors = _errors();
        if (_hasOwnProp.call(errors, id)) {
          delete errors[id];
          if (trigger !== false) {
            _errors.valueHasMutated();
          }
        }
      }
    };
    _errorExists = function(id) {
      return _hasOwnProp.call(_errors(), id);
    };
    _registerError = function(errors, message, name, trigger) {
      var disposable, id;
      if (message != null) {
        id = getUniqueId();
        disposable = new Disposable(name, message, target, function() {
          return _removeError(name != null ? name : id);
        }, function() {
          return !_errorExists(id);
        });
        if (typeof name === 'string') {
          if ({}.hasOwnProperty.call(_named, name)) {
            _removeError(_named[name], false);
          }
          _named[name] = id;
        }
        errors[id] = message;
        if (trigger !== false) {
          _errors.valueHasMutated();
        }
      } else {
        disposable = new Disposable(name, message, target);
        _removeError(name, trigger);
      }
      return disposable;
    };
    target.errors = ko.pureComputed({
      read: function() {
        var collectMessages, id, message, messages, ref;
        messages = [];
        collectMessages = function(message) {
          var i, len, subMessage;
          if (message == null) {
            return;
          } else if (typeof message === 'function') {
            message = message();
            collectMessages(message);
          } else if (Array.isArray(message)) {
            for (i = 0, len = message.length; i < len; i++) {
              subMessage = message[i];
              collectMessages(subMessage);
            }
          } else if (typeof message === 'string' || typeof message === 'object') {
            messages.push(message);
          } else {
            if (typeof console !== "undefined" && console !== null) {
              if (typeof console.assert === "function") {
                console.assert(false, 'invalid error message');
              }
            }
          }
        };
        ref = _errors();
        for (id in ref) {
          if (!hasProp.call(ref, id)) continue;
          message = ref[id];
          collectMessages(message);
        }
        return messages;
      },
      write: function(messages) {
        target.errors.set(messages);
      }
    });
    target.errors.add = function(name, message) {
      if (arguments.length === 1) {
        message = name;
        name = void 0;
      }
      return _registerError(_errors(), message, name, true);
    };
    target.errors.set = function(name, message) {
      var disposable, errors;
      if (arguments.length === 1) {
        message = name;
        name = void 0;
      }
      errors = {};
      _named = {};
      disposable = _registerError(errors, message, name, false);
      _errors(errors);
      return disposable;
    };
    target.errors.get = function(name) {
      var findMessage, firstMessage, id, message, ref;
      firstMessage = void 0;
      findMessage = function(message) {
        var i, len, subMessage;
        if (message == null) {
          return false;
        } else if (typeof message === 'function') {
          message = message();
          if (findMessage(message)) {
            return true;
          }
        } else if (Array.isArray(message)) {
          for (i = 0, len = message.length; i < len; i++) {
            subMessage = message[i];
            if (findMessage(subMessage)) {
              return true;
            }
          }
        } else if (typeof message === 'string' || typeof message === 'object') {
          firstMessage = message;
          return true;
        } else {
          if (typeof console !== "undefined" && console !== null) {
            if (typeof console.assert === "function") {
              console.assert(false, 'invalid error message');
            }
          }
        }
        return false;
      };
      if (typeof name === 'string') {
        if ({}.hasOwnProperty.call(_named, name)) {
          if (findMessage(_errors()[_named[name]])) {
            return firstMessage;
          }
        }
      } else {
        ref = _errors();
        for (id in ref) {
          if (!hasProp.call(ref, id)) continue;
          message = ref[id];
          if (findMessage(message)) {
            return firstMessage;
          }
        }
      }
      return void 0;
    };
    target.errors.has = function(name) {
      return target.errors.get(name) != null;
    };
    target.errors.remove = function(name) {
      if (typeof name === 'string') {
        _removeError(name);
      }
    };
    target.errors.clear = function() {
      _named = {};
      _errors({});
    };
    target.error = ko.pureComputed({
      read: target.errors.get,
      write: target.errors.set
    });
    target.hasError = ko.pureComputed({
      read: target.errors.has
    });
    target._disposeFallible = function() {
      _errors({});
      delete target.error;
      delete target.errors;
      delete target.hasError;
      delete target._disposeFallible;
    };
    return target;
  };
  ko.extenders.fallible.isFallible = function(target) {
    return (target.errors != null) && (target.error != null);
  };
  getDependencies = (function() {
    var depKey, symState;
    symState = (function() {
      var c, i, len, ref, symbol;
      c = ko.computed(function() {});
      if (Object.getOwnPropertySymbols != null) {
        ref = Object.getOwnPropertySymbols(c);
        for (i = 0, len = ref.length; i < len; i++) {
          symbol = ref[i];
          if (String(symbol) === 'Symbol(_state)') {
            return symbol;
          }
        }
      }
      if ({}.hasOwnProperty.call(c, '_state')) {
        return '_state';
      }
    })();
    depKey = (function() {
      var c, key, o, ref, val;
      o = ko.observable();
      c = ko.computed({
        read: function() {
          return o();
        }
      });
      ref = c[symState];
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        val = ref[key];
        if ((val != null) && typeof val === 'object') {
          return key;
        }
      }
    })();
    return function(target) {
      if (ko.isComputed(target)) {
        return target[symState][depKey];
      } else {
        return {};
      }
    };
  })();
  ko.extenders.fallibleRead = function(target, options) {
    var disposable, errors, findInner;
    if (!ko.isComputed(target)) {
      return target;
    }
    target.extend({
      fallible: true
    });
    if (options === false) {
      if (typeof target._disposeFallibleRead === "function") {
        target._disposeFallibleRead();
      }
      return;
    }
    findInner = function(output, computed) {
      var dependency, key, ref;
      ref = getDependencies(computed);
      for (key in ref) {
        if (!hasProp.call(ref, key)) continue;
        dependency = ref[key];
        dependency = dependency._target;
        if (ko.extenders.fallible.isFallible(dependency)) {
          if (output.indexOf(dependency.errors) === -1) {
            output.push(dependency.errors);
          }
        }
        if (ko.isComputed(dependency)) {
          findInner(output, dependency);
        }
      }
      return output;
    };
    errors = function() {
      try {
        return findInner([], target);
      } finally {

      }
    };
    disposable = target.errors.add(errors);
    target._disposeFallibleRead = function() {
      if (disposable != null) {
        disposable.dispose();
        disposable = void 0;
      }
    };
    return target;
  };
  return ko;
};

return applyKov;
}));
