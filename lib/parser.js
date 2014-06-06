var _ = require('underscore');
var debug = require('debug');
var utils = require('./utils');

debug = debug('restless');

function Parser (options) {
  _.extend(this, options);

  // Let child classes set things up.
  this.initialize.apply(this, arguments);
}

Parser.extend = utils.extend;

_.extend(Parser.prototype, {

  initialize: function () {
    // Nothing to do.
  },

  parse: function (req, opts) {
    // Compute the request's page.
    var page = this.parse_page(req.query, opts.pagination);

    // Compute the request's sorting options.
    var sorting = this.parse_sorting(req.query, opts.sorting);

    // Merge the query string and request's body (which takes precedence).
    var query = _.extend({}, req.query, req.body);

    // Remove paging and sorting parameters.
    delete query.sort;
    delete query[opts.pagination.offset_attr];
    delete query[opts.pagination.limit_attr];

    // Compute the request's filters.
    var filters = this.parse_filters(query, opts.filters);

    // Merge all errors together.
    var errors = _.union(page.errors, sorting.errors, filters.errors);

    // Set to null if there are no errors.
    if (errors.length === 0) {
      errors = null;
    }

    // Assemble the results.
    return {
      errors: errors,
      page: page.result,
      sorting: sorting.result,
      filters: filters.result
    };
  },

  parse_page: function (query, opts) {
    var errors = [];

    var offset = opts.offset;
    var limit = opts.limit;

    if (_.has(query, opts.offset_attr)) {
      try {
        offset = parseInt(query[opts.offset_attr], 10);
      } catch (e) {
        errors.push({ error: 'offset', value: query[opts.offset_attr] });
      }

      offset = _.max([offset, opts.offset]);
    }

    if (_.has(query, opts.limit_attr)) {
      try {
        limit = parseInt(query[opts.limit_attr], 10);
      } catch (e) {
        errors.push({ error: 'limit', value: query[opts.limit_attr] });
      }

      limit = _.min([limit, opts.limit]);
    }

    return {
      errors: errors,
      result: {
        offset: offset,
        limit: limit
      }
    };
  },

  parse_sorting: function (query, opts) {
    var errors = [];
    var result = {};

    // Break the parameter into items.
    var items = query.sort ? query.sort.split(/[ ,]+/) : null;

    _.each(items, function (item) {
      if (_.contains(opts, item)) {
        if (item[0] === '-') {
          result[item.slice(1)] = -1;
        } else {
          result[item] = 1;
        }
      }
      else {
        errors.push({ error: 'sorting', value: item });
      }
    });

    if (_.isEmpty(result)) {
      result = null;
    }

    return {
      errors: errors,
      result: result
    };
  },

  parse_filters: function (query, opts) {
    var filters = [];

    // Extract filters from the query.
    _.each(query, function (value, key) {
      if (_.isObject(value) && !_.isArray(value)) {
        _.each(value, function (val, op) {
          filters.push([key, op, val]);
        });
      }
      else {
        var bits = key.split('__');

        var op = null;
        if (bits.length >= 2) {
          op = bits.pop();
          key = bits.join('__');
        }

        filters.push([key, op, value]);
      }
    });

    var errors = [];
    var result = {};

    // Keep only filters matching the configuration.
    filters = _.filter(filters, function (item) {
      if (_.contains(opts[item[0]], item[1])) {
        return true;
      }

      errors.push({ error: 'filter', value: item[0] });
      return false;
    });

    // Rearrange filters for use of use.
    _.each(filters, function (item) {
      if (item[1] === null) {
        result[item[0]] = item[2];
      }
      else {
        if (!_.isObject(result[item[0]]) || _.isArray(result[item[0]])) {
          result[item[0]] = {};
        }

        result[item[0]][item[1]] = item[2];
      }
    });

    return {
      errors: errors,
      result: result
    };
  }

});

module.exports = Parser;
