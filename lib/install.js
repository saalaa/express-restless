var notFound = require('./notFound');
var respond = require('./respond');

function install (endpoint, options) {
  // Setup respond middleware.
  endpoint.use(respond(options));

  // Setup endpoint routing (ie. resources).
  endpoint.use(endpoint.router);

  // Setup notFound middleware.
  endpoint.use(notFound());
}

module.exports = install;
