var _ = require('underscore');
var express = require('express');
var http = require('./http');
var utils = require('./utils');
var Parser = require('./parser');

var debug = require('debug')('restless');
var debug_respond = require('debug')('restless:respond');

function Resource (options) {
  _.extend(this, options);

  // Merge pagination settings.
  this.pagination = _.extend({}, Resource.prototype.pagination,
      this.pagination);

  // Set *sane* default values.
  this.filters = _.extend({}, this.filters);
  this.sorting = _.extend({}, this.sorting);

  this.parser = new Parser();

  // Let child classes set things up.
  this.initialize.apply(this, arguments);
}

Resource.extend = utils.extend;

_.extend(Resource.prototype, {

  id: 'id',

  is_authorized: true,
  allow_http_method_override: true,

  jsonp: true,

  headers: {
    'content-type': 'application/json'
  },

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

    endpoint.all(function (req, res) {
      self.respond(res, 'NotFound');
    });

    return endpoint;
  },

  dispatch: function (type, req, res) {
    var self = this;

    var operation = req.method.toLowerCase() + '_' + type;

    debug('Routing `%s`', operation);

    var is_authorized = this.is_authorized;
    if (typeof this.is_authorized === 'function') {
      is_authorized = this.is_authorized(req, operation);
    }

    if (!is_authorized) {
      this.respond(res, 'Unauthorized');
    }
    else if (!this.is_supported(operation)) {
      this.respond(res, 'NotImplemented');
    }
    else {
      try {
        this[operation].call(this, req, res, function (status, data, more) {
          self.respond.call(self, res, status, data, more);
        });
      } catch (e) {
        self.respond(res, 'InternalServerError');
        debug('Error: %s', e.stack);
      }
    }
  },

  is_supported: function (operation) {
    return typeof this[operation] !== 'undefined';
  },

  parse: function (req, more) {
    // Provide sane defaults for pagination.
    if (more && more.pagination) {
      more.pagination = _.extend({}, Resource.prototype.pagination,
        more.pagination);
    }

    return this.parser.parse(req, _.extend({
      sorting: this.sorting,
      pagination: this.pagination,
      filters: this.filters
    }, more));
  },

  respond: function (res, status, data, more) {
    if (typeof http.status[status] === 'undefined') {
      status = 'InternalServerError';
      data = null;
    }

    res.status(http.status[status].code);
    res.set(this.headers);

    var payload = {
      status: status,
      data: data
    };

    if (more) {
      _.extend(payload, more);
    }

    if (debug_respond.enabled) {
      debug_respond(JSON.stringify(payload, null, 2));
    }

    if (this.jsonp && res.jsonp) {
      res.jsonp(payload);
    } else {
      res.send(payload);
    }
  }

});

module.exports = Resource;
