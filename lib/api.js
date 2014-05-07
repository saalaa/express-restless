var _ = require('underscore');
var http = require('./http');

var defaults = {
  jsonp: true,
  headers: {
    'content-type': 'application/json'
  }
};

function api (options) {

  options = options || {};

  _.defaults(options, defaults);

  function respond (status, data, more) {
    if (typeof http.status[status] === 'undefined') {
      status = 'InternalServerError';
      data = null;
    }

    this.status(http.status[status].code);
    this.set(options.headers);

    var payload = {
      status: status,
      data: data
    };

    if (more) {
      _.extend(payload, more);
    }

    if (options.jsonp && this.jsonp) {
      this.jsonp(payload);
    } else {
      this.send(payload);
    }
  }

  return function (req, res, next) {
    res.respond = respond.bind(res);
    next();
  };

}

module.exports = api;
