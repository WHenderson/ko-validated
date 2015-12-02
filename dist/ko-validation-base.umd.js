;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.applyKov = factory();
  }
}(this, function() {
var applyKov,
  hasProp = {}.hasOwnProperty;

applyKov = function(ko) {
  ko.extenders.fallible = function(target, options) {
    var _errorExists, _errorMetaData, _errors, _hasOwnProp, _idCounter, _removeError;
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
    _idCounter = 0;
    _hasOwnProp = {}.hasOwnProperty;
    _removeError = function(id) {
      var errors;
      errors = _errors();
      if (_hasOwnProp.call(errors, id)) {
        delete errors[id];
        _errors.valueHasMutated();
      }
    };
    _errorExists = function(id) {
      return _hasOwnProp.call(_errors(), id);
    };
    _errorMetaData = function(errors, id, message) {
      var metaData;
      if (id != null) {
        metaData = {
          message: message,
          target: target,
          dispose: function() {
            return _removeError(id);
          },
          isDisposed: function() {
            return !_errorExists(id);
          }
        };
        errors[id] = message;
      } else {
        metaData = {
          message: message,
          target: target,
          dispose: function() {
            return void 0;
          },
          isDisposed: function() {
            return true;
          }
        };
      }
      return metaData;
    };
    target.errors = ko.pureComputed({
      read: function() {
        var addMessage, id, message, messages, ref;
        messages = [];
        addMessage = function(message) {
          var i, len, subMessage;
          if (message == null) {
            return;
          } else if (typeof message === 'function') {
            message = message();
            addMessage(message);
          } else if (Array.isArray(message)) {
            for (i = 0, len = message.length; i < len; i++) {
              subMessage = message[i];
              addMessage(subMessage);
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
          addMessage(message);
        }
        return messages;
      },
      write: function(messages) {
        target.errors.set(messages);
      }
    });
    target.errors.add = function(message) {
      var id, metaData;
      if (message != null) {
        id = ++_idCounter;
      }
      metaData = _errorMetaData(_errors(), id, message);
      _errors.valueHasMutated();
      return metaData;
    };
    target.errors.get = function() {
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
      ref = _errors();
      for (id in ref) {
        if (!hasProp.call(ref, id)) continue;
        message = ref[id];
        if (findMessage(message)) {
          return firstMessage;
        }
      }
      return void 0;
    };
    target.errors.set = function(message) {
      var errors, id, metaData;
      if (message != null) {
        id = ++_idCounter;
      }
      errors = {};
      metaData = _errorMetaData(errors, id, message);
      _errors(errors);
      return metaData;
    };
    target.errors.has = function() {
      return target.error() != null;
    };
    target.errors.clear = function() {
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
  ko.pureErrors = function(read, owner) {
    var computed, subscription;
    subscription = void 0;
    computed = ko.pureComputed(function() {
      var addError, dispose, errors;
      errors = [];
      addError = function(target, message) {
        if (target != null) {
          target = target.extend({
            fallible: true
          });
          errors.push(target.errors.add(message));
        } else {
          errors.push({
            message: message,
            dispose: function() {
              return void 0;
            },
            isDisposed: function() {
              return true;
            }
          });
        }
      };
      dispose = function() {
        var error, i, len;
        for (i = 0, len = errors.length; i < len; i++) {
          error = errors[i];
          error.dispose();
        }
        errors = [];
        subscription.dispose();
        subscription = void 0;
      };
      try {
        read.call(owner, addError);
      } finally {
        subscription = computed.subscribe(dispose, null, 'asleep');
      }
      return errors;
    });
    return computed;
  };
  return ko;
};

return applyKov;
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRpb24tYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O1NBQUEsSUFBQSxRQUFBO0VBQUE7O0FBQUEsUUFBQSxHQUFXLFNBQUMsRUFBRDtFQUNULEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBYixHQUF3QixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBRXRCLFFBQUE7SUFBQSxJQUFHLE9BQUEsS0FBVyxLQUFkOztRQUNFLE1BQU0sQ0FBQzs7QUFDUCxhQUFPLE9BRlQ7O0lBS0EsSUFBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUF0QixDQUFpQyxNQUFqQyxDQUFIO0FBQ0UsYUFBTyxPQURUOztJQUlBLE9BQUEsR0FBVSxFQUFFLENBQUMsVUFBSCxDQUFjLEVBQWQ7SUFHVixVQUFBLEdBQWE7SUFHYixXQUFBLEdBQWUsRUFBRyxDQUFDO0lBR25CLFlBQUEsR0FBZSxTQUFDLEVBQUQ7QUFDYixVQUFBO01BQUEsTUFBQSxHQUFTLE9BQUEsQ0FBQTtNQUVULElBQUcsV0FBVyxDQUFDLElBQVosQ0FBaUIsTUFBakIsRUFBeUIsRUFBekIsQ0FBSDtRQUNFLE9BQU8sTUFBTyxDQUFBLEVBQUE7UUFDZCxPQUFPLENBQUMsZUFBUixDQUFBLEVBRkY7O0lBSGE7SUFVZixZQUFBLEdBQWUsU0FBQyxFQUFEO2FBQ2IsV0FBVyxDQUFDLElBQVosQ0FBaUIsT0FBQSxDQUFBLENBQWpCLEVBQTRCLEVBQTVCO0lBRGE7SUFHZixjQUFBLEdBQWlCLFNBQUMsTUFBRCxFQUFTLEVBQVQsRUFBYSxPQUFiO0FBQ2YsVUFBQTtNQUFBLElBQUcsVUFBSDtRQUNFLFFBQUEsR0FBVztVQUNULE9BQUEsRUFBUyxPQURBO1VBRVQsTUFBQSxFQUFRLE1BRkM7VUFHVCxPQUFBLEVBQVMsU0FBQTttQkFDUCxZQUFBLENBQWEsRUFBYjtVQURPLENBSEE7VUFLVCxVQUFBLEVBQVksU0FBQTttQkFDVixDQUFJLFlBQUEsQ0FBYSxFQUFiO1VB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LEVBQVUsSUFBWjtXQUFkO1VBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQWQsQ0FBa0IsT0FBbEIsQ0FBWixFQUZGO1NBQUEsTUFBQTtVQUlFLE1BQU0sQ0FBQyxJQUFQLENBQVk7WUFDVixPQUFBLEVBQVMsT0FEQztZQUVWLE9BQUEsRUFBUyxTQUFBO3FCQUFNO1lBQU4sQ0FGQztZQUdWLFVBQUEsRUFBWSxTQUFBO3FCQUFNO1lBQU4sQ0FIRjtXQUFaLEVBSkY7O01BRFM7TUFhWCxPQUFBLEdBQVUsU0FBQTtBQUNSLFlBQUE7QUFBQSxhQUFBLHdDQUFBOztVQUNFLEtBQUssQ0FBQyxPQUFOLENBQUE7QUFERjtRQUVBLE1BQUEsR0FBUztRQUNULFlBQVksQ0FBQyxPQUFiLENBQUE7UUFDQSxZQUFBLEdBQWU7TUFMUDtBQVFWO1FBQ0UsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLFFBQWpCLEVBREY7T0FBQTtRQUdFLFlBQUEsR0FBZSxRQUFRLENBQUMsU0FBVCxDQUFtQixPQUFuQixFQUE0QixJQUE1QixFQUFrQyxRQUFsQyxFQUhqQjs7QUFLQSxhQUFPO0lBNUJULENBRFM7QUFnQ1gsV0FBTztFQW5DTztBQXFDaEIsU0FBTztBQTlNRSIsImZpbGUiOiJrby12YWxpZGF0aW9uLWJhc2UudW1kLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiYXBwbHlLb3YgPSAoa28pIC0+XHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlID0gKHRhcmdldCwgb3B0aW9ucykgLT5cclxuICAgICMgRGlzcG9zZT9cclxuICAgIGlmIG9wdGlvbnMgPT0gZmFsc2VcclxuICAgICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGU/KClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgQWxyZWFkeSBjb25zdHJ1Y3RlZFxyXG4gICAgaWYga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUodGFyZ2V0KVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgIyBjb250YWlucyB0aGUgZXJyb3JzIGZvciB0YXJnZXRcclxuICAgIF9lcnJvcnMgPSBrby5vYnNlcnZhYmxlKHt9KVxyXG5cclxuICAgICMgdXNlZCBmb3IgZ2VuZXJhdGluZyBhIHVuaXF1ZSBpZCBmb3IgZWFjaCBlcnJvclxyXG4gICAgX2lkQ291bnRlciA9IDBcclxuXHJcbiAgICAjIGhlbHBlciBmb3IgY2FsbGluZyBoYXNPd25Qcm9wZXJ0eVxyXG4gICAgX2hhc093blByb3AgPSAoe30pLmhhc093blByb3BlcnR5XHJcblxyXG4gICAgIyBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZXJyb3IsIGlmIGl0IGV4aXN0c1xyXG4gICAgX3JlbW92ZUVycm9yID0gKGlkKSAtPlxyXG4gICAgICBlcnJvcnMgPSBfZXJyb3JzKClcclxuXHJcbiAgICAgIGlmIF9oYXNPd25Qcm9wLmNhbGwoZXJyb3JzLCBpZClcclxuICAgICAgICBkZWxldGUgZXJyb3JzW2lkXVxyXG4gICAgICAgIF9lcnJvcnMudmFsdWVIYXNNdXRhdGVkKClcclxuXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgUmV0dXJucyB0cnVlIGlmZiB0aGUgc3BlY2lmaWVkIGVycm9yIGV4aXN0c1xyXG4gICAgX2Vycm9yRXhpc3RzID0gKGlkKSAtPlxyXG4gICAgICBfaGFzT3duUHJvcC5jYWxsKF9lcnJvcnMoKSwgaWQpXHJcblxyXG4gICAgX2Vycm9yTWV0YURhdGEgPSAoZXJyb3JzLCBpZCwgbWVzc2FnZSkgLT5cclxuICAgICAgaWYgaWQ/XHJcbiAgICAgICAgbWV0YURhdGEgPSB7XHJcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXHJcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxyXG4gICAgICAgICAgZGlzcG9zZTogKCkgLT5cclxuICAgICAgICAgICAgX3JlbW92ZUVycm9yKGlkKVxyXG4gICAgICAgICAgaXNEaXNwb3NlZDogKCkgLT5cclxuICAgICAgICAgICAgbm90IF9lcnJvckV4aXN0cyhpZClcclxuICAgICAgICB9XHJcbiAgICAgICAgZXJyb3JzW2lkXSA9IG1lc3NhZ2VcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG1ldGFEYXRhID0ge1xyXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXRcclxuICAgICAgICAgIGRpc3Bvc2U6ICgpIC0+IHVuZGVmaW5lZFxyXG4gICAgICAgICAgaXNEaXNwb3NlZDogKCkgLT4gdHJ1ZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBtZXRhRGF0YVxyXG5cclxuICAgICMgQSBsaXN0IG9mIGFsbCBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiAoKSAtPlxyXG4gICAgICAgIG1lc3NhZ2VzID0gW11cclxuXHJcbiAgICAgICAgYWRkTWVzc2FnZSA9IChtZXNzYWdlKSAtPlxyXG4gICAgICAgICAgaWYgbm90IG1lc3NhZ2U/XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnZnVuY3Rpb24nXHJcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlKClcclxuICAgICAgICAgICAgYWRkTWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIGZvciBzdWJNZXNzYWdlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgICBhZGRNZXNzYWdlKHN1Yk1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnIG9yIHR5cGVvZiBtZXNzYWdlID09ICdvYmplY3QnXHJcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29uc29sZT8uYXNzZXJ0PyhmYWxzZSwgJ2ludmFsaWQgZXJyb3IgbWVzc2FnZScpXHJcblxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgIGZvciBvd24gaWQsIG1lc3NhZ2Ugb2YgX2Vycm9ycygpXHJcbiAgICAgICAgICBhZGRNZXNzYWdlKG1lc3NhZ2UpXHJcblxyXG4gICAgICAgIHJldHVybiBtZXNzYWdlc1xyXG5cclxuICAgICAgd3JpdGU6IChtZXNzYWdlcykgLT5cclxuICAgICAgICB0YXJnZXQuZXJyb3JzLnNldChtZXNzYWdlcylcclxuICAgICAgICByZXR1cm5cclxuICAgIH0pXHJcblxyXG4gICAgIyBBZGQgYW4gaW5kaXZpZHVhbCBlcnJvclxyXG4gICAgdGFyZ2V0LmVycm9ycy5hZGQgPSAobWVzc2FnZSkgLT5cclxuICAgICAgaWYgbWVzc2FnZT9cclxuICAgICAgICBpZCA9ICsrX2lkQ291bnRlclxyXG5cclxuICAgICAgbWV0YURhdGEgPSBfZXJyb3JNZXRhRGF0YShfZXJyb3JzKCksIGlkLCBtZXNzYWdlKVxyXG4gICAgICBfZXJyb3JzLnZhbHVlSGFzTXV0YXRlZCgpXHJcblxyXG4gICAgICByZXR1cm4gbWV0YURhdGFcclxuXHJcbiAgICAjIEdldCB0aGUgZmlyc3QgZXJyb3JcclxuICAgIHRhcmdldC5lcnJvcnMuZ2V0ID0gKCkgLT5cclxuICAgICAgZmlyc3RNZXNzYWdlID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICBmaW5kTWVzc2FnZSA9IChtZXNzYWdlKSAtPlxyXG4gICAgICAgIGlmIG5vdCBtZXNzYWdlP1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnZnVuY3Rpb24nXHJcbiAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSgpXHJcbiAgICAgICAgICBpZiBmaW5kTWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheShtZXNzYWdlKVxyXG4gICAgICAgICAgZm9yIHN1Yk1lc3NhZ2UgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICBpZiBmaW5kTWVzc2FnZShzdWJNZXNzYWdlKVxyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnc3RyaW5nJyBvciB0eXBlb2YgbWVzc2FnZSA9PSAnb2JqZWN0J1xyXG4gICAgICAgICAgZmlyc3RNZXNzYWdlID0gbWVzc2FnZVxyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBjb25zb2xlPy5hc3NlcnQ/KGZhbHNlLCAnaW52YWxpZCBlcnJvciBtZXNzYWdlJylcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICBmb3Igb3duIGlkLCBtZXNzYWdlIG9mIF9lcnJvcnMoKVxyXG4gICAgICAgIGlmIGZpbmRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICByZXR1cm4gZmlyc3RNZXNzYWdlXHJcblxyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXHJcblxyXG4gICAgIyBTZXQgYSBzaW5nbGUgZXJyb3IsIGNsZWFyaW5nIG90aGVyIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycy5zZXQgPSAobWVzc2FnZSkgLT5cclxuICAgICAgaWYgbWVzc2FnZT9cclxuICAgICAgICBpZCA9ICsrX2lkQ291bnRlclxyXG5cclxuICAgICAgZXJyb3JzID0ge31cclxuICAgICAgbWV0YURhdGEgPSBfZXJyb3JNZXRhRGF0YShlcnJvcnMsIGlkLCBtZXNzYWdlKVxyXG4gICAgICBfZXJyb3JzKGVycm9ycylcclxuICAgICAgcmV0dXJuIG1ldGFEYXRhXHJcblxyXG4gICAgdGFyZ2V0LmVycm9ycy5oYXMgPSAoKSAtPlxyXG4gICAgICByZXR1cm4gdGFyZ2V0LmVycm9yKCk/XHJcblxyXG4gICAgIyBDbGVhciBhbGwgdGhlIGN1cnJlbnQgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzLmNsZWFyID0gKCkgLT5cclxuICAgICAgX2Vycm9ycyh7fSlcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBHZXQgdGhlIGZpcnN0IGVycm9yLCBvciBTZXQgYSBzaW5nbGUgZXJyb3Igd2hpbHN0IGNsZWFyaW5nIG90aGVyIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9yID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogdGFyZ2V0LmVycm9ycy5nZXRcclxuICAgICAgd3JpdGU6IHRhcmdldC5lcnJvcnMuc2V0XHJcbiAgICB9KVxyXG5cclxuICAgICMgUmV0dXJuIHRydWUgaWZmIHRoZXJlIGFyZSBhbnkgZXJyb3JzXHJcbiAgICB0YXJnZXQuaGFzRXJyb3IgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiB0YXJnZXQuZXJyb3JzLmhhc1xyXG4gICAgfSlcclxuXHJcbiAgICAjIFJlbW92ZSBmYWxsaWJsZSBkYXRhIGZyb20gdGhlIHRhcmdldCBvYmplY3RcclxuICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlID0gKCkgLT5cclxuICAgICAgX2Vycm9ycyh7fSlcclxuICAgICAgZGVsZXRlIHRhcmdldC5lcnJvclxyXG4gICAgICBkZWxldGUgdGFyZ2V0LmVycm9yc1xyXG4gICAgICBkZWxldGUgdGFyZ2V0Lmhhc0Vycm9yXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICMgRGV0ZXJtaW5lIGlmIGl0ZW0gaXMgZmFsbGlibGVcclxuICBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZSA9ICh0YXJnZXQpIC0+XHJcbiAgICByZXR1cm4gdGFyZ2V0LmVycm9ycz8gYW5kIHRhcmdldC5lcnJvcj9cclxuXHJcbiAga28ucHVyZUVycm9ycyA9IChyZWFkLCBvd25lcikgLT5cclxuICAgIHN1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxyXG5cclxuICAgIGNvbXB1dGVkID0ga28ucHVyZUNvbXB1dGVkKFxyXG4gICAgICAoKSAtPlxyXG4gICAgICAgIGVycm9ycyA9IFtdXHJcbiAgICAgICAgYWRkRXJyb3IgPSAodGFyZ2V0LCBtZXNzYWdlKSAtPlxyXG4gICAgICAgICAgaWYgdGFyZ2V0P1xyXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuZXh0ZW5kKHsgZmFsbGlibGU6IHRydWUgfSlcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2godGFyZ2V0LmVycm9ycy5hZGQobWVzc2FnZSkpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcclxuICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgZGlzcG9zZTogKCkgLT4gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgaXNEaXNwb3NlZDogKCkgLT4gdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICBkaXNwb3NlID0gKCkgLT5cclxuICAgICAgICAgIGZvciBlcnJvciBpbiBlcnJvcnNcclxuICAgICAgICAgICAgZXJyb3IuZGlzcG9zZSgpXHJcbiAgICAgICAgICBlcnJvcnMgPSBbXVxyXG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxyXG4gICAgICAgICAgc3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgdHJ5XHJcbiAgICAgICAgICByZWFkLmNhbGwob3duZXIsIGFkZEVycm9yKVxyXG4gICAgICAgIGZpbmFsbHlcclxuICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IGNvbXB1dGVkLnN1YnNjcmliZShkaXNwb3NlLCBudWxsLCAnYXNsZWVwJylcclxuXHJcbiAgICAgICAgcmV0dXJuIGVycm9yc1xyXG4gICAgKVxyXG5cclxuICAgIHJldHVybiBjb21wdXRlZFxyXG5cclxuICByZXR1cm4ga29cclxuXHJcbiJdfQ==
