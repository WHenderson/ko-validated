(function (){
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

module.exports = applyKov;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRpb24tYmFzZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtDQUFBLElBQUEsUUFBQTtFQUFBOztBQUFBLFFBQUEsR0FBVyxTQUFDLEVBQUQ7RUFDVCxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQWIsR0FBd0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUV0QixRQUFBO0lBQUEsSUFBRyxPQUFBLEtBQVcsS0FBZDs7UUFDRSxNQUFNLENBQUM7O0FBQ1AsYUFBTyxPQUZUOztJQUtBLElBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBdEIsQ0FBaUMsTUFBakMsQ0FBSDtBQUNFLGFBQU8sT0FEVDs7SUFJQSxPQUFBLEdBQVUsRUFBRSxDQUFDLFVBQUgsQ0FBYyxFQUFkO0lBR1YsVUFBQSxHQUFhO0lBR2IsV0FBQSxHQUFlLEVBQUcsQ0FBQztJQUduQixZQUFBLEdBQWUsU0FBQyxFQUFEO0FBQ2IsVUFBQTtNQUFBLE1BQUEsR0FBUyxPQUFBLENBQUE7TUFFVCxJQUFHLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLEVBQXlCLEVBQXpCLENBQUg7UUFDRSxPQUFPLE1BQU8sQ0FBQSxFQUFBO1FBQ2QsT0FBTyxDQUFDLGVBQVIsQ0FBQSxFQUZGOztJQUhhO0lBVWYsWUFBQSxHQUFlLFNBQUMsRUFBRDthQUNiLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE9BQUEsQ0FBQSxDQUFqQixFQUE0QixFQUE1QjtJQURhO0lBR2YsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxFQUFULEVBQWEsT0FBYjtBQUNmLFVBQUE7TUFBQSxJQUFHLFVBQUg7UUFDRSxRQUFBLEdBQVc7VUFDVCxPQUFBLEVBQVMsT0FEQTtVQUVULE1BQUEsRUFBUSxNQUZDO1VBR1QsT0FBQSxFQUFTLFNBQUE7bUJBQ1AsWUFBQSxDQUFhLEVBQWI7VUFETyxDQUhBO1VBS1QsVUFBQSxFQUFZLFNBQUE7bUJBQ1YsQ0FBSSxZQUFBLENBQWEsRUFBYjtVQURNLENBTEg7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QVo7V0FBZDtVQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFkLENBQWtCLE9BQWxCLENBQVosRUFGRjtTQUFBLE1BQUE7VUFJRSxNQUFNLENBQUMsSUFBUCxDQUFZO1lBQ1YsT0FBQSxFQUFTLE9BREM7WUFFVixPQUFBLEVBQVMsU0FBQTtxQkFBTTtZQUFOLENBRkM7WUFHVixVQUFBLEVBQVksU0FBQTtxQkFBTTtZQUFOLENBSEY7V0FBWixFQUpGOztNQURTO01BYVgsT0FBQSxHQUFVLFNBQUE7QUFDUixZQUFBO0FBQUEsYUFBQSx3Q0FBQTs7VUFDRSxLQUFLLENBQUMsT0FBTixDQUFBO0FBREY7UUFFQSxNQUFBLEdBQVM7UUFDVCxZQUFZLENBQUMsT0FBYixDQUFBO1FBQ0EsWUFBQSxHQUFlO01BTFA7QUFRVjtRQUNFLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixRQUFqQixFQURGO09BQUE7UUFHRSxZQUFBLEdBQWUsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsT0FBbkIsRUFBNEIsSUFBNUIsRUFBa0MsUUFBbEMsRUFIakI7O0FBS0EsYUFBTztJQTVCVCxDQURTO0FBZ0NYLFdBQU87RUFuQ087QUFxQ2hCLFNBQU87QUE5TUUiLCJmaWxlIjoia28tdmFsaWRhdGlvbi1iYXNlLm5vZGUuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJhcHBseUtvdiA9IChrbykgLT5cclxuICBrby5leHRlbmRlcnMuZmFsbGlibGUgPSAodGFyZ2V0LCBvcHRpb25zKSAtPlxyXG4gICAgIyBEaXNwb3NlP1xyXG4gICAgaWYgb3B0aW9ucyA9PSBmYWxzZVxyXG4gICAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZT8oKVxyXG4gICAgICByZXR1cm4gdGFyZ2V0XHJcblxyXG4gICAgIyBBbHJlYWR5IGNvbnN0cnVjdGVkXHJcbiAgICBpZiBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZSh0YXJnZXQpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICAjIGNvbnRhaW5zIHRoZSBlcnJvcnMgZm9yIHRhcmdldFxyXG4gICAgX2Vycm9ycyA9IGtvLm9ic2VydmFibGUoe30pXHJcblxyXG4gICAgIyB1c2VkIGZvciBnZW5lcmF0aW5nIGEgdW5pcXVlIGlkIGZvciBlYWNoIGVycm9yXHJcbiAgICBfaWRDb3VudGVyID0gMFxyXG5cclxuICAgICMgaGVscGVyIGZvciBjYWxsaW5nIGhhc093blByb3BlcnR5XHJcbiAgICBfaGFzT3duUHJvcCA9ICh7fSkuaGFzT3duUHJvcGVydHlcclxuXHJcbiAgICAjIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBlcnJvciwgaWYgaXQgZXhpc3RzXHJcbiAgICBfcmVtb3ZlRXJyb3IgPSAoaWQpIC0+XHJcbiAgICAgIGVycm9ycyA9IF9lcnJvcnMoKVxyXG5cclxuICAgICAgaWYgX2hhc093blByb3AuY2FsbChlcnJvcnMsIGlkKVxyXG4gICAgICAgIGRlbGV0ZSBlcnJvcnNbaWRdXHJcbiAgICAgICAgX2Vycm9ycy52YWx1ZUhhc011dGF0ZWQoKVxyXG5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBSZXR1cm5zIHRydWUgaWZmIHRoZSBzcGVjaWZpZWQgZXJyb3IgZXhpc3RzXHJcbiAgICBfZXJyb3JFeGlzdHMgPSAoaWQpIC0+XHJcbiAgICAgIF9oYXNPd25Qcm9wLmNhbGwoX2Vycm9ycygpLCBpZClcclxuXHJcbiAgICBfZXJyb3JNZXRhRGF0YSA9IChlcnJvcnMsIGlkLCBtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBpZD9cclxuICAgICAgICBtZXRhRGF0YSA9IHtcclxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgIHRhcmdldDogdGFyZ2V0XHJcbiAgICAgICAgICBkaXNwb3NlOiAoKSAtPlxyXG4gICAgICAgICAgICBfcmVtb3ZlRXJyb3IoaWQpXHJcbiAgICAgICAgICBpc0Rpc3Bvc2VkOiAoKSAtPlxyXG4gICAgICAgICAgICBub3QgX2Vycm9yRXhpc3RzKGlkKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlcnJvcnNbaWRdID0gbWVzc2FnZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbWV0YURhdGEgPSB7XHJcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXHJcbiAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxyXG4gICAgICAgICAgZGlzcG9zZTogKCkgLT4gdW5kZWZpbmVkXHJcbiAgICAgICAgICBpc0Rpc3Bvc2VkOiAoKSAtPiB0cnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG1ldGFEYXRhXHJcblxyXG4gICAgIyBBIGxpc3Qgb2YgYWxsIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycyA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6ICgpIC0+XHJcbiAgICAgICAgbWVzc2FnZXMgPSBbXVxyXG5cclxuICAgICAgICBhZGRNZXNzYWdlID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgICBpZiBub3QgbWVzc2FnZT9cclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgICBhZGRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlIGlmIEFycmF5LmlzQXJyYXkobWVzc2FnZSlcclxuICAgICAgICAgICAgZm9yIHN1Yk1lc3NhZ2UgaW4gbWVzc2FnZVxyXG4gICAgICAgICAgICAgIGFkZE1lc3NhZ2Uoc3ViTWVzc2FnZSlcclxuICAgICAgICAgIGVsc2UgaWYgdHlwZW9mIG1lc3NhZ2UgPT0gJ3N0cmluZycgb3IgdHlwZW9mIG1lc3NhZ2UgPT0gJ29iamVjdCdcclxuICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjb25zb2xlPy5hc3NlcnQ/KGZhbHNlLCAnaW52YWxpZCBlcnJvciBtZXNzYWdlJylcclxuXHJcbiAgICAgICAgICByZXR1cm5cclxuXHJcbiAgICAgICAgZm9yIG93biBpZCwgbWVzc2FnZSBvZiBfZXJyb3JzKClcclxuICAgICAgICAgIGFkZE1lc3NhZ2UobWVzc2FnZSlcclxuXHJcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzXHJcblxyXG4gICAgICB3cml0ZTogKG1lc3NhZ2VzKSAtPlxyXG4gICAgICAgIHRhcmdldC5lcnJvcnMuc2V0KG1lc3NhZ2VzKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfSlcclxuXHJcbiAgICAjIEFkZCBhbiBpbmRpdmlkdWFsIGVycm9yXHJcbiAgICB0YXJnZXQuZXJyb3JzLmFkZCA9IChtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBtZXNzYWdlP1xyXG4gICAgICAgIGlkID0gKytfaWRDb3VudGVyXHJcblxyXG4gICAgICBtZXRhRGF0YSA9IF9lcnJvck1ldGFEYXRhKF9lcnJvcnMoKSwgaWQsIG1lc3NhZ2UpXHJcbiAgICAgIF9lcnJvcnMudmFsdWVIYXNNdXRhdGVkKClcclxuXHJcbiAgICAgIHJldHVybiBtZXRhRGF0YVxyXG5cclxuICAgICMgR2V0IHRoZSBmaXJzdCBlcnJvclxyXG4gICAgdGFyZ2V0LmVycm9ycy5nZXQgPSAoKSAtPlxyXG4gICAgICBmaXJzdE1lc3NhZ2UgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGZpbmRNZXNzYWdlID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgaWYgbm90IG1lc3NhZ2U/XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlKClcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KG1lc3NhZ2UpXHJcbiAgICAgICAgICBmb3Igc3ViTWVzc2FnZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKHN1Yk1lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnIG9yIHR5cGVvZiBtZXNzYWdlID09ICdvYmplY3QnXHJcbiAgICAgICAgICBmaXJzdE1lc3NhZ2UgPSBtZXNzYWdlXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvbnNvbGU/LmFzc2VydD8oZmFsc2UsICdpbnZhbGlkIGVycm9yIG1lc3NhZ2UnKVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgIGZvciBvd24gaWQsIG1lc3NhZ2Ugb2YgX2Vycm9ycygpXHJcbiAgICAgICAgaWYgZmluZE1lc3NhZ2UobWVzc2FnZSlcclxuICAgICAgICAgIHJldHVybiBmaXJzdE1lc3NhZ2VcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgICAjIFNldCBhIHNpbmdsZSBlcnJvciwgY2xlYXJpbmcgb3RoZXIgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3JzLnNldCA9IChtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBtZXNzYWdlP1xyXG4gICAgICAgIGlkID0gKytfaWRDb3VudGVyXHJcblxyXG4gICAgICBlcnJvcnMgPSB7fVxyXG4gICAgICBtZXRhRGF0YSA9IF9lcnJvck1ldGFEYXRhKGVycm9ycywgaWQsIG1lc3NhZ2UpXHJcbiAgICAgIF9lcnJvcnMoZXJyb3JzKVxyXG4gICAgICByZXR1cm4gbWV0YURhdGFcclxuXHJcbiAgICB0YXJnZXQuZXJyb3JzLmhhcyA9ICgpIC0+XHJcbiAgICAgIHJldHVybiB0YXJnZXQuZXJyb3IoKT9cclxuXHJcbiAgICAjIENsZWFyIGFsbCB0aGUgY3VycmVudCBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMuY2xlYXIgPSAoKSAtPlxyXG4gICAgICBfZXJyb3JzKHt9KVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICAjIEdldCB0aGUgZmlyc3QgZXJyb3IsIG9yIFNldCBhIHNpbmdsZSBlcnJvciB3aGlsc3QgY2xlYXJpbmcgb3RoZXIgZXJyb3JzXHJcbiAgICB0YXJnZXQuZXJyb3IgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiB0YXJnZXQuZXJyb3JzLmdldFxyXG4gICAgICB3cml0ZTogdGFyZ2V0LmVycm9ycy5zZXRcclxuICAgIH0pXHJcblxyXG4gICAgIyBSZXR1cm4gdHJ1ZSBpZmYgdGhlcmUgYXJlIGFueSBlcnJvcnNcclxuICAgIHRhcmdldC5oYXNFcnJvciA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6IHRhcmdldC5lcnJvcnMuaGFzXHJcbiAgICB9KVxyXG5cclxuICAgICMgUmVtb3ZlIGZhbGxpYmxlIGRhdGEgZnJvbSB0aGUgdGFyZ2V0IG9iamVjdFxyXG4gICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGUgPSAoKSAtPlxyXG4gICAgICBfZXJyb3JzKHt9KVxyXG4gICAgICBkZWxldGUgdGFyZ2V0LmVycm9yXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuZXJyb3JzXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuaGFzRXJyb3JcclxuICAgICAgZGVsZXRlIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgIyBEZXRlcm1pbmUgaWYgaXRlbSBpcyBmYWxsaWJsZVxyXG4gIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlID0gKHRhcmdldCkgLT5cclxuICAgIHJldHVybiB0YXJnZXQuZXJyb3JzPyBhbmQgdGFyZ2V0LmVycm9yP1xyXG5cclxuICBrby5wdXJlRXJyb3JzID0gKHJlYWQsIG93bmVyKSAtPlxyXG4gICAgc3Vic2NyaXB0aW9uID0gdW5kZWZpbmVkXHJcblxyXG4gICAgY29tcHV0ZWQgPSBrby5wdXJlQ29tcHV0ZWQoXHJcbiAgICAgICgpIC0+XHJcbiAgICAgICAgZXJyb3JzID0gW11cclxuICAgICAgICBhZGRFcnJvciA9ICh0YXJnZXQsIG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgICBpZiB0YXJnZXQ/XHJcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5leHRlbmQoeyBmYWxsaWJsZTogdHJ1ZSB9KVxyXG4gICAgICAgICAgICBlcnJvcnMucHVzaCh0YXJnZXQuZXJyb3JzLmFkZChtZXNzYWdlKSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZXJyb3JzLnB1c2goe1xyXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcclxuICAgICAgICAgICAgICBkaXNwb3NlOiAoKSAtPiB1bmRlZmluZWRcclxuICAgICAgICAgICAgICBpc0Rpc3Bvc2VkOiAoKSAtPiB0cnVlXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgIGRpc3Bvc2UgPSAoKSAtPlxyXG4gICAgICAgICAgZm9yIGVycm9yIGluIGVycm9yc1xyXG4gICAgICAgICAgICBlcnJvci5kaXNwb3NlKClcclxuICAgICAgICAgIGVycm9ycyA9IFtdXHJcbiAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXHJcbiAgICAgICAgICBzdWJzY3JpcHRpb24gPSB1bmRlZmluZWRcclxuICAgICAgICAgIHJldHVyblxyXG5cclxuICAgICAgICB0cnlcclxuICAgICAgICAgIHJlYWQuY2FsbChvd25lciwgYWRkRXJyb3IpXHJcbiAgICAgICAgZmluYWxseVxyXG4gICAgICAgICAgc3Vic2NyaXB0aW9uID0gY29tcHV0ZWQuc3Vic2NyaWJlKGRpc3Bvc2UsIG51bGwsICdhc2xlZXAnKVxyXG5cclxuICAgICAgICByZXR1cm4gZXJyb3JzXHJcbiAgICApXHJcblxyXG4gICAgcmV0dXJuIGNvbXB1dGVkXHJcblxyXG4gIHJldHVybiBrb1xyXG5cclxuIl19
