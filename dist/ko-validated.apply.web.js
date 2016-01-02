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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRlZC5hcHBseS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztPQUFBLElBQUEsUUFBQTtFQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLEVBQUQ7QUFDVCxNQUFBO0VBQUEsRUFBRSxDQUFDLFNBQUgsR0FBZTtFQUdUO0lBQ1Msb0JBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsT0FBbEIsRUFBMkIsT0FBM0IsRUFBb0MsVUFBcEM7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxVQUFEO01BQVUsSUFBQyxDQUFBLFNBQUQ7TUFDN0IsSUFBRyxlQUFIO1FBQ0UsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQURiOztNQUVBLElBQUcsa0JBQUg7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLFdBRGhCOztJQUhXOzt5QkFNYixPQUFBLEdBQVMsU0FBQSxHQUFBOzt5QkFHVCxVQUFBLEdBQVksU0FBQTtBQUNWLGFBQU87SUFERzs7Ozs7RUFHZCxVQUFBLEdBQWE7RUFDYixXQUFBLEdBQWMsU0FBQTtXQUNaLEVBQUU7RUFEVTtFQUdkLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBYixHQUF3QixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBRXRCLFFBQUE7SUFBQSxJQUFHLE9BQUEsS0FBVyxLQUFkOztRQUNFLE1BQU0sQ0FBQzs7QUFDUCxhQUFPLE9BRlQ7O0lBS0EsSUFBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUF0QixDQUFpQyxNQUFqQyxDQUFIO0FBQ0UsYUFBTyxPQURUOztJQUlBLE9BQUEsR0FBVSxFQUFFLENBQUMsVUFBSCxDQUFjLEVBQWQ7SUFDVixNQUFBLEdBQVM7SUFHVCxXQUFBLEdBQWUsRUFBRyxDQUFDO0lBR25CLFlBQUEsR0FBZSxTQUFDLEVBQUQsRUFBSyxPQUFMO0FBQ2IsVUFBQTtNQUFBLElBQUcsT0FBTyxFQUFQLEtBQWEsUUFBaEI7UUFDRSxJQUFHLEVBQUUsQ0FBQyxjQUFILENBQWtC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ZSI6ImtvLXZhbGlkYXRlZC5hcHBseS53ZWIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJhcHBseUtvdiA9IChrbykgLT5cclxuICBrby52YWxpZGF0ZWQgPSB7fVxyXG5cclxuXHJcbiAgY2xhc3MgRGlzcG9zYWJsZVxyXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQG1lc3NhZ2UsIEB0YXJnZXQsIGRpc3Bvc2UsIGlzRGlzcG9zZWQpIC0+XHJcbiAgICAgIGlmIGRpc3Bvc2U/XHJcbiAgICAgICAgQGRpc3Bvc2UgPSBkaXNwb3NlXHJcbiAgICAgIGlmIGlzRGlzcG9zZWQ/XHJcbiAgICAgICAgQGlzRGlzcG9zZWQgPSBpc0Rpc3Bvc2VkXHJcblxyXG4gICAgZGlzcG9zZTogKCkgLT5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgaXNEaXNwb3NlZDogKCkgLT5cclxuICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgX2lkQ291bnRlciA9IDBcclxuICBnZXRVbmlxdWVJZCA9ICgpIC0+XHJcbiAgICArK19pZENvdW50ZXJcclxuXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgRGlzcG9zZT9cclxuICAgIGlmIG9wdGlvbnMgPT0gZmFsc2VcclxuICAgICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGU/KClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgQWxyZWFkeSBjb25zdHJ1Y3RlZFxyXG4gICAgaWYga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUodGFyZ2V0KVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgIyBjb250YWlucyB0aGUgZXJyb3JzIGZvciB0YXJnZXRcclxuICAgIF9lcnJvcnMgPSBrby5vYnNlcnZhYmxlKHt9KVxyXG4gICAgX25hbWVkID0ge31cclxuXHJcbiAgICAjIGhlbHBlciBmb3IgY2FsbGluZyBoYXNPd25Qcm9wZXJ0eVxyXG4gICAgX2hhc093blByb3AgPSAoe30pLmhhc093blByb3BlcnR5XHJcblxyXG4gICAgIyBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZXJyb3IsIGlmIGl0IGV4aXN0c1xyXG4gICAgX3JlbW92ZUVycm9yID0gKGlkLCB0cmlnZ2VyKSAtPlxyXG4gICAgICBpZiB0eXBlb2YgaWQgPT0gJ3N0cmluZydcclxuICAgICAgICBpZiB7fS5oYXNPd25Qcm9wZXJ0eShfbmFtZWQsIGlkKVxyXG4gICAgICAgICAgbmFtZSA9IGlkXHJcbiAgICAgICAgICBpZCA9IF9uYW1lZFtpZF1cclxuICAgICAgICAgIGRlbGV0ZSBfbmFtZWRbbmFtZV1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZCA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgaWYgaWQ/XHJcbiAgICAgICAgZXJyb3JzID0gX2Vycm9ycygpXHJcblxyXG4gICAgICAgIGlmIF9oYXNPd25Qcm9wLmNhbGwoZXJyb3JzLCBpZClcclxuICAgICAgICAgIGRlbGV0ZSBlcnJvcnNbaWRdXHJcblxyXG4gICAgICAgICAgaWYgdHJpZ2dlciAhPSBmYWxzZVxyXG4gICAgICAgICAgICBfZXJyb3JzLnZhbHVlSGFzTXV0YXRlZCgpXHJcblxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAjIFJldHVybnMgdHJ1ZSBpZmYgdGhlIHNwZWNpZmllZCBlcnJvciBleGlzdHNcclxuICAgIF9lcnJvckV4aXN0cyA9IChpZCkgLT5cclxuICAgICAgX2hhc093blByb3AuY2FsbChfZXJyb3JzKCksIGlkKVxyXG5cclxuICAgIF9yZWdpc3RlckVycm9yID0gKGVycm9ycywgbWVzc2FnZSwgbmFtZSwgdHJpZ2dlcikgLT5cclxuICAgICAgaWYgbWVzc2FnZT9cclxuICAgICAgICBpZCA9IGdldFVuaXF1ZUlkKClcclxuXHJcbiAgICAgICAgZGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlKFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIG1lc3NhZ2VcclxuICAgICAgICAgIHRhcmdldFxyXG4gICAgICAgICAgKCkgLT4gX3JlbW92ZUVycm9yKG5hbWUgPyBpZClcclxuICAgICAgICAgICgpIC0+IG5vdCBfZXJyb3JFeGlzdHMoaWQpXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBpZiB0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgaWYge30uaGFzT3duUHJvcGVydHkuY2FsbChfbmFtZWQsIG5hbWUpXHJcbiAgICAgICAgICAgIF9yZW1vdmVFcnJvcihfbmFtZWRbbmFtZV0sIGZhbHNlKVxyXG5cclxuICAgICAgICAgIF9uYW1lZFtuYW1lXSA9IGlkXHJcblxyXG4gICAgICAgIGVycm9yc1tpZF0gPSBtZXNzYWdlXHJcblxyXG4gICAgICAgIGlmIHRyaWdnZXIgIT0gZmFsc2VcclxuICAgICAgICAgIF9lcnJvcnMudmFsdWVIYXNNdXRhdGVkKClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZShcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgICAgdGFyZ2V0XHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBfcmVtb3ZlRXJyb3IobmFtZSwgdHJpZ2dlcilcclxuXHJcbiAgICAgIHJldHVybiBkaXNwb3NhYmxlXHJcblxyXG4gICAgIyBBIGxpc3Qgb2YgYWxsIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycyA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6ICgpIC0+XHJcbiAgICAgICAgbWVzc2FnZXMgPSBbXVxyXG5cclxuICAgICAgICBjb2xsZWN0TWVzc2FnZXMgPSAobWVzc2FnZSkgLT5cclxuICAgICAgICAgIGlmIG5vdCBtZXNzYWdlP1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSgpXHJcbiAgICAgICAgICAgIGNvbGxlY3RNZXNzYWdlcyhtZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGZvciBzdWJNZXNzYWdlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgICBjb2xsZWN0TWVzc2FnZXMoc3ViTWVzc2FnZSlcclxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ3N0cmluZycgb3IgdHlwZW9mIG1lc3NhZ2UgPT0gJ29iamVjdCdcclxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjb25zb2xlPy5hc3NlcnQ/KGZhbHNlLCAnaW52YWxpZCBlcnJvciBtZXNzYWdlJylcclxuXHJcbiAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgZm9yIG93biBpZCwgbWVzc2FnZSBvZiBfZXJyb3JzKClcclxuICAgICAgICAgIGNvbGxlY3RNZXNzYWdlcyhtZXNzYWdlKVxyXG5cclxuICAgICAgICByZXR1cm4gbWVzc2FnZXNcclxuXHJcbiAgICAgIHdyaXRlOiAobWVzc2FnZXMpIC0+XHJcbiAgICAgICAgdGFyZ2V0LmVycm9ycy5zZXQobWVzc2FnZXMpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9KVxyXG5cclxuICAgICMgQWRkIGFuIGluZGl2aWR1YWwgZXJyb3JcclxuICAgIHRhcmdldC5lcnJvcnMuYWRkID0gKG5hbWUsIG1lc3NhZ2UpIC0+XHJcbiAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxyXG4gICAgICAgIG1lc3NhZ2UgPSBuYW1lXHJcbiAgICAgICAgbmFtZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgcmV0dXJuIF9yZWdpc3RlckVycm9yKF9lcnJvcnMoKSwgbWVzc2FnZSwgbmFtZSwgdHJ1ZSlcclxuXHJcbiAgICAjIFNldCBhIHNpbmdsZSBlcnJvciwgY2xlYXJpbmcgb3RoZXIgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzLnNldCA9IChuYW1lLCBtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDFcclxuICAgICAgICBtZXNzYWdlID0gbmFtZVxyXG4gICAgICAgIG5hbWUgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGVycm9ycyA9IHt9XHJcbiAgICAgIF9uYW1lZCA9IHt9XHJcbiAgICAgIGRpc3Bvc2FibGUgPSBfcmVnaXN0ZXJFcnJvcihlcnJvcnMsIG1lc3NhZ2UsIG5hbWUsIGZhbHNlKVxyXG4gICAgICBfZXJyb3JzKGVycm9ycylcclxuICAgICAgcmV0dXJuIGRpc3Bvc2FibGVcclxuXHJcbiAgICAjIEdldCB0aGUgZmlyc3QgZXJyb3JcclxuICAgIHRhcmdldC5lcnJvcnMuZ2V0ID0gKG5hbWUpIC0+XHJcbiAgICAgIGZpcnN0TWVzc2FnZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgZmluZE1lc3NhZ2UgPSAobWVzc2FnZSkgLT5cclxuICAgICAgICBpZiBub3QgbWVzc2FnZT9cclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgaWYgZmluZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIEFycmF5LmlzQXJyYXkobWVzc2FnZSlcclxuICAgICAgICAgIGZvciBzdWJNZXNzYWdlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgaWYgZmluZE1lc3NhZ2Uoc3ViTWVzc2FnZSlcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ3N0cmluZycgb3IgdHlwZW9mIG1lc3NhZ2UgPT0gJ29iamVjdCdcclxuICAgICAgICAgIGZpcnN0TWVzc2FnZSA9IG1lc3NhZ2VcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgY29uc29sZT8uYXNzZXJ0PyhmYWxzZSwgJ2ludmFsaWQgZXJyb3IgbWVzc2FnZScpXHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgaWYgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZydcclxuICAgICAgICBpZiB7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF9uYW1lZCwgbmFtZSlcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKF9lcnJvcnMoKVtfbmFtZWRbbmFtZV1dKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RNZXNzYWdlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3Igb3duIGlkLCBtZXNzYWdlIG9mIF9lcnJvcnMoKVxyXG4gICAgICAgICAgaWYgZmluZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0TWVzc2FnZVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICAgIHRhcmdldC5lcnJvcnMuaGFzID0gKG5hbWUpIC0+XHJcbiAgICAgIHJldHVybiB0YXJnZXQuZXJyb3JzLmdldChuYW1lKT9cclxuXHJcbiAgICB0YXJnZXQuZXJyb3JzLnJlbW92ZSA9IChuYW1lKSAtPlxyXG4gICAgICBpZiB0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgIF9yZW1vdmVFcnJvcihuYW1lKVxyXG5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBDbGVhciBhbGwgdGhlIGN1cnJlbnQgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzLmNsZWFyID0gKCkgLT5cclxuICAgICAgX25hbWVkID0ge31cclxuICAgICAgX2Vycm9ycyh7fSlcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBHZXQgdGhlIGZpcnN0IGVycm9yLCBvciBTZXQgYSBzaW5nbGUgZXJyb3Igd2hpbHN0IGNsZWFyaW5nIG90aGVyIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9yID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogdGFyZ2V0LmVycm9ycy5nZXRcclxuICAgICAgd3JpdGU6IHRhcmdldC5lcnJvcnMuc2V0XHJcbiAgICB9KVxyXG5cclxuICAgICMgUmV0dXJuIHRydWUgaWZmIHRoZXJlIGFyZSBhbnkgZXJyb3JzXHJcbiAgICB0YXJnZXQuaGFzRXJyb3IgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiB0YXJnZXQuZXJyb3JzLmhhc1xyXG4gICAgfSlcclxuXHJcbiAgICAjIFJlbW92ZSBmYWxsaWJsZSBkYXRhIGZyb20gdGhlIHRhcmdldCBvYmplY3RcclxuICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlID0gKCkgLT5cclxuICAgICAgX2Vycm9ycyh7fSlcclxuICAgICAgZGVsZXRlIHRhcmdldC5lcnJvclxyXG4gICAgICBkZWxldGUgdGFyZ2V0LmVycm9yc1xyXG4gICAgICBkZWxldGUgdGFyZ2V0Lmhhc0Vycm9yXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICMgRGV0ZXJtaW5lIGlmIGl0ZW0gaXMgZmFsbGlibGVcclxuICBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZSA9ICh0YXJnZXQpIC0+XHJcbiAgICByZXR1cm4gdGFyZ2V0LmVycm9ycz8gYW5kIHRhcmdldC5lcnJvcj9cclxuXHJcbiAgZ2V0RGVwZW5kZW5jaWVzID0gZG8gLT5cclxuICAgIHN5bVN0YXRlID0gZG8gLT5cclxuICAgICAgYyA9IGtvLmNvbXB1dGVkKCgpIC0+IHJldHVybilcclxuICAgICAgaWYgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scz9cclxuICAgICAgICBmb3Igc3ltYm9sIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoYylcclxuICAgICAgICAgIGlmIFN0cmluZyhzeW1ib2wpID09ICdTeW1ib2woX3N0YXRlKSdcclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbFxyXG5cclxuICAgICAgaWYge30uaGFzT3duUHJvcGVydHkuY2FsbChjLCAnX3N0YXRlJylcclxuICAgICAgICByZXR1cm4gJ19zdGF0ZSdcclxuXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGRlcEtleSA9IGRvIC0+XHJcbiAgICAgIG8gPSBrby5vYnNlcnZhYmxlKClcclxuICAgICAgYyA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgICByZWFkOiAoKSAtPiBvKClcclxuICAgICAgfSlcclxuICAgICAgZm9yIG93biBrZXksIHZhbCBvZiBjW3N5bVN0YXRlXVxyXG4gICAgICAgIGlmIHZhbD8gYW5kIHR5cGVvZiB2YWwgPT0gJ29iamVjdCdcclxuICAgICAgICAgIHJldHVybiBrZXlcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuICh0YXJnZXQpIC0+XHJcbiAgICAgIGlmIGtvLmlzQ29tcHV0ZWQodGFyZ2V0KVxyXG4gICAgICAgIHJldHVybiB0YXJnZXRbc3ltU3RhdGVdW2RlcEtleV1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVybiB7fVxyXG5cclxuICBrby5leHRlbmRlcnMuZmFsbGlibGVSZWFkID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgIGlmIG5vdCBrby5pc0NvbXB1dGVkKHRhcmdldClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgIHRhcmdldC5leHRlbmQoeyBmYWxsaWJsZTogdHJ1ZSB9KVxyXG5cclxuICAgIGlmIG9wdGlvbnMgPT0gZmFsc2VcclxuICAgICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVSZWFkPygpXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGZpbmRJbm5lciA9IChvdXRwdXQsIGNvbXB1dGVkKSAtPlxyXG4gICAgICBmb3Igb3duIGtleSwgZGVwZW5kZW5jeSBvZiBnZXREZXBlbmRlbmNpZXMoY29tcHV0ZWQpXHJcbiAgICAgICAgZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3kuX3RhcmdldFxyXG4gICAgICAgIGlmIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlKGRlcGVuZGVuY3kpXHJcbiAgICAgICAgICBpZiBvdXRwdXQuaW5kZXhPZihkZXBlbmRlbmN5LmVycm9ycykgPT0gLTFcclxuICAgICAgICAgICAgb3V0cHV0LnB1c2goZGVwZW5kZW5jeS5lcnJvcnMpXHJcblxyXG4gICAgICAgIGlmIGtvLmlzQ29tcHV0ZWQoZGVwZW5kZW5jeSlcclxuICAgICAgICAgIGZpbmRJbm5lcihvdXRwdXQsIGRlcGVuZGVuY3kpXHJcblxyXG4gICAgICByZXR1cm4gb3V0cHV0XHJcblxyXG4gICAgZXJyb3JzID0gKCkgLT5cclxuICAgICAgdHJ5XHJcbiAgICAgICAgI3N1YnNjcmlwdGlvbiA9IHRhcmdldC5zdWJzY3JpYmUoKCkgLT4gcmV0dXJuKVxyXG4gICAgICAgICN0YXJnZXQoKVxyXG4gICAgICAgIHJldHVybiBmaW5kSW5uZXIoW10sIHRhcmdldClcclxuICAgICAgZmluYWxseVxyXG4gICAgICAgICNzdWJzY3JpcHRpb24uZGlzcG9zZSgpXHJcblxyXG4gICAgZGlzcG9zYWJsZSA9IHRhcmdldC5lcnJvcnMuYWRkKGVycm9ycylcclxuXHJcbiAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZVJlYWQgPSAoKSAtPlxyXG4gICAgICBpZiBkaXNwb3NhYmxlP1xyXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXHJcbiAgICAgICAgZGlzcG9zYWJsZSA9IHVuZGVmaW5lZFxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG5cclxuICByZXR1cm4ga29cclxuIl19
