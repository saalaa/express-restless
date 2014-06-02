var _ = require('underscore');
var debug = require('debug');

debug = debug('restless');

function parse (req, opts) {
  var q = {
    errors: [],
    filters: null,
    sorting: null,
    page: {
      offset: opts.pagination.offset,
      limit: opts.pagination.limit
    }
  };

  var filters = [];

  _.each(req.query, function (value, key) {
    if (key === 'sort') {
      _.each(value.split(/[ ,]+/), function (item) {
        if (_.contains(opts.sorting, item)) {
          if (!q.sorting) {
            q.sorting = {};
          }

          if (item[0] === '-') {
            q.sorting[item.slice(1)] = -1;
          } else {
            q.sorting[item] = 1;
          }
        }
        else {
          q.errors.push({ error: 'sorting', value: item });
        }
      });
    }
    else if (key === opts.pagination.offset_attr) {
      try {
        q.page.offset = parseInt(req.query[opts.pagination.offset_attr], 10);
      } catch (e) {
        q.errors.push({ error: 'offset',
          value: req.query[opts.pagination.offset_attr] });
      }

      q.page.offset = _.max([q.page.offset, opts.pagination.offset]);
    }
    else if (key === opts.pagination.limit_attr) {
      try {
        q.page.limit = parseInt(req.query[opts.pagination.limit_attr], 10);
      } catch (e) {
        q.errors.push({ error: 'limit',
          value: req.query[opts.pagination.limit_attr] });
      }

      q.page.limit = _.min([q.page.limit, opts.pagination.limit]);
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

  _.each(req.body, function (value, key) {
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

  filters = _.filter(filters, function (item) {
    if (_.contains(opts.filters[item[0]], item[1])) {
      return true;
    }

    q.errors.push({ error: 'filter', value: item[0] });
    return false;
  });

  if (!q.errors.length) {
    q.errors = null;
  }

  if (filters.length) {
    q.filters = {};
  }

  _.each(filters, function (item) {
    if (item[1] === null) {
      q.filters[item[0]] = item[2];
    }
    else {
      if (!_.isObject(q.filters[item[0]]) || _.isArray(q.filters[item[0]])) {
        q.filters[item[0]] = {};
      }

      q.filters[item[0]][item[1]] = item[2];
    }
  });

  return q;
};

module.exports = {
  parse: parse
}
