var _ = require('underscore');
var lingo = require('lingo');
var debug = require('debug');
var express = require('express');

var utils = require('./utils');
var http = require('./http');

debug = debug('restless');

function Resource (options) {
  _.extend(this, options);

  // Give child classes the chance to set things up further; they normally
  // don't need to override the constructor itself. This is intentionally
  // called after the endpoint is created but before it's fully configured.
  this.initialize.apply(this, arguments);

  if (!this.name) {
    throw new Error('Missing `name` attribute');
  }

  if (!this.id) {
    this.id = lingo.en.singularize(this.name);
  }
}

Resource.extend = utils.extend;

_.extend(Resource.prototype, {

  allow_http_method_override: true,

  initialize: function () {
    // Nothing to do.
  },

  create_endpoint: function () {
    return express();
  },

  endpoint: function (endpoint, root) {
    var self = this;

    endpoint = endpoint || this.create_endpoint();

    root = (root || '') + '/' + this.name;

    _.each(this.resources, function (resource, name) {
      if (resource === true) {
        debug('Registering `%s`', root + '/:' + self.id + '/' + name);

        endpoint.all(root + '/:' + self.id + '/' + name, function (req, res) {
          self.dispatch.call(self, name, req, res);
        });
      }
      else {
        resource.endpoint(endpoint, root + '/:' + self.id);
      }
    });

    debug('Registering `%s`', root + '/:' + this.id);

    endpoint.all(root + '/:' + this.id, function (req, res) {
      self.dispatch.call(self, 'document', req, res);
    });

    debug('Registering `%s`', root);

    endpoint.all(root, function (req, res) {
      self.dispatch.call(self, 'collection', req, res);
    });

    return endpoint;
  },

  dispatch: function (type, req, res) {
    var self = this;
    var method = req.method;

    if (this.allow_http_method_override) {
      if (req.headers['x-http-method-override']) {
        debug('Overriding HTTP `%s` with `%s`', method,
            req.headers['x-http-method-override']);

        method = req.headers['x-http-method-override'];
      }
    }

    var operation = method.toLowerCase() + '_' + type;

    if (!this.is_supported(operation)) {
      this.respond(res, 'NotImplemented');
    } else {
      this[operation].call(this, req, res, function (status, data) {
        self.respond(res, status, data);
      });
    }
  },

  is_supported: function (operation) {
    return typeof this[operation] !== 'undefined';
  },

  respond: function (res, status, data) {
    if (typeof http.status[status] === 'undefined') {
      status = 'InternalServerError';
      data = null;
    }

    res.set('Content-Type', 'application/json');
    res.status(http.status[status].code);

    var payload = {
      status: status,
      data: data
    };

    if (res.jsonp) {
      res.jsonp(payload);
    } else {
      res.send(payload);
    }
  }

});

module.exports = Resource;
