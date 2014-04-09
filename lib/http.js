var _ = require('underscore');
var http = require('http');

module.exports.status = {};

_.each(http.STATUS_CODES, function (status, code) {
  module.exports.status[status.replace(/[ '-]/g, '')] = {
    status: status,
    code: code
  };
});
