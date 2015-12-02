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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRpb24tYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztPQUFBLElBQUEsUUFBQTtFQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLEVBQUQ7RUFDVCxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQWIsR0FBd0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUV0QixRQUFBO0lBQUEsSUFBRyxPQUFBLEtBQVcsS0FBZDs7UUFDRSxNQUFNLENBQUM7O0FBQ1AsYUFBTyxPQUZUOztJQUtBLElBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBdEIsQ0FBaUMsTUFBakMsQ0FBSDtBQUNFLGFBQU8sT0FEVDs7SUFJQSxPQUFBLEdBQVUsRUFBRSxDQUFDLFVBQUgsQ0FBYyxFQUFkO0lBR1YsVUFBQSxHQUFhO0lBR2IsV0FBQSxHQUFlLEVBQUcsQ0FBQztJQUduQixZQUFBLEdBQWUsU0FBQyxFQUFEO0FBQ2IsVUFBQTtNQUFBLE1BQUEsR0FBUyxPQUFBLENBQUE7TUFFVCxJQUFHLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLEVBQXlCLEVBQXpCLENBQUg7UUFDRSxPQUFPLE1BQU8sQ0FBQSxFQUFBO1FBQ2QsT0FBTyxDQUFDLGVBQVIsQ0FBQSxFQUZGOztJQUhhO0lBVWYsWUFBQSxHQUFlLFNBQUMsRUFBRDthQUNiLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE9BQUEsQ0FBQSxDQUFqQixFQUE0QixFQUE1QjtJQURhO0lBR2YsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxFQUFULEVBQWEsT0FBYjtBQUNmLFVBQUE7TUFBQSxJQUFHLFVBQUg7UUFDRSxRQUFBLEdBQVc7VUFDVCxPQUFBLEVBQVMsT0FEQTtVQUVULE1BQUEsRUFBUSxNQUZDO1VBR1QsT0FBQSxFQUFTLFNBQUE7bUJBQ1AsWUFBQSxDQUFhLEVBQWI7VUFETyxDQUhBO1VBS1QsVUFBQSxFQUFZLFNBQUE7bUJBQ1YsQ0FBSSxZQUFBLENBQWEsRUFBYjtVQURN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QUFVLElBQVo7V0FBZDtVQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFkLENBQWtCLE9BQWxCLENBQVosRUFGRjtTQUFBLE1BQUE7VUFJRSxNQUFNLENBQUMsSUFBUCxDQUFZO1lBQ1YsT0FBQSxFQUFTLE9BREM7WUFFVixPQUFBLEVBQVMsU0FBQTtxQkFBTTtZQUFOLENBRkM7WUFHVixVQUFBLEVBQVksU0FBQTtxQkFBTTtZQUFOLENBSEY7V0FBWixFQUpGOztNQURTO01BYVgsT0FBQSxHQUFVLFNBQUE7QUFDUixZQUFBO0FBQUEsYUFBQSx3Q0FBQTs7VUFDRSxLQUFLLENBQUMsT0FBTixDQUFBO0FBREY7UUFFQSxNQUFBLEdBQVM7UUFDVCxZQUFZLENBQUMsT0FBYixDQUFBO1FBQ0EsWUFBQSxHQUFlO01BTFA7QUFRVjtRQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixRQUFqQixFQURGO09BQUE7UUFHRSxZQUFBLEdBQWUsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsT0FBbkIsRUFBNEIsSUFBNUIsRUFBa0MsUUFBbEMsRUFIakI7O0FBS0EsYUFBTztJQTVCVCxDQURTO0FBZ0NYLFdBQU87RUFuQ087QUFxQ2hCLFNBQU87QUE5TUUiLCJmaWxlIjoia28tdmFsaWRhdGlvbi1iYXNlLndlYi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImFwcGx5S292ID0gKGtvKSAtPlxyXG4gIGtvLmV4dGVuZGVycy5mYWxsaWJsZSA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICAjIERpc3Bvc2U/XHJcbiAgICBpZiBvcHRpb25zID09IGZhbHNlXHJcbiAgICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlPygpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICAjIEFscmVhZHkgY29uc3RydWN0ZWRcclxuICAgIGlmIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlKHRhcmdldClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgY29udGFpbnMgdGhlIGVycm9ycyBmb3IgdGFyZ2V0XHJcbiAgICBfZXJyb3JzID0ga28ub2JzZXJ2YWJsZSh7fSlcclxuXHJcbiAgICAjIHVzZWQgZm9yIGdlbmVyYXRpbmcgYSB1bmlxdWUgaWQgZm9yIGVhY2ggZXJyb3JcclxuICAgIF9pZENvdW50ZXIgPSAwXHJcblxyXG4gICAgIyBoZWxwZXIgZm9yIGNhbGxpbmcgaGFzT3duUHJvcGVydHlcclxuICAgIF9oYXNPd25Qcm9wID0gKHt9KS5oYXNPd25Qcm9wZXJ0eVxyXG5cclxuICAgICMgUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGVycm9yLCBpZiBpdCBleGlzdHNcclxuICAgIF9yZW1vdmVFcnJvciA9IChpZCkgLT5cclxuICAgICAgZXJyb3JzID0gX2Vycm9ycygpXHJcblxyXG4gICAgICBpZiBfaGFzT3duUHJvcC5jYWxsKGVycm9ycywgaWQpXHJcbiAgICAgICAgZGVsZXRlIGVycm9yc1tpZF1cclxuICAgICAgICBfZXJyb3JzLnZhbHVlSGFzTXV0YXRlZCgpXHJcblxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAjIFJldHVybnMgdHJ1ZSBpZmYgdGhlIHNwZWNpZmllZCBlcnJvciBleGlzdHNcclxuICAgIF9lcnJvckV4aXN0cyA9IChpZCkgLT5cclxuICAgICAgX2hhc093blByb3AuY2FsbChfZXJyb3JzKCksIGlkKVxyXG5cclxuICAgIF9lcnJvck1ldGFEYXRhID0gKGVycm9ycywgaWQsIG1lc3NhZ2UpIC0+XHJcbiAgICAgIGlmIGlkP1xyXG4gICAgICAgIG1ldGFEYXRhID0ge1xyXG4gICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICAgICAgdGFyZ2V0OiB0YXJnZXRcclxuICAgICAgICAgIGRpc3Bvc2U6ICgpIC0+XHJcbiAgICAgICAgICAgIF9yZW1vdmVFcnJvcihpZClcclxuICAgICAgICAgIGlzRGlzcG9zZWQ6ICgpIC0+XHJcbiAgICAgICAgICAgIG5vdCBfZXJyb3JFeGlzdHMoaWQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVycm9yc1tpZF0gPSBtZXNzYWdlXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtZXRhRGF0YSA9IHtcclxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0XHJcbiAgICAgICAgICBkaXNwb3NlOiAoKSAtPiB1bmRlZmluZWRcclxuICAgICAgICAgIGlzRGlzcG9zZWQ6ICgpIC0+IHRydWVcclxuICAgICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbWV0YURhdGFcclxuXHJcbiAgICAjIEEgbGlzdCBvZiBhbGwgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogKCkgLT5cclxuICAgICAgICBtZXNzYWdlcyA9IFtdXHJcblxyXG4gICAgICAgIGFkZE1lc3NhZ2UgPSAobWVzc2FnZSkgLT5cclxuICAgICAgICAgIGlmIG5vdCBtZXNzYWdlP1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSgpXHJcbiAgICAgICAgICAgIGFkZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheShtZXNzYWdlKVxyXG4gICAgICAgICAgICBmb3Igc3ViTWVzc2FnZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgYWRkTWVzc2FnZShzdWJNZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZSBpZiB0eXBlb2YgbWVzc2FnZSA9PSAnc3RyaW5nJyBvciB0eXBlb2YgbWVzc2FnZSA9PSAnb2JqZWN0J1xyXG4gICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbnNvbGU/LmFzc2VydD8oZmFsc2UsICdpbnZhbGlkIGVycm9yIG1lc3NhZ2UnKVxyXG5cclxuICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICBmb3Igb3duIGlkLCBtZXNzYWdlIG9mIF9lcnJvcnMoKVxyXG4gICAgICAgICAgYWRkTWVzc2FnZShtZXNzYWdlKVxyXG5cclxuICAgICAgICByZXR1cm4gbWVzc2FnZXNcclxuXHJcbiAgICAgIHdyaXRlOiAobWVzc2FnZXMpIC0+XHJcbiAgICAgICAgdGFyZ2V0LmVycm9ycy5zZXQobWVzc2FnZXMpXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9KVxyXG5cclxuICAgICMgQWRkIGFuIGluZGl2aWR1YWwgZXJyb3JcclxuICAgIHRhcmdldC5lcnJvcnMuYWRkID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgIGlmIG1lc3NhZ2U/XHJcbiAgICAgICAgaWQgPSArK19pZENvdW50ZXJcclxuXHJcbiAgICAgIG1ldGFEYXRhID0gX2Vycm9yTWV0YURhdGEoX2Vycm9ycygpLCBpZCwgbWVzc2FnZSlcclxuICAgICAgX2Vycm9ycy52YWx1ZUhhc011dGF0ZWQoKVxyXG5cclxuICAgICAgcmV0dXJuIG1ldGFEYXRhXHJcblxyXG4gICAgIyBHZXQgdGhlIGZpcnN0IGVycm9yXHJcbiAgICB0YXJnZXQuZXJyb3JzLmdldCA9ICgpIC0+XHJcbiAgICAgIGZpcnN0TWVzc2FnZSA9IHVuZGVmaW5lZFxyXG5cclxuICAgICAgZmluZE1lc3NhZ2UgPSAobWVzc2FnZSkgLT5cclxuICAgICAgICBpZiBub3QgbWVzc2FnZT9cclxuICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgaWYgZmluZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIEFycmF5LmlzQXJyYXkobWVzc2FnZSlcclxuICAgICAgICAgIGZvciBzdWJNZXNzYWdlIGluIG1lc3NhZ2VcclxuICAgICAgICAgICAgaWYgZmluZE1lc3NhZ2Uoc3ViTWVzc2FnZSlcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ3N0cmluZycgb3IgdHlwZW9mIG1lc3NhZ2UgPT0gJ29iamVjdCdcclxuICAgICAgICAgIGZpcnN0TWVzc2FnZSA9IG1lc3NhZ2VcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgY29uc29sZT8uYXNzZXJ0PyhmYWxzZSwgJ2ludmFsaWQgZXJyb3IgbWVzc2FnZScpXHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgZm9yIG93biBpZCwgbWVzc2FnZSBvZiBfZXJyb3JzKClcclxuICAgICAgICBpZiBmaW5kTWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgICAgcmV0dXJuIGZpcnN0TWVzc2FnZVxyXG5cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxyXG5cclxuICAgICMgU2V0IGEgc2luZ2xlIGVycm9yLCBjbGVhcmluZyBvdGhlciBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMuc2V0ID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgIGlmIG1lc3NhZ2U/XHJcbiAgICAgICAgaWQgPSArK19pZENvdW50ZXJcclxuXHJcbiAgICAgIGVycm9ycyA9IHt9XHJcbiAgICAgIG1ldGFEYXRhID0gX2Vycm9yTWV0YURhdGEoZXJyb3JzLCBpZCwgbWVzc2FnZSlcclxuICAgICAgX2Vycm9ycyhlcnJvcnMpXHJcbiAgICAgIHJldHVybiBtZXRhRGF0YVxyXG5cclxuICAgIHRhcmdldC5lcnJvcnMuaGFzID0gKCkgLT5cclxuICAgICAgcmV0dXJuIHRhcmdldC5lcnJvcigpP1xyXG5cclxuICAgICMgQ2xlYXIgYWxsIHRoZSBjdXJyZW50IGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycy5jbGVhciA9ICgpIC0+XHJcbiAgICAgIF9lcnJvcnMoe30pXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgR2V0IHRoZSBmaXJzdCBlcnJvciwgb3IgU2V0IGEgc2luZ2xlIGVycm9yIHdoaWxzdCBjbGVhcmluZyBvdGhlciBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvciA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6IHRhcmdldC5lcnJvcnMuZ2V0XHJcbiAgICAgIHdyaXRlOiB0YXJnZXQuZXJyb3JzLnNldFxyXG4gICAgfSlcclxuXHJcbiAgICAjIFJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgYW55IGVycm9yc1xyXG4gICAgdGFyZ2V0Lmhhc0Vycm9yID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogdGFyZ2V0LmVycm9ycy5oYXNcclxuICAgIH0pXHJcblxyXG4gICAgIyBSZW1vdmUgZmFsbGlibGUgZGF0YSBmcm9tIHRoZSB0YXJnZXQgb2JqZWN0XHJcbiAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZSA9ICgpIC0+XHJcbiAgICAgIF9lcnJvcnMoe30pXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuZXJyb3JcclxuICAgICAgZGVsZXRlIHRhcmdldC5lcnJvcnNcclxuICAgICAgZGVsZXRlIHRhcmdldC5oYXNFcnJvclxyXG4gICAgICBkZWxldGUgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAjIERldGVybWluZSBpZiBpdGVtIGlzIGZhbGxpYmxlXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUgPSAodGFyZ2V0KSAtPlxyXG4gICAgcmV0dXJuIHRhcmdldC5lcnJvcnM/IGFuZCB0YXJnZXQuZXJyb3I/XHJcblxyXG4gIGtvLnB1cmVFcnJvcnMgPSAocmVhZCwgb3duZXIpIC0+XHJcbiAgICBzdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcclxuXHJcbiAgICBjb21wdXRlZCA9IGtvLnB1cmVDb21wdXRlZChcclxuICAgICAgKCkgLT5cclxuICAgICAgICBlcnJvcnMgPSBbXVxyXG4gICAgICAgIGFkZEVycm9yID0gKHRhcmdldCwgbWVzc2FnZSkgLT5cclxuICAgICAgICAgIGlmIHRhcmdldD9cclxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmV4dGVuZCh7IGZhbGxpYmxlOiB0cnVlIH0pXHJcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKHRhcmdldC5lcnJvcnMuYWRkKG1lc3NhZ2UpKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBlcnJvcnMucHVzaCh7XHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxyXG4gICAgICAgICAgICAgIGRpc3Bvc2U6ICgpIC0+IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgIGlzRGlzcG9zZWQ6ICgpIC0+IHRydWVcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgZGlzcG9zZSA9ICgpIC0+XHJcbiAgICAgICAgICBmb3IgZXJyb3IgaW4gZXJyb3JzXHJcbiAgICAgICAgICAgIGVycm9yLmRpc3Bvc2UoKVxyXG4gICAgICAgICAgZXJyb3JzID0gW11cclxuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcclxuICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgIHRyeVxyXG4gICAgICAgICAgcmVhZC5jYWxsKG93bmVyLCBhZGRFcnJvcilcclxuICAgICAgICBmaW5hbGx5XHJcbiAgICAgICAgICBzdWJzY3JpcHRpb24gPSBjb21wdXRlZC5zdWJzY3JpYmUoZGlzcG9zZSwgbnVsbCwgJ2FzbGVlcCcpXHJcblxyXG4gICAgICAgIHJldHVybiBlcnJvcnNcclxuICAgIClcclxuXHJcbiAgICByZXR1cm4gY29tcHV0ZWRcclxuXHJcbiAgcmV0dXJuIGtvXHJcblxyXG4iXX0=
