(function (ko){
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

applyKov(ko);

module.exports = ko;
})(require('knockout'));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRlZC5hcHBsaWVkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0NBQUEsSUFBQSxRQUFBO0VBQUE7O0FBQUEsUUFBQSxHQUFXLFNBQUMsRUFBRDtBQUNULE1BQUE7RUFBQSxFQUFFLENBQUMsU0FBSCxHQUFlO0VBR1Q7SUFDUyxvQkFBQyxLQUFELEVBQVEsUUFBUixFQUFrQixPQUFsQixFQUEyQixPQUEzQixFQUFvQyxVQUFwQztNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFVBQUQ7TUFBVSxJQUFDLENBQUEsU0FBRDtNQUM3QixJQUFHLGVBQUg7UUFDRSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBRGI7O01BRUEsSUFBRyxrQkFBSDtRQUNFLElBQUMsQ0FBQSxVQUFELEdBQWMsV0FEaEI7O0lBSFc7O3lCQU1iLE9BQUEsR0FBUyxTQUFBLEdBQUE7O3lCQUdULFVBQUEsR0FBWSxTQUFBO0FBQ1YsYUFBTztJQURHOzs7OztFQUdkLFVBQUEsR0FBYTtFQUNiLFdBQUEsR0FBYyxTQUFBO1dBQ1osRUFBRTtFQURVO0VBR2QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFiLEdBQXdCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFFdEIsUUFBQTtJQUFBLElBQUcsT0FBQSxLQUFXLEtBQWQ7O1FBQ0UsTUFBTSxDQUFDOztBQUNQLGFBQU8sT0FGVDs7SUFLQSxJQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQXRCLENBQWlDLE1BQWpDLENBQUg7QUFDRSxhQUFPLE9BRFQ7O0lBSUEsT0FBQSxHQUFVLEVBQUUsQ0FBQyxVQUFILENBQWMsRUFBZDtJQUNWLE1BQUEsR0FBUztJQUdULFdBQUEsR0FBZSxFQUFHLENBQUM7SUFHbkIsWUFBQSxHQUFlLFNBQUMsRUFBRCxFQUFLLE9BQUw7QUFDYixVQUFBO01BQUEsSUFBRyxPQUFPLEVBQVAsS0FBYSxRQUFoQjtRQUNFLElBQUcsRUFBRSxDQUFDLGNBQUgsQ0FBa0IsTUFB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QUEsQ0FBUyxFQUFUIiwiZmlsZSI6ImtvLXZhbGlkYXRlZC5hcHBsaWVkLm5vZGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJhcHBseUtvdiA9IChrbykgLT5cclxuICBrby52YWxpZGF0ZWQgPSB7fVxyXG5cclxuXHJcbiAgY2xhc3MgRGlzcG9zYWJsZVxyXG4gICAgY29uc3RydWN0b3I6IChAbmFtZSwgQG1lc3NhZ2UsIEB0YXJnZXQsIGRpc3Bvc2UsIGlzRGlzcG9zZWQpIC0+XHJcbiAgICAgIGlmIGRpc3Bvc2U/XHJcbiAgICAgICAgQGRpc3Bvc2UgPSBkaXNwb3NlXHJcbiAgICAgIGlmIGlzRGlzcG9zZWQ/XHJcbiAgICAgICAgQGlzRGlzcG9zZWQgPSBpc0Rpc3Bvc2VkXHJcblxyXG4gICAgZGlzcG9zZTogKCkgLT5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgaXNEaXNwb3NlZDogKCkgLT5cclxuICAgICAgcmV0dXJuIHRydWVcclxuXHJcbiAgX2lkQ291bnRlciA9IDBcclxuICBnZXRVbmlxdWVJZCA9ICgpIC0+XHJcbiAgICArK19pZENvdW50ZXJcclxuXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgRGlzcG9zZT9cclxuICAgIGlmIG9wdGlvbnMgPT0gZmFsc2VcclxuICAgICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGU/KClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgQWxyZWFkeSBjb25zdHJ1Y3RlZFxyXG4gICAgaWYga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUodGFyZ2V0KVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgIyBjb250YWlucyB0aGUgZXJyb3JzIGZvciB0YXJnZXRcclxuICAgIF9lcnJvcnMgPSBrby5vYnNlcnZhYmxlKHt9KVxyXG4gICAgX25hbWVkID0ge31cclxuXHJcbiAgICAjIGhlbHBlciBmb3IgY2FsbGluZyBoYXNPd25Qcm9wZXJ0eVxyXG4gICAgX2hhc093blByb3AgPSAoe30pLmhhc093blByb3BlcnR5XHJcblxyXG4gICAgIyBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZXJyb3IsIGlmIGl0IGV4aXN0c1xyXG4gICAgX3JlbW92ZUVycm9yID0gKGlkLCB0cmlnZ2VyKSAtPlxyXG4gICAgICBpZiB0eXBlb2YgaWQgPT0gJ3N0cmluZydcclxuICAgICAgICBpZiB7fS5oYXNPd25Qcm9wZXJ0eShfbmFtZWQsIGlkKVxyXG4gICAgICAgICAgbmFtZSA9IGlkXHJcbiAgICAgICAgICBpZCA9IF9uYW1lZFtpZF1cclxuICAgICAgICAgIGRlbGV0ZSBfbmFtZWRbbmFtZV1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBpZCA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgaWYgaWQ/XHJcbiAgICAgICAgZXJyb3JzID0gX2Vycm9ycygpXHJcblxyXG4gICAgICAgIGlmIF9oYXNPd25Qcm9wLmNhbGwoZXJyb3JzLCBpZClcclxuICAgICAgICAgIGRlbGV0ZSBlcnJvcnNbaWRdXHJcblxyXG4gICAgICAgICAgaWYgdHJpZ2dlciAhPSBmYWxzZVxyXG4gICAgICAgICAgICBfZXJyb3JzLnZhbHVlSGFzTXV0YXRlZCgpXHJcblxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAjIFJldHVybnMgdHJ1ZSBpZmYgdGhlIHNwZWNpZmllZCBlcnJvciBleGlzdHNcclxuICAgIF9lcnJvckV4aXN0cyA9IChpZCkgLT5cclxuICAgICAgX2hhc093blByb3AuY2FsbChfZXJyb3JzKCksIGlkKVxyXG5cclxuICAgIF9yZWdpc3RlckVycm9yID0gKGVycm9ycywgbWVzc2FnZSwgbmFtZSwgdHJpZ2dlcikgLT5cclxuICAgICAgaWYgbWVzc2FnZT9cclxuICAgICAgICBpZCA9IGdldFVuaXF1ZUlkKClcclxuXHJcbiAgICAgICAgZGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlKFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIG1lc3NhZ2VcclxuICAgICAgICAgIHRhcmdldFxyXG4gICAgICAgICAgKCkgLT4gX3JlbW92ZUVycm9yKG5hbWUgPyBpZClcclxuICAgICAgICAgICgpIC0+IG5vdCBfZXJyb3JFeGlzdHMoaWQpXHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBpZiB0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgICAgaWYge30uaGFzT3duUHJvcGVydHkuY2FsbChfbmFtZWQsIG5hbWUpXHJcbiAgICAgICAgICAgIF9yZW1vdmVFcnJvcihfbmFtZWRbbmFtZV0sIGZhbHNlKVxyXG5cclxuICAgICAgICAgIF9uYW1lZFtuYW1lXSA9IGlkXHJcblxyXG4gICAgICAgIGVycm9yc1tpZF0gPSBtZXNzYWdlXHJcblxyXG4gICAgICAgIGlmIHRyaWdnZXIgIT0gZmFsc2VcclxuICAgICAgICAgIF9lcnJvcnMudmFsdWVIYXNNdXRhdGVkKClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZShcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgICAgdGFyZ2V0XHJcbiAgICAgICAgKVxyXG5cclxuICAgICAgICBfcmVtb3ZlRXJyb3IobmFtZSwgdHJpZ2dlcilcclxuXHJcbiAgICAgIHJldHVybiBkaXNwb3NhYmxlXHJcblxyXG4gICAgIyBBIGxpc3Qgb2YgYWxsIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycyA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6ICgpIC0+XHJcbiAgICAgICAgbWVzc2FnZXMgPSBbXVxyXG5cclxuICAgICAgICBjb2xsZWN0TWVzc2FnZXMgPSAobWVzc2FnZSkgLT5cclxuICAgICAgICAgIGlmIG5vdCBtZXNzYWdlP1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSgpXHJcbiAgICAgICAgICAgIGNvbGxlY3RNZXNzYWdlcyhtZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGZvciBzdWJNZXNzYWdlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgICBjb2xsZWN0TWVzc2FnZXMoc3ViTWVzc2FnZSlcclxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ3N0cmluZycgb3IgdHlwZW9mIG1lc3NhZ2UgPT0gJ29iamVjdCdcclxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjb25zb2xlPy5hc3NlcnQ/KGZhbHNlLCAnaW52YWxpZCBlcnJvciBtZXNzYWdlJylcclxuXHJcbiAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgZm9yIG93biBpZCwgbWVzc2FnZSBvZiBfZXJyb3JzKClcclxuICAgICAgICAgIGNvbGxlY3RNZXNzYWdlcyhtZXNzYWdlKVxyXG5cclxuICAgICAgICByZXR1cm4gbWVzc2FnZXNcclxuXHJcbiAgICAgIHdyaXRlOiAobWVzc2FnZXMpIC0+XHJcbiAgICAgICAgdGFyZ2V0LmVycm9ycy5zZXQobWVzc2FnZXMpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9KVxyXG5cclxuICAgICMgQWRkIGFuIGluZGl2aWR1YWwgZXJyb3JcclxuICAgIHRhcmdldC5lcnJvcnMuYWRkID0gKG5hbWUsIG1lc3NhZ2UpIC0+XHJcbiAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxyXG4gICAgICAgIG1lc3NhZ2UgPSBuYW1lXHJcbiAgICAgICAgbmFtZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgcmV0dXJuIF9yZWdpc3RlckVycm9yKF9lcnJvcnMoKSwgbWVzc2FnZSwgbmFtZSwgdHJ1ZSlcclxuXHJcbiAgICAjIFNldCBhIHNpbmdsZSBlcnJvciwgY2xlYXJpbmcgb3RoZXIgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzLnNldCA9IChuYW1lLCBtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDFcclxuICAgICAgICBtZXNzYWdlID0gbmFtZVxyXG4gICAgICAgIG5hbWUgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGVycm9ycyA9IHt9XHJcbiAgICAgIF9uYW1lZCA9IHt9XHJcbiAgICAgIGRpc3Bvc2FibGUgPSBfcmVnaXN0ZXJFcnJvcihlcnJvcnMsIG1lc3NhZ2UsIG5hbWUsIGZhbHNlKVxyXG4gICAgICBfZXJyb3JzKGVycm9ycylcclxuICAgICAgcmV0dXJuIGRpc3Bvc2FibGVcclxuXHJcbiAgICAjIEdldCB0aGUgZmlyc3QgZXJyb3JcclxuICAgIHRhcmdldC5lcnJvcnMuZ2V0ID0gKG5hbWUpIC0+XHJcbiAgICAgIGZpcnN0TWVzc2FnZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgZmluZE1lc3NhZ2UgPSAobWVzc2FnZSkgLT5cclxuICAgICAgICBpZiBub3QgbWVzc2FnZT9cclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgaWYgZmluZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIEFycmF5LmlzQXJyYXkobWVzc2FnZSlcclxuICAgICAgICAgIGZvciBzdWJNZXNzYWdlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgaWYgZmluZE1lc3NhZ2Uoc3ViTWVzc2FnZSlcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ3N0cmluZycgb3IgdHlwZW9mIG1lc3NhZ2UgPT0gJ29iamVjdCdcclxuICAgICAgICAgIGZpcnN0TWVzc2FnZSA9IG1lc3NhZ2VcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgY29uc29sZT8uYXNzZXJ0PyhmYWxzZSwgJ2ludmFsaWQgZXJyb3IgbWVzc2FnZScpXHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgaWYgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZydcclxuICAgICAgICBpZiB7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF9uYW1lZCwgbmFtZSlcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKF9lcnJvcnMoKVtfbmFtZWRbbmFtZV1dKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RNZXNzYWdlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBmb3Igb3duIGlkLCBtZXNzYWdlIG9mIF9lcnJvcnMoKVxyXG4gICAgICAgICAgaWYgZmluZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0TWVzc2FnZVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICAgIHRhcmdldC5lcnJvcnMuaGFzID0gKG5hbWUpIC0+XHJcbiAgICAgIHJldHVybiB0YXJnZXQuZXJyb3JzLmdldChuYW1lKT9cclxuXHJcbiAgICB0YXJnZXQuZXJyb3JzLnJlbW92ZSA9IChuYW1lKSAtPlxyXG4gICAgICBpZiB0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgIF9yZW1vdmVFcnJvcihuYW1lKVxyXG5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBDbGVhciBhbGwgdGhlIGN1cnJlbnQgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzLmNsZWFyID0gKCkgLT5cclxuICAgICAgX25hbWVkID0ge31cclxuICAgICAgX2Vycm9ycyh7fSlcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBHZXQgdGhlIGZpcnN0IGVycm9yLCBvciBTZXQgYSBzaW5nbGUgZXJyb3Igd2hpbHN0IGNsZWFyaW5nIG90aGVyIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9yID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogdGFyZ2V0LmVycm9ycy5nZXRcclxuICAgICAgd3JpdGU6IHRhcmdldC5lcnJvcnMuc2V0XHJcbiAgICB9KVxyXG5cclxuICAgICMgUmV0dXJuIHRydWUgaWZmIHRoZXJlIGFyZSBhbnkgZXJyb3JzXHJcbiAgICB0YXJnZXQuaGFzRXJyb3IgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiB0YXJnZXQuZXJyb3JzLmhhc1xyXG4gICAgfSlcclxuXHJcbiAgICAjIFJlbW92ZSBmYWxsaWJsZSBkYXRhIGZyb20gdGhlIHRhcmdldCBvYmplY3RcclxuICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlID0gKCkgLT5cclxuICAgICAgX2Vycm9ycyh7fSlcclxuICAgICAgZGVsZXRlIHRhcmdldC5lcnJvclxyXG4gICAgICBkZWxldGUgdGFyZ2V0LmVycm9yc1xyXG4gICAgICBkZWxldGUgdGFyZ2V0Lmhhc0Vycm9yXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICMgRGV0ZXJtaW5lIGlmIGl0ZW0gaXMgZmFsbGlibGVcclxuICBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZSA9ICh0YXJnZXQpIC0+XHJcbiAgICByZXR1cm4gdGFyZ2V0LmVycm9ycz8gYW5kIHRhcmdldC5lcnJvcj9cclxuXHJcbiAgZ2V0RGVwZW5kZW5jaWVzID0gZG8gLT5cclxuICAgIHN5bVN0YXRlID0gZG8gLT5cclxuICAgICAgYyA9IGtvLmNvbXB1dGVkKCgpIC0+IHJldHVybilcclxuICAgICAgaWYgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scz9cclxuICAgICAgICBmb3Igc3ltYm9sIGluIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoYylcclxuICAgICAgICAgIGlmIFN0cmluZyhzeW1ib2wpID09ICdTeW1ib2woX3N0YXRlKSdcclxuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbFxyXG5cclxuICAgICAgaWYge30uaGFzT3duUHJvcGVydHkuY2FsbChjLCAnX3N0YXRlJylcclxuICAgICAgICByZXR1cm4gJ19zdGF0ZSdcclxuXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGRlcEtleSA9IGRvIC0+XHJcbiAgICAgIG8gPSBrby5vYnNlcnZhYmxlKClcclxuICAgICAgYyA9IGtvLmNvbXB1dGVkKHtcclxuICAgICAgICByZWFkOiAoKSAtPiBvKClcclxuICAgICAgfSlcclxuICAgICAgZm9yIG93biBrZXksIHZhbCBvZiBjW3N5bVN0YXRlXVxyXG4gICAgICAgIGlmIHZhbD8gYW5kIHR5cGVvZiB2YWwgPT0gJ29iamVjdCdcclxuICAgICAgICAgIHJldHVybiBrZXlcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuICh0YXJnZXQpIC0+XHJcbiAgICAgIGlmIGtvLmlzQ29tcHV0ZWQodGFyZ2V0KVxyXG4gICAgICAgIHJldHVybiB0YXJnZXRbc3ltU3RhdGVdW2RlcEtleV1cclxuICAgICAgZWxzZVxyXG4gICAgICAgIHJldHVybiB7fVxyXG5cclxuICBrby5leHRlbmRlcnMuZmFsbGlibGVSZWFkID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgIGlmIG5vdCBrby5pc0NvbXB1dGVkKHRhcmdldClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgIHRhcmdldC5leHRlbmQoeyBmYWxsaWJsZTogdHJ1ZSB9KVxyXG5cclxuICAgIGlmIG9wdGlvbnMgPT0gZmFsc2VcclxuICAgICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVSZWFkPygpXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGZpbmRJbm5lciA9IChvdXRwdXQsIGNvbXB1dGVkKSAtPlxyXG4gICAgICBmb3Igb3duIGtleSwgZGVwZW5kZW5jeSBvZiBnZXREZXBlbmRlbmNpZXMoY29tcHV0ZWQpXHJcbiAgICAgICAgZGVwZW5kZW5jeSA9IGRlcGVuZGVuY3kuX3RhcmdldFxyXG4gICAgICAgIGlmIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlKGRlcGVuZGVuY3kpXHJcbiAgICAgICAgICBpZiBvdXRwdXQuaW5kZXhPZihkZXBlbmRlbmN5LmVycm9ycykgPT0gLTFcclxuICAgICAgICAgICAgb3V0cHV0LnB1c2goZGVwZW5kZW5jeS5lcnJvcnMpXHJcblxyXG4gICAgICAgIGlmIGtvLmlzQ29tcHV0ZWQoZGVwZW5kZW5jeSlcclxuICAgICAgICAgIGZpbmRJbm5lcihvdXRwdXQsIGRlcGVuZGVuY3kpXHJcblxyXG4gICAgICByZXR1cm4gb3V0cHV0XHJcblxyXG4gICAgZXJyb3JzID0gKCkgLT5cclxuICAgICAgdHJ5XHJcbiAgICAgICAgI3N1YnNjcmlwdGlvbiA9IHRhcmdldC5zdWJzY3JpYmUoKCkgLT4gcmV0dXJuKVxyXG4gICAgICAgICN0YXJnZXQoKVxyXG4gICAgICAgIHJldHVybiBmaW5kSW5uZXIoW10sIHRhcmdldClcclxuICAgICAgZmluYWxseVxyXG4gICAgICAgICNzdWJzY3JpcHRpb24uZGlzcG9zZSgpXHJcblxyXG4gICAgZGlzcG9zYWJsZSA9IHRhcmdldC5lcnJvcnMuYWRkKGVycm9ycylcclxuXHJcbiAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZVJlYWQgPSAoKSAtPlxyXG4gICAgICBpZiBkaXNwb3NhYmxlP1xyXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXHJcbiAgICAgICAgZGlzcG9zYWJsZSA9IHVuZGVmaW5lZFxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG5cclxuICByZXR1cm4ga29cclxuXHJcbmFwcGx5S292KGtvKVxyXG4iXX0=
