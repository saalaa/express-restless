var _ = require('underscore');
var lingo = require('lingo');
var debug = require('debug');
var express = require('express');

var utils = require('./utils');
var http = require('./http');

debug = debug('restless');

function Resource (options) {
  _.extend(this, options);

  // Compute the parameter id for the resource unless provided.
  if (!this.id) {
    this.id = lingo.en.singularize(this.name);
  }

  // Merge pagination settings.
  this.pagination = _.extend({}, Resource.prototype.pagination, this.pagination);

  // Let child classes set things up.
  this.initialize.apply(this, arguments);

  if (!this.name) {
    throw new Error('Missing `name` attribute');
  }
}

Resource.extend = utils.extend;

_.extend(Resource.prototype, {

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

  endpoint: function (endpoint, root) {
    var self = this;

    endpoint = endpoint || this.create_endpoint();

    root = (root || '') + '/' + this.name;

    _.each(this.resources, function (resource, name) {
      if (resource === true) {
        self.register(endpoint, name, root + '/:' + self.id + '/' + name);
      }
      else {
        resource.endpoint(endpoint, root + '/:' + self.id);
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
      this.respond(res, 'Unauthorized');
    }
    else if (!this.is_supported(operation)) {
      this.respond(res, 'NotImplemented');
    }
    else {
      this[operation].call(this, req, res, function (status, data, more) {
        self.respond(res, status, data, more);
      });
    }
  },

  is_supported: function (operation) {
    return typeof this[operation] !== 'undefined';
  },

  paginate: function (req) {
    var page = {
      offset: this.pagination.offset,
      limit: this.pagination.limit
    };

    if (req.query[this.pagination.offset_attr]) {
      try {
        page.offset = parseInt(req.query[this.pagination.offset_attr], 10);
      } catch (e) {
        debug('Error while parsing offset `%s`',
            req.query[this.pagination.offset_attr]);
      }

      page.offset = _.max([page.offset, this.pagination.offset]);
    }

    if (req.query[this.pagination.limit_attr]) {
      try {
        page.limit = parseInt(req.query[this.pagination.limit_attr], 10);
      } catch (e) {
        debug('Error while parsing limit `%s`',
            req.query[this.pagination.limit_attr]);
      }

      page.limit = _.min([page.limit, this.pagination.limit]);
    }

    return page;
  },

  respond: function (res, status, data, more) {
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

    if (more) {
      _.extend(payload, more);
    }

    if (res.jsonp) {
      res.jsonp(payload);
    } else {
      res.send(payload);
    }
  }

});

module.exports = Resource;
