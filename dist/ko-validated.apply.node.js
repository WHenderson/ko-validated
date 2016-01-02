(function (){
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

module.exports = applyKov;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRlZC5hcHBseS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtDQUFBLElBQUEsUUFBQTtFQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLEVBQUQ7QUFDVCxNQUFBO0VBQUEsRUFBRSxDQUFDLFNBQUgsR0FBZTtFQUdUO0lBQ1Msb0JBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsT0FBbEIsRUFBMkIsT0FBM0IsRUFBb0MsVUFBcEM7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxVQUFEO01BQVUsSUFBQyxDQUFBLFNBQUQ7TUFDN0IsSUFBRyxlQUFIO1FBQ0UsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQURiOztNQUVBLElBQUcsa0JBQUg7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjLFdBRGhCOztJQUhXOzt5QkFNYixPQUFBLEdBQVMsU0FBQSxHQUFBOzt5QkFHVCxVQUFBLEdBQVksU0FBQTtBQUNWLGFBQU87SUFERzs7Ozs7RUFHZCxVQUFBLEdBQWE7RUFDYixXQUFBLEdBQWMsU0FBQTtXQUNaLEVBQUU7RUFEVTtFQUdkLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBYixHQUF3QixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBRXRCLFFBQUE7SUFBQSxJQUFHLE9BQUEsS0FBVyxLQUFkOztRQUNFLE1BQU0sQ0FBQzs7QUFDUCxhQUFPLE9BRlQ7O0lBS0EsSUFBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUF0QixDQUFpQyxNQUFqQyxDQUFIO0FBQ0UsYUFBTyxPQURUOztJQUlBLE9BQUEsR0FBVSxFQUFFLENBQUMsVUFBSCxDQUFjLEVBQWQ7SUFDVixNQUFBLEdBQVM7SUFHVCxXQUFBLEdBQWUsRUFBRyxDQUFDO0lBR25CLFlBQUEsR0FBZSxTQUFDLEVBQUQsRUFBSyxPQUFMO0FBQ2IsVUFBQTtNQUFBLElBQUcsT0FBTyxFQUFQLEtBQWEsUUFBaEI7UUFDRSxJQUFHLEVBQUUsQ0FBQyxjQUFILENBQWtCLE1BQWxC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LXZhbGlkYXRlZC5hcHBseS5ub2RlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiYXBwbHlLb3YgPSAoa28pIC0+XHJcbiAga28udmFsaWRhdGVkID0ge31cclxuXHJcblxyXG4gIGNsYXNzIERpc3Bvc2FibGVcclxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBtZXNzYWdlLCBAdGFyZ2V0LCBkaXNwb3NlLCBpc0Rpc3Bvc2VkKSAtPlxyXG4gICAgICBpZiBkaXNwb3NlP1xyXG4gICAgICAgIEBkaXNwb3NlID0gZGlzcG9zZVxyXG4gICAgICBpZiBpc0Rpc3Bvc2VkP1xyXG4gICAgICAgIEBpc0Rpc3Bvc2VkID0gaXNEaXNwb3NlZFxyXG5cclxuICAgIGRpc3Bvc2U6ICgpIC0+XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGlzRGlzcG9zZWQ6ICgpIC0+XHJcbiAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gIF9pZENvdW50ZXIgPSAwXHJcbiAgZ2V0VW5pcXVlSWQgPSAoKSAtPlxyXG4gICAgKytfaWRDb3VudGVyXHJcblxyXG4gIGtvLmV4dGVuZGVycy5mYWxsaWJsZSA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICAjIERpc3Bvc2U/XHJcbiAgICBpZiBvcHRpb25zID09IGZhbHNlXHJcbiAgICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlPygpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICAjIEFscmVhZHkgY29uc3RydWN0ZWRcclxuICAgIGlmIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlKHRhcmdldClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgY29udGFpbnMgdGhlIGVycm9ycyBmb3IgdGFyZ2V0XHJcbiAgICBfZXJyb3JzID0ga28ub2JzZXJ2YWJsZSh7fSlcclxuICAgIF9uYW1lZCA9IHt9XHJcblxyXG4gICAgIyBoZWxwZXIgZm9yIGNhbGxpbmcgaGFzT3duUHJvcGVydHlcclxuICAgIF9oYXNPd25Qcm9wID0gKHt9KS5oYXNPd25Qcm9wZXJ0eVxyXG5cclxuICAgICMgUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGVycm9yLCBpZiBpdCBleGlzdHNcclxuICAgIF9yZW1vdmVFcnJvciA9IChpZCwgdHJpZ2dlcikgLT5cclxuICAgICAgaWYgdHlwZW9mIGlkID09ICdzdHJpbmcnXHJcbiAgICAgICAgaWYge30uaGFzT3duUHJvcGVydHkoX25hbWVkLCBpZClcclxuICAgICAgICAgIG5hbWUgPSBpZFxyXG4gICAgICAgICAgaWQgPSBfbmFtZWRbaWRdXHJcbiAgICAgICAgICBkZWxldGUgX25hbWVkW25hbWVdXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgaWQgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGlmIGlkP1xyXG4gICAgICAgIGVycm9ycyA9IF9lcnJvcnMoKVxyXG5cclxuICAgICAgICBpZiBfaGFzT3duUHJvcC5jYWxsKGVycm9ycywgaWQpXHJcbiAgICAgICAgICBkZWxldGUgZXJyb3JzW2lkXVxyXG5cclxuICAgICAgICAgIGlmIHRyaWdnZXIgIT0gZmFsc2VcclxuICAgICAgICAgICAgX2Vycm9ycy52YWx1ZUhhc011dGF0ZWQoKVxyXG5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBSZXR1cm5zIHRydWUgaWZmIHRoZSBzcGVjaWZpZWQgZXJyb3IgZXhpc3RzXHJcbiAgICBfZXJyb3JFeGlzdHMgPSAoaWQpIC0+XHJcbiAgICAgIF9oYXNPd25Qcm9wLmNhbGwoX2Vycm9ycygpLCBpZClcclxuXHJcbiAgICBfcmVnaXN0ZXJFcnJvciA9IChlcnJvcnMsIG1lc3NhZ2UsIG5hbWUsIHRyaWdnZXIpIC0+XHJcbiAgICAgIGlmIG1lc3NhZ2U/XHJcbiAgICAgICAgaWQgPSBnZXRVbmlxdWVJZCgpXHJcblxyXG4gICAgICAgIGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZShcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBtZXNzYWdlXHJcbiAgICAgICAgICB0YXJnZXRcclxuICAgICAgICAgICgpIC0+IF9yZW1vdmVFcnJvcihuYW1lID8gaWQpXHJcbiAgICAgICAgICAoKSAtPiBub3QgX2Vycm9yRXhpc3RzKGlkKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgaWYgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZydcclxuICAgICAgICAgIGlmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoX25hbWVkLCBuYW1lKVxyXG4gICAgICAgICAgICBfcmVtb3ZlRXJyb3IoX25hbWVkW25hbWVdLCBmYWxzZSlcclxuXHJcbiAgICAgICAgICBfbmFtZWRbbmFtZV0gPSBpZFxyXG5cclxuICAgICAgICBlcnJvcnNbaWRdID0gbWVzc2FnZVxyXG5cclxuICAgICAgICBpZiB0cmlnZ2VyICE9IGZhbHNlXHJcbiAgICAgICAgICBfZXJyb3JzLnZhbHVlSGFzTXV0YXRlZCgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoXHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgbWVzc2FnZSxcclxuICAgICAgICAgIHRhcmdldFxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgX3JlbW92ZUVycm9yKG5hbWUsIHRyaWdnZXIpXHJcblxyXG4gICAgICByZXR1cm4gZGlzcG9zYWJsZVxyXG5cclxuICAgICMgQSBsaXN0IG9mIGFsbCBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiAoKSAtPlxyXG4gICAgICAgIG1lc3NhZ2VzID0gW11cclxuXHJcbiAgICAgICAgY29sbGVjdE1lc3NhZ2VzID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgICBpZiBub3QgbWVzc2FnZT9cclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgICBjb2xsZWN0TWVzc2FnZXMobWVzc2FnZSlcclxuICAgICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheShtZXNzYWdlKVxyXG4gICAgICAgICAgICBmb3Igc3ViTWVzc2FnZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgY29sbGVjdE1lc3NhZ2VzKHN1Yk1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnIG9yIHR5cGVvZiBtZXNzYWdlID09ICdvYmplY3QnXHJcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29uc29sZT8uYXNzZXJ0PyhmYWxzZSwgJ2ludmFsaWQgZXJyb3IgbWVzc2FnZScpXHJcblxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgIGZvciBvd24gaWQsIG1lc3NhZ2Ugb2YgX2Vycm9ycygpXHJcbiAgICAgICAgICBjb2xsZWN0TWVzc2FnZXMobWVzc2FnZSlcclxuXHJcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzXHJcblxyXG4gICAgICB3cml0ZTogKG1lc3NhZ2VzKSAtPlxyXG4gICAgICAgIHRhcmdldC5lcnJvcnMuc2V0KG1lc3NhZ2VzKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfSlcclxuXHJcbiAgICAjIEFkZCBhbiBpbmRpdmlkdWFsIGVycm9yXHJcbiAgICB0YXJnZXQuZXJyb3JzLmFkZCA9IChuYW1lLCBtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDFcclxuICAgICAgICBtZXNzYWdlID0gbmFtZVxyXG4gICAgICAgIG5hbWUgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIHJldHVybiBfcmVnaXN0ZXJFcnJvcihfZXJyb3JzKCksIG1lc3NhZ2UsIG5hbWUsIHRydWUpXHJcblxyXG4gICAgIyBTZXQgYSBzaW5nbGUgZXJyb3IsIGNsZWFyaW5nIG90aGVyIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycy5zZXQgPSAobmFtZSwgbWVzc2FnZSkgLT5cclxuICAgICAgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgbWVzc2FnZSA9IG5hbWVcclxuICAgICAgICBuYW1lID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICBlcnJvcnMgPSB7fVxyXG4gICAgICBfbmFtZWQgPSB7fVxyXG4gICAgICBkaXNwb3NhYmxlID0gX3JlZ2lzdGVyRXJyb3IoZXJyb3JzLCBtZXNzYWdlLCBuYW1lLCBmYWxzZSlcclxuICAgICAgX2Vycm9ycyhlcnJvcnMpXHJcbiAgICAgIHJldHVybiBkaXNwb3NhYmxlXHJcblxyXG4gICAgIyBHZXQgdGhlIGZpcnN0IGVycm9yXHJcbiAgICB0YXJnZXQuZXJyb3JzLmdldCA9IChuYW1lKSAtPlxyXG4gICAgICBmaXJzdE1lc3NhZ2UgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGZpbmRNZXNzYWdlID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgaWYgbm90IG1lc3NhZ2U/XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlKClcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KG1lc3NhZ2UpXHJcbiAgICAgICAgICBmb3Igc3ViTWVzc2FnZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKHN1Yk1lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnIG9yIHR5cGVvZiBtZXNzYWdlID09ICdvYmplY3QnXHJcbiAgICAgICAgICBmaXJzdE1lc3NhZ2UgPSBtZXNzYWdlXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvbnNvbGU/LmFzc2VydD8oZmFsc2UsICdpbnZhbGlkIGVycm9yIG1lc3NhZ2UnKVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgIGlmIHR5cGVvZiBuYW1lID09ICdzdHJpbmcnXHJcbiAgICAgICAgaWYge30uaGFzT3duUHJvcGVydHkuY2FsbChfbmFtZWQsIG5hbWUpXHJcbiAgICAgICAgICBpZiBmaW5kTWVzc2FnZShfZXJyb3JzKClbX25hbWVkW25hbWVdXSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0TWVzc2FnZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIG93biBpZCwgbWVzc2FnZSBvZiBfZXJyb3JzKClcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdE1lc3NhZ2VcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgICB0YXJnZXQuZXJyb3JzLmhhcyA9IChuYW1lKSAtPlxyXG4gICAgICByZXR1cm4gdGFyZ2V0LmVycm9ycy5nZXQobmFtZSk/XHJcblxyXG4gICAgdGFyZ2V0LmVycm9ycy5yZW1vdmUgPSAobmFtZSkgLT5cclxuICAgICAgaWYgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZydcclxuICAgICAgICBfcmVtb3ZlRXJyb3IobmFtZSlcclxuXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgQ2xlYXIgYWxsIHRoZSBjdXJyZW50IGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycy5jbGVhciA9ICgpIC0+XHJcbiAgICAgIF9uYW1lZCA9IHt9XHJcbiAgICAgIF9lcnJvcnMoe30pXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgR2V0IHRoZSBmaXJzdCBlcnJvciwgb3IgU2V0IGEgc2luZ2xlIGVycm9yIHdoaWxzdCBjbGVhcmluZyBvdGhlciBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvciA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6IHRhcmdldC5lcnJvcnMuZ2V0XHJcbiAgICAgIHdyaXRlOiB0YXJnZXQuZXJyb3JzLnNldFxyXG4gICAgfSlcclxuXHJcbiAgICAjIFJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgYW55IGVycm9yc1xyXG4gICAgdGFyZ2V0Lmhhc0Vycm9yID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogdGFyZ2V0LmVycm9ycy5oYXNcclxuICAgIH0pXHJcblxyXG4gICAgIyBSZW1vdmUgZmFsbGlibGUgZGF0YSBmcm9tIHRoZSB0YXJnZXQgb2JqZWN0XHJcbiAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZSA9ICgpIC0+XHJcbiAgICAgIF9lcnJvcnMoe30pXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuZXJyb3JcclxuICAgICAgZGVsZXRlIHRhcmdldC5lcnJvcnNcclxuICAgICAgZGVsZXRlIHRhcmdldC5oYXNFcnJvclxyXG4gICAgICBkZWxldGUgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAjIERldGVybWluZSBpZiBpdGVtIGlzIGZhbGxpYmxlXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUgPSAodGFyZ2V0KSAtPlxyXG4gICAgcmV0dXJuIHRhcmdldC5lcnJvcnM/IGFuZCB0YXJnZXQuZXJyb3I/XHJcblxyXG4gIGdldERlcGVuZGVuY2llcyA9IGRvIC0+XHJcbiAgICBzeW1TdGF0ZSA9IGRvIC0+XHJcbiAgICAgIGMgPSBrby5jb21wdXRlZCgoKSAtPiByZXR1cm4pXHJcbiAgICAgIGlmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM/XHJcbiAgICAgICAgZm9yIHN5bWJvbCBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGMpXHJcbiAgICAgICAgICBpZiBTdHJpbmcoc3ltYm9sKSA9PSAnU3ltYm9sKF9zdGF0ZSknXHJcbiAgICAgICAgICAgIHJldHVybiBzeW1ib2xcclxuXHJcbiAgICAgIGlmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoYywgJ19zdGF0ZScpXHJcbiAgICAgICAgcmV0dXJuICdfc3RhdGUnXHJcblxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBkZXBLZXkgPSBkbyAtPlxyXG4gICAgICBvID0ga28ub2JzZXJ2YWJsZSgpXHJcbiAgICAgIGMgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgICAgcmVhZDogKCkgLT4gbygpXHJcbiAgICAgIH0pXHJcbiAgICAgIGZvciBvd24ga2V5LCB2YWwgb2YgY1tzeW1TdGF0ZV1cclxuICAgICAgICBpZiB2YWw/IGFuZCB0eXBlb2YgdmFsID09ICdvYmplY3QnXHJcbiAgICAgICAgICByZXR1cm4ga2V5XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJldHVybiAodGFyZ2V0KSAtPlxyXG4gICAgICBpZiBrby5pc0NvbXB1dGVkKHRhcmdldClcclxuICAgICAgICByZXR1cm4gdGFyZ2V0W3N5bVN0YXRlXVtkZXBLZXldXHJcbiAgICAgIGVsc2VcclxuICAgICAgICByZXR1cm4ge31cclxuXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlUmVhZCA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICBpZiBub3Qga28uaXNDb21wdXRlZCh0YXJnZXQpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICB0YXJnZXQuZXh0ZW5kKHsgZmFsbGlibGU6IHRydWUgfSlcclxuXHJcbiAgICBpZiBvcHRpb25zID09IGZhbHNlXHJcbiAgICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlUmVhZD8oKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBmaW5kSW5uZXIgPSAob3V0cHV0LCBjb21wdXRlZCkgLT5cclxuICAgICAgZm9yIG93biBrZXksIGRlcGVuZGVuY3kgb2YgZ2V0RGVwZW5kZW5jaWVzKGNvbXB1dGVkKVxyXG4gICAgICAgIGRlcGVuZGVuY3kgPSBkZXBlbmRlbmN5Ll90YXJnZXRcclxuICAgICAgICBpZiBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZShkZXBlbmRlbmN5KVxyXG4gICAgICAgICAgaWYgb3V0cHV0LmluZGV4T2YoZGVwZW5kZW5jeS5lcnJvcnMpID09IC0xXHJcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKGRlcGVuZGVuY3kuZXJyb3JzKVxyXG5cclxuICAgICAgICBpZiBrby5pc0NvbXB1dGVkKGRlcGVuZGVuY3kpXHJcbiAgICAgICAgICBmaW5kSW5uZXIob3V0cHV0LCBkZXBlbmRlbmN5KVxyXG5cclxuICAgICAgcmV0dXJuIG91dHB1dFxyXG5cclxuICAgIGVycm9ycyA9ICgpIC0+XHJcbiAgICAgIHRyeVxyXG4gICAgICAgICNzdWJzY3JpcHRpb24gPSB0YXJnZXQuc3Vic2NyaWJlKCgpIC0+IHJldHVybilcclxuICAgICAgICAjdGFyZ2V0KClcclxuICAgICAgICByZXR1cm4gZmluZElubmVyKFtdLCB0YXJnZXQpXHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAgICAjc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxyXG5cclxuICAgIGRpc3Bvc2FibGUgPSB0YXJnZXQuZXJyb3JzLmFkZChlcnJvcnMpXHJcblxyXG4gICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVSZWFkID0gKCkgLT5cclxuICAgICAgaWYgZGlzcG9zYWJsZT9cclxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxyXG4gICAgICAgIGRpc3Bvc2FibGUgPSB1bmRlZmluZWRcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuIHRhcmdldFxyXG5cclxuXHJcbiAgcmV0dXJuIGtvXHJcbiJdfQ==
