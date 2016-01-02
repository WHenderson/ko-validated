;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['knockout'], factory);
  } else {
    root.ko = factory(root.ko);
  }
}(this, function (ko) {
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

return ko;
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRlZC5hcHBsaWVkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O09BQUEsSUFBQSxRQUFBO0VBQUE7O0FBQUEsUUFBQSxHQUFXLFNBQUMsRUFBRDtBQUNULE1BQUE7RUFBQSxFQUFFLENBQUMsU0FBSCxHQUFlO0VBR1Q7SUFDUyxvQkFBQyxLQUFELEVBQVEsUUFBUixFQUFrQixPQUFsQixFQUEyQixPQUEzQixFQUFvQyxVQUFwQztNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFVBQUQ7TUFBVSxJQUFDLENBQUEsU0FBRDtNQUM3QixJQUFHLGVBQUg7UUFDRSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBRGI7O01BRUEsSUFBRyxrQkFBSDtRQUNFLElBQUMsQ0FBQSxVQUFELEdBQWMsV0FEaEI7O0lBSFc7O3lCQU1iLE9BQUEsR0FBUyxTQUFBLEdBQUE7O3lCQUdULFVBQUEsR0FBWSxTQUFBO0FBQ1YsYUFBTztJQURHOzs7OztFQUdkLFVBQUEsR0FBYTtFQUNiLFdBQUEsR0FBYyxTQUFBO1dBQ1osRUFBRTtFQURVO0VBR2QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFiLEdBQXdCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFFdEIsUUFBQTtJQUFBLElBQUcsT0FBQSxLQUFXLEtBQWQ7O1FBQ0UsTUFBTSxDQUFDOztBQUNQLGFBQU8sT0FGVDs7SUFLQSxJQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQXRCLENBQWlDLE1BQWpDLENBQUg7QUFDRSxhQUFPLE9BRFQ7O0lBSUEsT0FBQSxHQUFVLEVBQUUsQ0FBQyxVQUFILENBQWMsRUFBZDtJQUNWLE1BQUEsR0FBUztJQUdULFdBQUEsR0FBZSxFQUFHLENBQUM7SUFHbkIsWUFBQSxHQUFlLFNBQUMsRUFBRCxFQUFLLE9BQUw7QUFDYixVQUFBO01BQUEsSUFBRyxPQUFPLEVBQVAsS0FBYSxRQUFoQjtRQUNFLElBQUcsRUFBRSxDQUFDLGNBQUgsQ0FB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c1NYLFFBQUEsQ0FBUyxFQUFUIiwiZmlsZSI6ImtvLXZhbGlkYXRlZC5hcHBsaWVkLndlYi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImFwcGx5S292ID0gKGtvKSAtPlxyXG4gIGtvLnZhbGlkYXRlZCA9IHt9XHJcblxyXG5cclxuICBjbGFzcyBEaXNwb3NhYmxlXHJcbiAgICBjb25zdHJ1Y3RvcjogKEBuYW1lLCBAbWVzc2FnZSwgQHRhcmdldCwgZGlzcG9zZSwgaXNEaXNwb3NlZCkgLT5cclxuICAgICAgaWYgZGlzcG9zZT9cclxuICAgICAgICBAZGlzcG9zZSA9IGRpc3Bvc2VcclxuICAgICAgaWYgaXNEaXNwb3NlZD9cclxuICAgICAgICBAaXNEaXNwb3NlZCA9IGlzRGlzcG9zZWRcclxuXHJcbiAgICBkaXNwb3NlOiAoKSAtPlxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBpc0Rpc3Bvc2VkOiAoKSAtPlxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBfaWRDb3VudGVyID0gMFxyXG4gIGdldFVuaXF1ZUlkID0gKCkgLT5cclxuICAgICsrX2lkQ291bnRlclxyXG5cclxuICBrby5leHRlbmRlcnMuZmFsbGlibGUgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgIyBEaXNwb3NlP1xyXG4gICAgaWYgb3B0aW9ucyA9PSBmYWxzZVxyXG4gICAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZT8oKVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgIyBBbHJlYWR5IGNvbnN0cnVjdGVkXHJcbiAgICBpZiBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZSh0YXJnZXQpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICAjIGNvbnRhaW5zIHRoZSBlcnJvcnMgZm9yIHRhcmdldFxyXG4gICAgX2Vycm9ycyA9IGtvLm9ic2VydmFibGUoe30pXHJcbiAgICBfbmFtZWQgPSB7fVxyXG5cclxuICAgICMgaGVscGVyIGZvciBjYWxsaW5nIGhhc093blByb3BlcnR5XHJcbiAgICBfaGFzT3duUHJvcCA9ICh7fSkuaGFzT3duUHJvcGVydHlcclxuXHJcbiAgICAjIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBlcnJvciwgaWYgaXQgZXhpc3RzXHJcbiAgICBfcmVtb3ZlRXJyb3IgPSAoaWQsIHRyaWdnZXIpIC0+XHJcbiAgICAgIGlmIHR5cGVvZiBpZCA9PSAnc3RyaW5nJ1xyXG4gICAgICAgIGlmIHt9Lmhhc093blByb3BlcnR5KF9uYW1lZCwgaWQpXHJcbiAgICAgICAgICBuYW1lID0gaWRcclxuICAgICAgICAgIGlkID0gX25hbWVkW2lkXVxyXG4gICAgICAgICAgZGVsZXRlIF9uYW1lZFtuYW1lXVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGlkID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICBpZiBpZD9cclxuICAgICAgICBlcnJvcnMgPSBfZXJyb3JzKClcclxuXHJcbiAgICAgICAgaWYgX2hhc093blByb3AuY2FsbChlcnJvcnMsIGlkKVxyXG4gICAgICAgICAgZGVsZXRlIGVycm9yc1tpZF1cclxuXHJcbiAgICAgICAgICBpZiB0cmlnZ2VyICE9IGZhbHNlXHJcbiAgICAgICAgICAgIF9lcnJvcnMudmFsdWVIYXNNdXRhdGVkKClcclxuXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgUmV0dXJucyB0cnVlIGlmZiB0aGUgc3BlY2lmaWVkIGVycm9yIGV4aXN0c1xyXG4gICAgX2Vycm9yRXhpc3RzID0gKGlkKSAtPlxyXG4gICAgICBfaGFzT3duUHJvcC5jYWxsKF9lcnJvcnMoKSwgaWQpXHJcblxyXG4gICAgX3JlZ2lzdGVyRXJyb3IgPSAoZXJyb3JzLCBtZXNzYWdlLCBuYW1lLCB0cmlnZ2VyKSAtPlxyXG4gICAgICBpZiBtZXNzYWdlP1xyXG4gICAgICAgIGlkID0gZ2V0VW5pcXVlSWQoKVxyXG5cclxuICAgICAgICBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoXHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgbWVzc2FnZVxyXG4gICAgICAgICAgdGFyZ2V0XHJcbiAgICAgICAgICAoKSAtPiBfcmVtb3ZlRXJyb3IobmFtZSA/IGlkKVxyXG4gICAgICAgICAgKCkgLT4gbm90IF9lcnJvckV4aXN0cyhpZClcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIGlmIHR5cGVvZiBuYW1lID09ICdzdHJpbmcnXHJcbiAgICAgICAgICBpZiB7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF9uYW1lZCwgbmFtZSlcclxuICAgICAgICAgICAgX3JlbW92ZUVycm9yKF9uYW1lZFtuYW1lXSwgZmFsc2UpXHJcblxyXG4gICAgICAgICAgX25hbWVkW25hbWVdID0gaWRcclxuXHJcbiAgICAgICAgZXJyb3JzW2lkXSA9IG1lc3NhZ2VcclxuXHJcbiAgICAgICAgaWYgdHJpZ2dlciAhPSBmYWxzZVxyXG4gICAgICAgICAgX2Vycm9ycy52YWx1ZUhhc011dGF0ZWQoKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlKFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIG1lc3NhZ2UsXHJcbiAgICAgICAgICB0YXJnZXRcclxuICAgICAgICApXHJcblxyXG4gICAgICAgIF9yZW1vdmVFcnJvcihuYW1lLCB0cmlnZ2VyKVxyXG5cclxuICAgICAgcmV0dXJuIGRpc3Bvc2FibGVcclxuXHJcbiAgICAjIEEgbGlzdCBvZiBhbGwgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogKCkgLT5cclxuICAgICAgICBtZXNzYWdlcyA9IFtdXHJcblxyXG4gICAgICAgIGNvbGxlY3RNZXNzYWdlcyA9IChtZXNzYWdlKSAtPlxyXG4gICAgICAgICAgaWYgbm90IG1lc3NhZ2U/XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnZnVuY3Rpb24nXHJcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlKClcclxuICAgICAgICAgICAgY29sbGVjdE1lc3NhZ2VzKG1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlIGlmIEFycmF5LmlzQXJyYXkobWVzc2FnZSlcclxuICAgICAgICAgICAgZm9yIHN1Yk1lc3NhZ2UgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICAgIGNvbGxlY3RNZXNzYWdlcyhzdWJNZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnc3RyaW5nJyBvciB0eXBlb2YgbWVzc2FnZSA9PSAnb2JqZWN0J1xyXG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGU/LmFzc2VydD8oZmFsc2UsICdpbnZhbGlkIGVycm9yIG1lc3NhZ2UnKVxyXG5cclxuICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICBmb3Igb3duIGlkLCBtZXNzYWdlIG9mIF9lcnJvcnMoKVxyXG4gICAgICAgICAgY29sbGVjdE1lc3NhZ2VzKG1lc3NhZ2UpXHJcblxyXG4gICAgICAgIHJldHVybiBtZXNzYWdlc1xyXG5cclxuICAgICAgd3JpdGU6IChtZXNzYWdlcykgLT5cclxuICAgICAgICB0YXJnZXQuZXJyb3JzLnNldChtZXNzYWdlcylcclxuICAgICAgICByZXR1cm5cclxuICAgIH0pXHJcblxyXG4gICAgIyBBZGQgYW4gaW5kaXZpZHVhbCBlcnJvclxyXG4gICAgdGFyZ2V0LmVycm9ycy5hZGQgPSAobmFtZSwgbWVzc2FnZSkgLT5cclxuICAgICAgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgbWVzc2FnZSA9IG5hbWVcclxuICAgICAgICBuYW1lID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICByZXR1cm4gX3JlZ2lzdGVyRXJyb3IoX2Vycm9ycygpLCBtZXNzYWdlLCBuYW1lLCB0cnVlKVxyXG5cclxuICAgICMgU2V0IGEgc2luZ2xlIGVycm9yLCBjbGVhcmluZyBvdGhlciBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMuc2V0ID0gKG5hbWUsIG1lc3NhZ2UpIC0+XHJcbiAgICAgIGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gMVxyXG4gICAgICAgIG1lc3NhZ2UgPSBuYW1lXHJcbiAgICAgICAgbmFtZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgZXJyb3JzID0ge31cclxuICAgICAgX25hbWVkID0ge31cclxuICAgICAgZGlzcG9zYWJsZSA9IF9yZWdpc3RlckVycm9yKGVycm9ycywgbWVzc2FnZSwgbmFtZSwgZmFsc2UpXHJcbiAgICAgIF9lcnJvcnMoZXJyb3JzKVxyXG4gICAgICByZXR1cm4gZGlzcG9zYWJsZVxyXG5cclxuICAgICMgR2V0IHRoZSBmaXJzdCBlcnJvclxyXG4gICAgdGFyZ2V0LmVycm9ycy5nZXQgPSAobmFtZSkgLT5cclxuICAgICAgZmlyc3RNZXNzYWdlID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICBmaW5kTWVzc2FnZSA9IChtZXNzYWdlKSAtPlxyXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlP1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnZnVuY3Rpb24nXHJcbiAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSgpXHJcbiAgICAgICAgICBpZiBmaW5kTWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheShtZXNzYWdlKVxyXG4gICAgICAgICAgZm9yIHN1Yk1lc3NhZ2UgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICBpZiBmaW5kTWVzc2FnZShzdWJNZXNzYWdlKVxyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnc3RyaW5nJyBvciB0eXBlb2YgbWVzc2FnZSA9PSAnb2JqZWN0J1xyXG4gICAgICAgICAgZmlyc3RNZXNzYWdlID0gbWVzc2FnZVxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBjb25zb2xlPy5hc3NlcnQ/KGZhbHNlLCAnaW52YWxpZCBlcnJvciBtZXNzYWdlJylcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICBpZiB0eXBlb2YgbmFtZSA9PSAnc3RyaW5nJ1xyXG4gICAgICAgIGlmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoX25hbWVkLCBuYW1lKVxyXG4gICAgICAgICAgaWYgZmluZE1lc3NhZ2UoX2Vycm9ycygpW19uYW1lZFtuYW1lXV0pXHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdE1lc3NhZ2VcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGZvciBvd24gaWQsIG1lc3NhZ2Ugb2YgX2Vycm9ycygpXHJcbiAgICAgICAgICBpZiBmaW5kTWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3RNZXNzYWdlXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gICAgdGFyZ2V0LmVycm9ycy5oYXMgPSAobmFtZSkgLT5cclxuICAgICAgcmV0dXJuIHRhcmdldC5lcnJvcnMuZ2V0KG5hbWUpP1xyXG5cclxuICAgIHRhcmdldC5lcnJvcnMucmVtb3ZlID0gKG5hbWUpIC0+XHJcbiAgICAgIGlmIHR5cGVvZiBuYW1lID09ICdzdHJpbmcnXHJcbiAgICAgICAgX3JlbW92ZUVycm9yKG5hbWUpXHJcblxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAjIENsZWFyIGFsbCB0aGUgY3VycmVudCBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMuY2xlYXIgPSAoKSAtPlxyXG4gICAgICBfbmFtZWQgPSB7fVxyXG4gICAgICBfZXJyb3JzKHt9KVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAjIEdldCB0aGUgZmlyc3QgZXJyb3IsIG9yIFNldCBhIHNpbmdsZSBlcnJvciB3aGlsc3QgY2xlYXJpbmcgb3RoZXIgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3IgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiB0YXJnZXQuZXJyb3JzLmdldFxyXG4gICAgICB3cml0ZTogdGFyZ2V0LmVycm9ycy5zZXRcclxuICAgIH0pXHJcblxyXG4gICAgIyBSZXR1cm4gdHJ1ZSBpZmYgdGhlcmUgYXJlIGFueSBlcnJvcnNcclxuICAgIHRhcmdldC5oYXNFcnJvciA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6IHRhcmdldC5lcnJvcnMuaGFzXHJcbiAgICB9KVxyXG5cclxuICAgICMgUmVtb3ZlIGZhbGxpYmxlIGRhdGEgZnJvbSB0aGUgdGFyZ2V0IG9iamVjdFxyXG4gICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGUgPSAoKSAtPlxyXG4gICAgICBfZXJyb3JzKHt9KVxyXG4gICAgICBkZWxldGUgdGFyZ2V0LmVycm9yXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuZXJyb3JzXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuaGFzRXJyb3JcclxuICAgICAgZGVsZXRlIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgIyBEZXRlcm1pbmUgaWYgaXRlbSBpcyBmYWxsaWJsZVxyXG4gIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlID0gKHRhcmdldCkgLT5cclxuICAgIHJldHVybiB0YXJnZXQuZXJyb3JzPyBhbmQgdGFyZ2V0LmVycm9yP1xyXG5cclxuICBnZXREZXBlbmRlbmNpZXMgPSBkbyAtPlxyXG4gICAgc3ltU3RhdGUgPSBkbyAtPlxyXG4gICAgICBjID0ga28uY29tcHV0ZWQoKCkgLT4gcmV0dXJuKVxyXG4gICAgICBpZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzP1xyXG4gICAgICAgIGZvciBzeW1ib2wgaW4gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhjKVxyXG4gICAgICAgICAgaWYgU3RyaW5nKHN5bWJvbCkgPT0gJ1N5bWJvbChfc3RhdGUpJ1xyXG4gICAgICAgICAgICByZXR1cm4gc3ltYm9sXHJcblxyXG4gICAgICBpZiB7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGMsICdfc3RhdGUnKVxyXG4gICAgICAgIHJldHVybiAnX3N0YXRlJ1xyXG5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgZGVwS2V5ID0gZG8gLT5cclxuICAgICAgbyA9IGtvLm9ic2VydmFibGUoKVxyXG4gICAgICBjID0ga28uY29tcHV0ZWQoe1xyXG4gICAgICAgIHJlYWQ6ICgpIC0+IG8oKVxyXG4gICAgICB9KVxyXG4gICAgICBmb3Igb3duIGtleSwgdmFsIG9mIGNbc3ltU3RhdGVdXHJcbiAgICAgICAgaWYgdmFsPyBhbmQgdHlwZW9mIHZhbCA9PSAnb2JqZWN0J1xyXG4gICAgICAgICAgcmV0dXJuIGtleVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gKHRhcmdldCkgLT5cclxuICAgICAgaWYga28uaXNDb21wdXRlZCh0YXJnZXQpXHJcbiAgICAgICAgcmV0dXJuIHRhcmdldFtzeW1TdGF0ZV1bZGVwS2V5XVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIHt9XHJcblxyXG4gIGtvLmV4dGVuZGVycy5mYWxsaWJsZVJlYWQgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgaWYgbm90IGtvLmlzQ29tcHV0ZWQodGFyZ2V0KVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgdGFyZ2V0LmV4dGVuZCh7IGZhbGxpYmxlOiB0cnVlIH0pXHJcblxyXG4gICAgaWYgb3B0aW9ucyA9PSBmYWxzZVxyXG4gICAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZVJlYWQ/KClcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgZmluZElubmVyID0gKG91dHB1dCwgY29tcHV0ZWQpIC0+XHJcbiAgICAgIGZvciBvd24ga2V5LCBkZXBlbmRlbmN5IG9mIGdldERlcGVuZGVuY2llcyhjb21wdXRlZClcclxuICAgICAgICBkZXBlbmRlbmN5ID0gZGVwZW5kZW5jeS5fdGFyZ2V0XHJcbiAgICAgICAgaWYga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUoZGVwZW5kZW5jeSlcclxuICAgICAgICAgIGlmIG91dHB1dC5pbmRleE9mKGRlcGVuZGVuY3kuZXJyb3JzKSA9PSAtMVxyXG4gICAgICAgICAgICBvdXRwdXQucHVzaChkZXBlbmRlbmN5LmVycm9ycylcclxuXHJcbiAgICAgICAgaWYga28uaXNDb21wdXRlZChkZXBlbmRlbmN5KVxyXG4gICAgICAgICAgZmluZElubmVyKG91dHB1dCwgZGVwZW5kZW5jeSlcclxuXHJcbiAgICAgIHJldHVybiBvdXRwdXRcclxuXHJcbiAgICBlcnJvcnMgPSAoKSAtPlxyXG4gICAgICB0cnlcclxuICAgICAgICAjc3Vic2NyaXB0aW9uID0gdGFyZ2V0LnN1YnNjcmliZSgoKSAtPiByZXR1cm4pXHJcbiAgICAgICAgI3RhcmdldCgpXHJcbiAgICAgICAgcmV0dXJuIGZpbmRJbm5lcihbXSwgdGFyZ2V0KVxyXG4gICAgICBmaW5hbGx5XHJcbiAgICAgICAgI3N1YnNjcmlwdGlvbi5kaXNwb3NlKClcclxuXHJcbiAgICBkaXNwb3NhYmxlID0gdGFyZ2V0LmVycm9ycy5hZGQoZXJyb3JzKVxyXG5cclxuICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlUmVhZCA9ICgpIC0+XHJcbiAgICAgIGlmIGRpc3Bvc2FibGU/XHJcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcclxuICAgICAgICBkaXNwb3NhYmxlID0gdW5kZWZpbmVkXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJldHVybiB0YXJnZXRcclxuXHJcblxyXG4gIHJldHVybiBrb1xyXG5cclxuYXBwbHlLb3Yoa28pXHJcbiJdfQ==
