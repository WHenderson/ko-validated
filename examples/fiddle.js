var ko = require('../index');

var o = ko.observable().extend({ fallible: true });
var o2 = ko.observable().extend({ fallible: true });

o.errors.add(o2.errors);

var error = o.errors.add(ko.observable('alakazam!'));
o.errors.add('wooo');
o.errors.add('wooot');

console.log(o.errors());
console.log(o.error());
o = o.extend({ required: true });

error.message('zoop');

console.log(o.errors());
console.log(o.error());

error.dispose();

console.log(o.errors());
console.log(o.error());

o2.error('dang!');

console.log(o.errors());
console.log(o.error());

o('value!');
console.log(o.errors());
console.log(o.error());

