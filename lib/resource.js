var _ = require('underscore');
var debug = require('debug');
var express = require('express');
var utils = require('./utils');
var parser = require('./parser');

debug = debug('restless');

function Resource (options) {
  _.extend(this, options);

  // Merge pagination settings.
  this.pagination = _.extend({}, Resource.prototype.pagination, this.pagination);

  // Set *sane* default values.
  this.filters = _.extend({}, this.filters);
  this.sorting = _.extend({}, this.sorting);

  // Let child classes set things up.
  this.initialize.apply(this, arguments);
}

Resource.extend = utils.extend;

_.extend(Resource.prototype, {

  id: 'id',

  is_authenticated: true,
  allow_http_method_override: true,

  pagination: {
    offset_attr: 'skip',
    limit_attr: 'limit',
    offset: 0,
    limit: 100
  },

  initialize: function () {
    // Nothing to do.
  },

  create_endpoint: function () {
    return express();
  },

  register: function (endpoint, resource, route) {
    var self = this;

    debug('Registering `%s`', route);

    endpoint.all(route, function (req, res) {
      self.dispatch.call(self, resource, req, res);
    });
  },

  install: function (endpoint, root) {
    var self = this;

    if (typeof endpoint === 'string') {
      root = endpoint;
      endpoint = this.create_endpoint();
    }

    if (!root) {
      throw new Error('Endpoint root should be provided');
    }

    if (root[0] !== '/') {
      throw new Error('Endpoint root should start with a `/`');
    }

    _.each(this.resources, function (resource, name) {
      if (resource === true) {
        self.register(endpoint, name, root + '/:' + self.id + '/' + name);
      }
      else {
        resource.install(endpoint, root + '/:' + self.id + '/' + name);
      }
    });

    this.register(endpoint, 'document', root + '/:' + this.id);
    this.register(endpoint, 'collection', root);

    return endpoint;
  },

  dispatch: function (type, req, res) {
    var self = this;

    var operation = req.method.toLowerCase() + '_' + type;

    var is_authenticated = this.is_authenticated;
    if (typeof this.is_authenticated === 'function') {
      is_authenticated = this.is_authenticated(req, operation);
    }

    if (!is_authenticated) {
      res.respond('Unauthorized');
    }
    else if (!this.is_supported(operation)) {
      res.respond('NotImplemented');
    }
    else {
      this[operation].call(this, req, res, res.respond);
    }
  },

  is_supported: function (operation) {
    return typeof this[operation] !== 'undefined';
  },

  parse: function (req, more) {
    return parser.parse(req, _.extend({
      sorting: this.sorting,
      pagination: this.pagination,
      filters: this.filters
    }, more));
  }

});

module.exports = Resource;
