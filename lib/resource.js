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

  this.pagination = _.extend({}, Resource.prototype.pagination, this.pagination);
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
