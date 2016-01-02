;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['knockout'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('knockout'));
  } else {
    root.ko = factory(root.ko);
  }
}(this, function(ko) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtvLXZhbGlkYXRlZC5hcHBsaWVkLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7U0FBQSxJQUFBLFFBQUE7RUFBQTs7QUFBQSxRQUFBLEdBQVcsU0FBQyxFQUFEO0FBQ1QsTUFBQTtFQUFBLEVBQUUsQ0FBQyxTQUFILEdBQWU7RUFHVDtJQUNTLG9CQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLE9BQWxCLEVBQTJCLE9BQTNCLEVBQW9DLFVBQXBDO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsVUFBRDtNQUFVLElBQUMsQ0FBQSxTQUFEO01BQzdCLElBQUcsZUFBSDtRQUNFLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFEYjs7TUFFQSxJQUFHLGtCQUFIO1FBQ0UsSUFBQyxDQUFBLFVBQUQsR0FBYyxXQURoQjs7SUFIVzs7eUJBTWIsT0FBQSxHQUFTLFNBQUEsR0FBQTs7eUJBR1QsVUFBQSxHQUFZLFNBQUE7QUFDVixhQUFPO0lBREc7Ozs7O0VBR2QsVUFBQSxHQUFhO0VBQ2IsV0FBQSxHQUFjLFNBQUE7V0FDWixFQUFFO0VBRFU7RUFHZCxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQWIsR0FBd0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUV0QixRQUFBO0lBQUEsSUFBRyxPQUFBLEtBQVcsS0FBZDs7UUFDRSxNQUFNLENBQUM7O0FBQ1AsYUFBTyxPQUZUOztJQUtBLElBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBdEIsQ0FBaUMsTUFBakMsQ0FBSDtBQUNFLGFBQU8sT0FEVDs7SUFJQSxPQUFBLEdBQVUsRUFBRSxDQUFDLFVBQUgsQ0FBYyxFQUFkO0lBQ1YsTUFBQSxHQUFTO0lBR1QsV0FBQSxHQUFlLEVBQUcsQ0FBQztJQUduQixZQUFBLEdBQWUsU0FBQyxFQUFELEVBQUssT0FBTDtBQUNiLFVBQUE7TUFBQSxJQUFHLE9BQU8sRUFBUCxLQUFhLFFBQWhCO1FBQ0UsSUFBRyxFQUFFLENBQUMsY0FBSCxDQUFrQixNQUFsQixFQUEwQixFQUExQixDQUFIO1VBQ0UsSUFBQSxHQUFPO1VBQ1AsRUFBQSxHQUFLLE1BQU8sQ0FBQSxFQUFBO1VBQ1osT0FBTyxNQUFPLENBQUEsSUFBQSxFQUhoQjtTQUFBLE1BQUE7VUFLRSxFQUFBLEdBQUssT0FMUDtTQURGOztNQVFBLElBQUcsVUFBSDtRQUNFLE1BQUEsR0FBUyxPQUFBLENBQUE7UUFFVCxJQUFHLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLEVBQXlCLEVBQXpCLENBQUg7VUFDRSxPQUFPLE1BQU8sQ0FBQSxFQUFBO1VBRWQsSUFBRyxPQUFBLEtBQVcsS0FBZDtZQUNFLE9BQU8sQ0FBQyxlQUFSLENBQUEsRUFERjtXQUhGO1NBSEY7O0lBVGE7SUFxQmYsWUFBQSxHQUFlLFNBQUMsRUFBRDthQUNiLFdBQVcsQ0FBQyxJQUFaLENBQWlCLE9BQUEsQ0FBQSxDQUFqQixFQUE0QixFQUE1QjtJQURhO0lBR2YsY0FBQSxHQUFpQixTQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLElBQWxCLEVBQXdCLE9BQXhCO0FBQ2YsVUFBQTtNQUFBLElBQUcsZUFBSDtRQUNFLEVBQUEsR0FBSyxXQUFBLENBQUE7UUFFTCxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUNmLElBRGUsRUFFZixPQUZlLEVBR2YsTUFIZSxFQUlmLFNBQUE7aUJBQU0sWUFBQSxnQkFBYSxPQUFPLEVBQXBCO1FBQU4sQ0FKZSxFQUtmLFNBQUE7aUJBQU0sQ0FBSSxZQUFBLENBQWEsRUFBYjtRQUFWLENBTGU7UUFRakIsSUFBRyxPQUFPLElBQVAsS0FBZSxRQUFsQjtVQUNFLElBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFsQixDQUF1QixNQUF2QixFQUErQixJQUEvQixDQUFIO1lBQ0UsWUFBQSxDQUFhLE1BQU8sQ0FBQSxJQUFBLENBQXBCLEVBQTJCLEtBQTNCLEVBREY7O1VBR0EsTUFBTyxDQUFBLElBQUEsQ0FBUCxHQUFlLEdBSmpCOztRQU1BLE1BQU8sQ0FBQSxFQUFBLENBQVAsR0FBYTtRQUViLElBQUcsT0FBQSxLQUFXLEtBQWQ7VUFDRSxPQUFPLENBQUMsZUFBUixDQUFBLEVBREY7U0FuQkY7T0FBQSxNQUFBO1FBc0JFLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQ2YsSUFEZSxFQUVmLE9BRmUsRUFHZixNQUhlO1FBTWpCLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CLEVBNUJGOztBQThCQSxhQUFPO0lBL0JRO0lBa0NqQixNQUFNLENBQUMsTUFBUCxHQUFnQixFQUFFLENBQUMsWUFBSCxDQUFnQjtNQUM5QixJQUFBLEVBQU0sU0FBQTtBQUNKLFlBQUE7UUFBQSxRQUFBLEdBQVc7UUFFWCxlQUFBLEdBQWtCLFNBQUMsT0FBRDtBQUNoQixjQUFBO1VBQUEsSUFBTyxlQUFQO0FBQ0UsbUJBREY7V0FBQSxNQUVLLElBQUcsT0FBTyxPQUFQLEtBQWtCLFVBQXJCO1lBQ0gsT0FBQSxHQUFVLE9BQUEsQ0FBQTtZQUNWLGVBQUEsQ0FBZ0IsT0FBaEIsRUFGRztXQUFBLE1BR0EsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLE9BQWQsQ0FBSDtBQUNILGlCQUFBLHlDQUFBOztjQUNFLGVBQUEsQ0FBZ0IsVUFBaEI7QUFERixhQURHO1dBQUEsTUFHQSxJQUFHLE9BQU8sT0FBUCxLQUFrQixRQUFsQixJQUE4QixPQUFPLE9BQVAsS0FBa0IsUUFBbkQ7WUFDSCxRQUFRLENBQUMsSUFBVCxDQUFjLE9BQWQsRUFERztXQUFBLE1BQUE7OztnQkFHSCxPQUFPLENBQUUsT0FBUSxPQUFPOzthQUhyQjs7UUFUVztBQWdCbEI7QUFBQSxhQUFBLFNBQUE7OztVQUNFLGVBQUEsQ0FBZ0IsT0FBaEI7QUFERjtBQUdBLGVBQU87TUF0QkgsQ0FEd0I7TUF5QjlCLEtBQUEsRUFBTyxTQUFDLFFBQUQ7UUFDTCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQWQsQ0FBa0IsUUFBbEI7TUFESyxDQXpCdUI7S0FBaEI7SUErQmhCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBZCxHQUFvQixTQUFDLElBQUQsRUFBTyxPQUFQO01BQ2xCLElBQUcsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBdkI7UUFDRSxPQUFBLEdBQVU7UUFDVixJQUFBLEdBQU8sT0FGVDs7QUFJQSxhQUFPLGNBQUEsQ0FBZSxPQUFBLENBQUEsQ0FBZixFQUEwQixPQUExQixFQUFtQyxJQUFuQyxFQUF5QyxJQUF6QztJQUxXO0lBUXBCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBZCxHQUFvQixTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ2xCLFVBQUE7TUFBQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLENBQXZCO1FBQ0UsT0FBQSxHQUFVO1FBQ1YsSUFBQSxHQUFPLE9BRlQ7O01BSUEsTUFBQSxHQUFTO01BQ1QsTUFBQSxHQUFTO01BQ1QsVUFBQSxHQUFhLGNBQUEsQ0FBZSxNQUFmLEVBQXVCLE9BQXZCLEVBQWdDLElBQWhDLEVBQXNDLEtBQXRDO01BQ2IsT0FBQSxDQUFRLE1BQVI7QUFDQSxhQUFPO0lBVFc7SUFZcEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFkLEdBQW9CLFNBQUMsSUFBRDtBQUNsQixVQUFBO01BQUEsWUFBQSxHQUFlO01BRWYsV0FBQSxHQUFjLFNBQUMsT0FBRDtBQUNaLFlBQUE7UUFBQSxJQUFPLGVBQVA7QUFDRSxpQkFBTyxNQURUO1NBQUEsTUFFSyxJQUFHLE9BQU8sT0FBUCxLQUFrQixVQUFyQjtVQUNILE9BQUEsR0FBVSxPQUFBLENBQUE7VUFDVixJQUFHLFdBQUEsQ0FBWSxPQUFaLENBQUg7QUFDRSxtQkFBTyxLQURUO1dBRkc7U0FBQSxNQUlBLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxPQUFkLENBQUg7QUFDSCxlQUFBLHlDQUFBOztZQUNFLElBQUcsV0FBQSxDQUFZLFVBQVosQ0FBSDtBQUNFLHFCQUFPLEtBRFQ7O0FBREYsV0FERztTQUFBLE1BSUEsSUFBRyxPQUFPLE9BQVAsS0FBa0IsUUFBbEIsSUFBOEIsT0FBTyxPQUFQLEtBQWtCLFFBQW5EO1VBQ0gsWUFBQSxHQUFlO0FBQ2YsaUJBQU8sS0FGSjtTQUFBLE1BQUE7OztjQUlILE9BQU8sQ0FBRSxPQUFRLE9BQU87O1dBSnJCOztBQU1MLGVBQU87TUFqQks7TUFtQmQsSUFBRyxPQUFPLElBQVAsS0FBZSxRQUFsQjtRQUNFLElBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFsQixDQUF1QixNQUF2QixFQUErQixJQUEvQixDQUFIO1VBQ0UsSUFBRyxXQUFBLENBQVksT0FBQSxDQUFBLENBQVUsQ0FBQSxNQUFPLENBQUEsSUFBQSxDQUFQLENBQXRCLENBQUg7QUFDRSxtQkFBTyxhQURUO1dBREY7U0FERjtPQUFBLE1BQUE7QUFLRTtBQUFBLGFBQUEsU0FBQTs7O1VBQ0UsSUFBRyxXQUFBLENBQVksT0FBWixDQUFIO0FBQ0UsbUJBQU8sYUFEVDs7QUFERixTQUxGOztBQVNBLGFBQU87SUEvQlc7SUFpQ3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBZCxHQUFvQixTQUFDLElBQUQ7QUFDbEIsYUFBTztJQURXO0lBR3BCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBZCxHQUF1QixTQUFDLElBQUQ7TUFDckIsSUFBRyxPQUFPLElBQVAsS0FBZSxRQUFsQjtRQUNFLFlBQUEsQ0FBYSxJQUFiLEVBREY7O0lBRHFCO0lBT3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBZCxHQUFzQixTQUFBO01BQ3BCLE1BQUEsR0FBUztNQUNULE9BQUEsQ0FBUSxFQUFSO0lBRm9CO0lBTXRCLE1BQU0sQ0FBQyxLQUFQLEdBQWUsRUFBRSxDQUFDLFlBQUgsQ0FBZ0I7TUFDN0IsSUFBQSxFQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FEUztNQUU3QixLQUFBLEVBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUZRO0tBQWhCO0lBTWYsTUFBTSxDQUFDLFFBQVAsR0FBa0IsRUFBRSxDQUFDLFlBQUgsQ0FBZ0I7TUFDaEMsSUFBQSxFQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FEWTtLQUFoQjtJQUtsQixNQUFNLENBQUMsZ0JBQVAsR0FBMEIsU0FBQTtNQUN4QixPQUFBLENBQVEsRUFBUjtNQUNBLE9BQU8sTUFBTSxDQUFDO01BQ2QsT0FBTyxNQUFNLENBQUM7TUFDZCxPQUFPLE1BQU0sQ0FBQztNQUNkLE9BQU8sTUFBTSxDQUFDO0lBTFU7QUFRMUIsV0FBTztFQW5NZTtFQXNNeEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBdEIsR0FBbUMsU0FBQyxNQUFEO0FBQ2pDLFdBQU8sdUJBQUEsSUFBbUI7RUFETztFQUduQyxlQUFBLEdBQXFCLENBQUEsU0FBQTtBQUNuQixRQUFBO0lBQUEsUUFBQSxHQUFjLENBQUEsU0FBQTtBQUNaLFVBQUE7TUFBQSxDQUFBLEdBQUksRUFBRSxDQUFDLFFBQUgsQ0FBWSxTQUFBLEdBQUEsQ0FBWjtNQUNKLElBQUcsb0NBQUg7QUFDRTtBQUFBLGFBQUEscUNBQUE7O1VBQ0UsSUFBRyxNQUFBLENBQU8sTUFBUCxDQUFBLEtBQWtCLGdCQUFyQjtBQUNFLG1CQUFPLE9BRFQ7O0FBREYsU0FERjs7TUFLQSxJQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBbEIsQ0FBdUIsQ0FBdkIsRUFBMEIsUUFBMUIsQ0FBSDtBQUNFLGVBQU8sU0FEVDs7SUFQWSxDQUFBLENBQUgsQ0FBQTtJQVlYLE1BQUEsR0FBWSxDQUFBLFNBQUE7QUFDVixVQUFBO01BQUEsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxVQUFILENBQUE7TUFDSixDQUFBLEdBQUksRUFBRSxDQUFDLFFBQUgsQ0FBWTtRQUNkLElBQUEsRUFBTSxTQUFBO2lCQUFNLENBQUEsQ0FBQTtRQUFOLENBRFE7T0FBWjtBQUdKO0FBQUEsV0FBQSxVQUFBOzs7UUFDRSxJQUFHLGFBQUEsSUFBUyxPQUFPLEdBQVAsS0FBYyxRQUExQjtBQUNFLGlCQUFPLElBRFQ7O0FBREY7SUFMVSxDQUFBLENBQUgsQ0FBQTtBQVVULFdBQU8sU0FBQyxNQUFEO01BQ0wsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLE1BQWQsQ0FBSDtBQUNFLGVBQU8sTUFBTyxDQUFBLFFBQUEsQ0FBVSxDQUFBLE1BQUEsRUFEMUI7T0FBQSxNQUFBO0FBR0UsZUFBTyxHQUhUOztJQURLO0VBdkJZLENBQUEsQ0FBSCxDQUFBO0VBNkJsQixFQUFFLENBQUMsU0FBUyxDQUFDLFlBQWIsR0FBNEIsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUMxQixRQUFBO0lBQUEsSUFBRyxDQUFJLEVBQUUsQ0FBQyxVQUFILENBQWMsTUFBZCxDQUFQO0FBQ0UsYUFBTyxPQURUOztJQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWM7TUFBRSxRQUFBLEVBQVUsSUFBWjtLQUFkO0lBRUEsSUFBRyxPQUFBLEtBQVcsS0FBZDs7UUFDRSxNQUFNLENBQUM7O0FBQ1AsYUFGRjs7SUFJQSxTQUFBLEdBQVksU0FBQyxNQUFELEVBQVMsUUFBVDtBQUNWLFVBQUE7QUFBQTtBQUFBLFdBQUEsVUFBQTs7O1FBQ0UsVUFBQSxHQUFhLFVBQVUsQ0FBQztRQUN4QixJQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQXRCLENBQWlDLFVBQWpDLENBQUg7VUFDRSxJQUFHLE1BQU0sQ0FBQyxPQUFQLENBQWUsVUFBVSxDQUFDLE1BQTFCLENBQUEsS0FBcUMsQ0FBQyxDQUF6QztZQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksVUFBVSxDQUFDLE1BQXZCLEVBREY7V0FERjs7UUFJQSxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFIO1VBQ0UsU0FBQSxDQUFVLE1BQVYsRUFBa0IsVUFBbEIsRUFERjs7QUFORjtBQVNBLGFBQU87SUFWRztJQVlaLE1BQUEsR0FBUyxTQUFBO0FBQ1A7QUFHRSxlQUFPLFNBQUEsQ0FBVSxFQUFWLEVBQWMsTUFBZCxFQUhUO09BQUE7QUFBQTs7SUFETztJQVFULFVBQUEsR0FBYSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQWQsQ0FBa0IsTUFBbEI7SUFFYixNQUFNLENBQUMsb0JBQVAsR0FBOEIsU0FBQTtNQUM1QixJQUFHLGtCQUFIO1FBQ0UsVUFBVSxDQUFDLE9BQVgsQ0FBQTtRQUNBLFVBQUEsR0FBYSxPQUZmOztJQUQ0QjtBQU05QixXQUFPO0VBdENtQjtBQXlDNUIsU0FBTztBQXBTRTs7QUFzU1gsUUFBQSxDQUFTLEVBQVQiLCJmaWxlIjoia28tdmFsaWRhdGVkLmFwcGxpZWQudW1kLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiYXBwbHlLb3YgPSAoa28pIC0+XHJcbiAga28udmFsaWRhdGVkID0ge31cclxuXHJcblxyXG4gIGNsYXNzIERpc3Bvc2FibGVcclxuICAgIGNvbnN0cnVjdG9yOiAoQG5hbWUsIEBtZXNzYWdlLCBAdGFyZ2V0LCBkaXNwb3NlLCBpc0Rpc3Bvc2VkKSAtPlxyXG4gICAgICBpZiBkaXNwb3NlP1xyXG4gICAgICAgIEBkaXNwb3NlID0gZGlzcG9zZVxyXG4gICAgICBpZiBpc0Rpc3Bvc2VkP1xyXG4gICAgICAgIEBpc0Rpc3Bvc2VkID0gaXNEaXNwb3NlZFxyXG5cclxuICAgIGRpc3Bvc2U6ICgpIC0+XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGlzRGlzcG9zZWQ6ICgpIC0+XHJcbiAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gIF9pZENvdW50ZXIgPSAwXHJcbiAgZ2V0VW5pcXVlSWQgPSAoKSAtPlxyXG4gICAgKytfaWRDb3VudGVyXHJcblxyXG4gIGtvLmV4dGVuZGVycy5mYWxsaWJsZSA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICAjIERpc3Bvc2U/XHJcbiAgICBpZiBvcHRpb25zID09IGZhbHNlXHJcbiAgICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlPygpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICAjIEFscmVhZHkgY29uc3RydWN0ZWRcclxuICAgIGlmIGtvLmV4dGVuZGVycy5mYWxsaWJsZS5pc0ZhbGxpYmxlKHRhcmdldClcclxuICAgICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAgICMgY29udGFpbnMgdGhlIGVycm9ycyBmb3IgdGFyZ2V0XHJcbiAgICBfZXJyb3JzID0ga28ub2JzZXJ2YWJsZSh7fSlcclxuICAgIF9uYW1lZCA9IHt9XHJcblxyXG4gICAgIyBoZWxwZXIgZm9yIGNhbGxpbmcgaGFzT3duUHJvcGVydHlcclxuICAgIF9oYXNPd25Qcm9wID0gKHt9KS5oYXNPd25Qcm9wZXJ0eVxyXG5cclxuICAgICMgUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGVycm9yLCBpZiBpdCBleGlzdHNcclxuICAgIF9yZW1vdmVFcnJvciA9IChpZCwgdHJpZ2dlcikgLT5cclxuICAgICAgaWYgdHlwZW9mIGlkID09ICdzdHJpbmcnXHJcbiAgICAgICAgaWYge30uaGFzT3duUHJvcGVydHkoX25hbWVkLCBpZClcclxuICAgICAgICAgIG5hbWUgPSBpZFxyXG4gICAgICAgICAgaWQgPSBfbmFtZWRbaWRdXHJcbiAgICAgICAgICBkZWxldGUgX25hbWVkW25hbWVdXHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgaWQgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGlmIGlkP1xyXG4gICAgICAgIGVycm9ycyA9IF9lcnJvcnMoKVxyXG5cclxuICAgICAgICBpZiBfaGFzT3duUHJvcC5jYWxsKGVycm9ycywgaWQpXHJcbiAgICAgICAgICBkZWxldGUgZXJyb3JzW2lkXVxyXG5cclxuICAgICAgICAgIGlmIHRyaWdnZXIgIT0gZmFsc2VcclxuICAgICAgICAgICAgX2Vycm9ycy52YWx1ZUhhc011dGF0ZWQoKVxyXG5cclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgIyBSZXR1cm5zIHRydWUgaWZmIHRoZSBzcGVjaWZpZWQgZXJyb3IgZXhpc3RzXHJcbiAgICBfZXJyb3JFeGlzdHMgPSAoaWQpIC0+XHJcbiAgICAgIF9oYXNPd25Qcm9wLmNhbGwoX2Vycm9ycygpLCBpZClcclxuXHJcbiAgICBfcmVnaXN0ZXJFcnJvciA9IChlcnJvcnMsIG1lc3NhZ2UsIG5hbWUsIHRyaWdnZXIpIC0+XHJcbiAgICAgIGlmIG1lc3NhZ2U/XHJcbiAgICAgICAgaWQgPSBnZXRVbmlxdWVJZCgpXHJcblxyXG4gICAgICAgIGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZShcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBtZXNzYWdlXHJcbiAgICAgICAgICB0YXJnZXRcclxuICAgICAgICAgICgpIC0+IF9yZW1vdmVFcnJvcihuYW1lID8gaWQpXHJcbiAgICAgICAgICAoKSAtPiBub3QgX2Vycm9yRXhpc3RzKGlkKVxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgaWYgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZydcclxuICAgICAgICAgIGlmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoX25hbWVkLCBuYW1lKVxyXG4gICAgICAgICAgICBfcmVtb3ZlRXJyb3IoX25hbWVkW25hbWVdLCBmYWxzZSlcclxuXHJcbiAgICAgICAgICBfbmFtZWRbbmFtZV0gPSBpZFxyXG5cclxuICAgICAgICBlcnJvcnNbaWRdID0gbWVzc2FnZVxyXG5cclxuICAgICAgICBpZiB0cmlnZ2VyICE9IGZhbHNlXHJcbiAgICAgICAgICBfZXJyb3JzLnZhbHVlSGFzTXV0YXRlZCgpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoXHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgbWVzc2FnZSxcclxuICAgICAgICAgIHRhcmdldFxyXG4gICAgICAgIClcclxuXHJcbiAgICAgICAgX3JlbW92ZUVycm9yKG5hbWUsIHRyaWdnZXIpXHJcblxyXG4gICAgICByZXR1cm4gZGlzcG9zYWJsZVxyXG5cclxuICAgICMgQSBsaXN0IG9mIGFsbCBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvcnMgPSBrby5wdXJlQ29tcHV0ZWQoe1xyXG4gICAgICByZWFkOiAoKSAtPlxyXG4gICAgICAgIG1lc3NhZ2VzID0gW11cclxuXHJcbiAgICAgICAgY29sbGVjdE1lc3NhZ2VzID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgICBpZiBub3QgbWVzc2FnZT9cclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UoKVxyXG4gICAgICAgICAgICBjb2xsZWN0TWVzc2FnZXMobWVzc2FnZSlcclxuICAgICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheShtZXNzYWdlKVxyXG4gICAgICAgICAgICBmb3Igc3ViTWVzc2FnZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgY29sbGVjdE1lc3NhZ2VzKHN1Yk1lc3NhZ2UpXHJcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnIG9yIHR5cGVvZiBtZXNzYWdlID09ICdvYmplY3QnXHJcbiAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29uc29sZT8uYXNzZXJ0PyhmYWxzZSwgJ2ludmFsaWQgZXJyb3IgbWVzc2FnZScpXHJcblxyXG4gICAgICAgICAgcmV0dXJuXHJcblxyXG4gICAgICAgIGZvciBvd24gaWQsIG1lc3NhZ2Ugb2YgX2Vycm9ycygpXHJcbiAgICAgICAgICBjb2xsZWN0TWVzc2FnZXMobWVzc2FnZSlcclxuXHJcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VzXHJcblxyXG4gICAgICB3cml0ZTogKG1lc3NhZ2VzKSAtPlxyXG4gICAgICAgIHRhcmdldC5lcnJvcnMuc2V0KG1lc3NhZ2VzKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfSlcclxuXHJcbiAgICAjIEFkZCBhbiBpbmRpdmlkdWFsIGVycm9yXHJcbiAgICB0YXJnZXQuZXJyb3JzLmFkZCA9IChuYW1lLCBtZXNzYWdlKSAtPlxyXG4gICAgICBpZiBhcmd1bWVudHMubGVuZ3RoID09IDFcclxuICAgICAgICBtZXNzYWdlID0gbmFtZVxyXG4gICAgICAgIG5hbWUgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIHJldHVybiBfcmVnaXN0ZXJFcnJvcihfZXJyb3JzKCksIG1lc3NhZ2UsIG5hbWUsIHRydWUpXHJcblxyXG4gICAgIyBTZXQgYSBzaW5nbGUgZXJyb3IsIGNsZWFyaW5nIG90aGVyIGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycy5zZXQgPSAobmFtZSwgbWVzc2FnZSkgLT5cclxuICAgICAgaWYgYXJndW1lbnRzLmxlbmd0aCA9PSAxXHJcbiAgICAgICAgbWVzc2FnZSA9IG5hbWVcclxuICAgICAgICBuYW1lID0gdW5kZWZpbmVkXHJcblxyXG4gICAgICBlcnJvcnMgPSB7fVxyXG4gICAgICBfbmFtZWQgPSB7fVxyXG4gICAgICBkaXNwb3NhYmxlID0gX3JlZ2lzdGVyRXJyb3IoZXJyb3JzLCBtZXNzYWdlLCBuYW1lLCBmYWxzZSlcclxuICAgICAgX2Vycm9ycyhlcnJvcnMpXHJcbiAgICAgIHJldHVybiBkaXNwb3NhYmxlXHJcblxyXG4gICAgIyBHZXQgdGhlIGZpcnN0IGVycm9yXHJcbiAgICB0YXJnZXQuZXJyb3JzLmdldCA9IChuYW1lKSAtPlxyXG4gICAgICBmaXJzdE1lc3NhZ2UgPSB1bmRlZmluZWRcclxuXHJcbiAgICAgIGZpbmRNZXNzYWdlID0gKG1lc3NhZ2UpIC0+XHJcbiAgICAgICAgaWYgbm90IG1lc3NhZ2U/XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdmdW5jdGlvbidcclxuICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlKClcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5KG1lc3NhZ2UpXHJcbiAgICAgICAgICBmb3Igc3ViTWVzc2FnZSBpbiBtZXNzYWdlXHJcbiAgICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKHN1Yk1lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICBlbHNlIGlmIHR5cGVvZiBtZXNzYWdlID09ICdzdHJpbmcnIG9yIHR5cGVvZiBtZXNzYWdlID09ICdvYmplY3QnXHJcbiAgICAgICAgICBmaXJzdE1lc3NhZ2UgPSBtZXNzYWdlXHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNvbnNvbGU/LmFzc2VydD8oZmFsc2UsICdpbnZhbGlkIGVycm9yIG1lc3NhZ2UnKVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuXHJcbiAgICAgIGlmIHR5cGVvZiBuYW1lID09ICdzdHJpbmcnXHJcbiAgICAgICAgaWYge30uaGFzT3duUHJvcGVydHkuY2FsbChfbmFtZWQsIG5hbWUpXHJcbiAgICAgICAgICBpZiBmaW5kTWVzc2FnZShfZXJyb3JzKClbX25hbWVkW25hbWVdXSlcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0TWVzc2FnZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZm9yIG93biBpZCwgbWVzc2FnZSBvZiBfZXJyb3JzKClcclxuICAgICAgICAgIGlmIGZpbmRNZXNzYWdlKG1lc3NhZ2UpXHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdE1lc3NhZ2VcclxuXHJcbiAgICAgIHJldHVybiB1bmRlZmluZWRcclxuXHJcbiAgICB0YXJnZXQuZXJyb3JzLmhhcyA9IChuYW1lKSAtPlxyXG4gICAgICByZXR1cm4gdGFyZ2V0LmVycm9ycy5nZXQobmFtZSk/XHJcblxyXG4gICAgdGFyZ2V0LmVycm9ycy5yZW1vdmUgPSAobmFtZSkgLT5cclxuICAgICAgaWYgdHlwZW9mIG5hbWUgPT0gJ3N0cmluZydcclxuICAgICAgICBfcmVtb3ZlRXJyb3IobmFtZSlcclxuXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgQ2xlYXIgYWxsIHRoZSBjdXJyZW50IGVycm9yc1xyXG4gICAgdGFyZ2V0LmVycm9ycy5jbGVhciA9ICgpIC0+XHJcbiAgICAgIF9uYW1lZCA9IHt9XHJcbiAgICAgIF9lcnJvcnMoe30pXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgICMgR2V0IHRoZSBmaXJzdCBlcnJvciwgb3IgU2V0IGEgc2luZ2xlIGVycm9yIHdoaWxzdCBjbGVhcmluZyBvdGhlciBlcnJvcnNcclxuICAgIHRhcmdldC5lcnJvciA9IGtvLnB1cmVDb21wdXRlZCh7XHJcbiAgICAgIHJlYWQ6IHRhcmdldC5lcnJvcnMuZ2V0XHJcbiAgICAgIHdyaXRlOiB0YXJnZXQuZXJyb3JzLnNldFxyXG4gICAgfSlcclxuXHJcbiAgICAjIFJldHVybiB0cnVlIGlmZiB0aGVyZSBhcmUgYW55IGVycm9yc1xyXG4gICAgdGFyZ2V0Lmhhc0Vycm9yID0ga28ucHVyZUNvbXB1dGVkKHtcclxuICAgICAgcmVhZDogdGFyZ2V0LmVycm9ycy5oYXNcclxuICAgIH0pXHJcblxyXG4gICAgIyBSZW1vdmUgZmFsbGlibGUgZGF0YSBmcm9tIHRoZSB0YXJnZXQgb2JqZWN0XHJcbiAgICB0YXJnZXQuX2Rpc3Bvc2VGYWxsaWJsZSA9ICgpIC0+XHJcbiAgICAgIF9lcnJvcnMoe30pXHJcbiAgICAgIGRlbGV0ZSB0YXJnZXQuZXJyb3JcclxuICAgICAgZGVsZXRlIHRhcmdldC5lcnJvcnNcclxuICAgICAgZGVsZXRlIHRhcmdldC5oYXNFcnJvclxyXG4gICAgICBkZWxldGUgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuIHRhcmdldFxyXG5cclxuICAjIERldGVybWluZSBpZiBpdGVtIGlzIGZhbGxpYmxlXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlLmlzRmFsbGlibGUgPSAodGFyZ2V0KSAtPlxyXG4gICAgcmV0dXJuIHRhcmdldC5lcnJvcnM/IGFuZCB0YXJnZXQuZXJyb3I/XHJcblxyXG4gIGdldERlcGVuZGVuY2llcyA9IGRvIC0+XHJcbiAgICBzeW1TdGF0ZSA9IGRvIC0+XHJcbiAgICAgIGMgPSBrby5jb21wdXRlZCgoKSAtPiByZXR1cm4pXHJcbiAgICAgIGlmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM/XHJcbiAgICAgICAgZm9yIHN5bWJvbCBpbiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGMpXHJcbiAgICAgICAgICBpZiBTdHJpbmcoc3ltYm9sKSA9PSAnU3ltYm9sKF9zdGF0ZSknXHJcbiAgICAgICAgICAgIHJldHVybiBzeW1ib2xcclxuXHJcbiAgICAgIGlmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoYywgJ19zdGF0ZScpXHJcbiAgICAgICAgcmV0dXJuICdfc3RhdGUnXHJcblxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBkZXBLZXkgPSBkbyAtPlxyXG4gICAgICBvID0ga28ub2JzZXJ2YWJsZSgpXHJcbiAgICAgIGMgPSBrby5jb21wdXRlZCh7XHJcbiAgICAgICAgcmVhZDogKCkgLT4gbygpXHJcbiAgICAgIH0pXHJcbiAgICAgIGZvciBvd24ga2V5LCB2YWwgb2YgY1tzeW1TdGF0ZV1cclxuICAgICAgICBpZiB2YWw/IGFuZCB0eXBlb2YgdmFsID09ICdvYmplY3QnXHJcbiAgICAgICAgICByZXR1cm4ga2V5XHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIHJldHVybiAodGFyZ2V0KSAtPlxyXG4gICAgICBpZiBrby5pc0NvbXB1dGVkKHRhcmdldClcclxuICAgICAgICByZXR1cm4gdGFyZ2V0W3N5bVN0YXRlXVtkZXBLZXldXHJcbiAgICAgIGVsc2VcclxuICAgICAgICByZXR1cm4ge31cclxuXHJcbiAga28uZXh0ZW5kZXJzLmZhbGxpYmxlUmVhZCA9ICh0YXJnZXQsIG9wdGlvbnMpIC0+XHJcbiAgICBpZiBub3Qga28uaXNDb21wdXRlZCh0YXJnZXQpXHJcbiAgICAgIHJldHVybiB0YXJnZXRcclxuXHJcbiAgICB0YXJnZXQuZXh0ZW5kKHsgZmFsbGlibGU6IHRydWUgfSlcclxuXHJcbiAgICBpZiBvcHRpb25zID09IGZhbHNlXHJcbiAgICAgIHRhcmdldC5fZGlzcG9zZUZhbGxpYmxlUmVhZD8oKVxyXG4gICAgICByZXR1cm5cclxuXHJcbiAgICBmaW5kSW5uZXIgPSAob3V0cHV0LCBjb21wdXRlZCkgLT5cclxuICAgICAgZm9yIG93biBrZXksIGRlcGVuZGVuY3kgb2YgZ2V0RGVwZW5kZW5jaWVzKGNvbXB1dGVkKVxyXG4gICAgICAgIGRlcGVuZGVuY3kgPSBkZXBlbmRlbmN5Ll90YXJnZXRcclxuICAgICAgICBpZiBrby5leHRlbmRlcnMuZmFsbGlibGUuaXNGYWxsaWJsZShkZXBlbmRlbmN5KVxyXG4gICAgICAgICAgaWYgb3V0cHV0LmluZGV4T2YoZGVwZW5kZW5jeS5lcnJvcnMpID09IC0xXHJcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKGRlcGVuZGVuY3kuZXJyb3JzKVxyXG5cclxuICAgICAgICBpZiBrby5pc0NvbXB1dGVkKGRlcGVuZGVuY3kpXHJcbiAgICAgICAgICBmaW5kSW5uZXIob3V0cHV0LCBkZXBlbmRlbmN5KVxyXG5cclxuICAgICAgcmV0dXJuIG91dHB1dFxyXG5cclxuICAgIGVycm9ycyA9ICgpIC0+XHJcbiAgICAgIHRyeVxyXG4gICAgICAgICNzdWJzY3JpcHRpb24gPSB0YXJnZXQuc3Vic2NyaWJlKCgpIC0+IHJldHVybilcclxuICAgICAgICAjdGFyZ2V0KClcclxuICAgICAgICByZXR1cm4gZmluZElubmVyKFtdLCB0YXJnZXQpXHJcbiAgICAgIGZpbmFsbHlcclxuICAgICAgICAjc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxyXG5cclxuICAgIGRpc3Bvc2FibGUgPSB0YXJnZXQuZXJyb3JzLmFkZChlcnJvcnMpXHJcblxyXG4gICAgdGFyZ2V0Ll9kaXNwb3NlRmFsbGlibGVSZWFkID0gKCkgLT5cclxuICAgICAgaWYgZGlzcG9zYWJsZT9cclxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxyXG4gICAgICAgIGRpc3Bvc2FibGUgPSB1bmRlZmluZWRcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgcmV0dXJuIHRhcmdldFxyXG5cclxuXHJcbiAgcmV0dXJuIGtvXHJcblxyXG5hcHBseUtvdihrbylcclxuIl19
