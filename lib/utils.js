var _ = require('underscore');

function extend (instance_members, class_members) {
  var parent = this;
  var child;

  if (instance_members && _.has(instance_members, 'constructor')) {
    child = instance_members.constructor;
  } else {
    child = function () {
      return parent.apply(this, arguments);
    };
  }

  _.extend(child, parent, class_members);

  var Surrogate = function () {
    this.constructor = child;
  };

  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  if (instance_members) {
    _.extend(child.prototype, instance_members);
  }

  child.__super__ = parent.prototype;

  return child;
}

function endsWith (str, needle) {
  return str.indexOf(needle, str.length - needle.length) !== -1;
}

function startsWith (str, needle) {
  return str.indexOf(needle) === 0;
}

module.exports.extend = extend;
module.exports.startsWith = startsWith;
module.exports.endsWith = endsWith;
