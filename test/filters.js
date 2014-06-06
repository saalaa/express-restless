var express = require('express');
var request = require('supertest');
var should = require('should');
var restless = require('../index');

var filters = new restless.Resource({

  filters: {
    'criteria.*': ['$in'],
    'name': [null, '$in'],
    'age': ['$gt']
  },

  get_collection: function (req, res, respond) {
    respond('OK', this.parse(req));
  }

});

var api = express();

api.use(express.urlencoded());
api.use(express.json());

restless.install(api);

filters.install(api, '/filters');

var server = express();

server.use('/api', api);


// Actual tests
// ------------

describe('Filters handling', function () {

  it('should respond with the default filters', function (done) {
    request(server)
      .get('/api/filters')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).equal(null);
        should(res.body.data.filters).eql({});

        done();
      });
  });

  it('should respond with the filters passed', function (done) {
    request(server)
      .get('/api/filters?name=jean&age__$gt=42')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).equal(null);

        should(res.body.data.filters).have.property('name');
        should(res.body.data.filters).have.property('age');

        done();
      });
  });

  it('should respond with a useful error', function (done) {
    request(server)
      .get('/api/filters?name=yyy&age=666')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).not.equal(null);

        should(res.body.data.filters).have.property('name', 'yyy');

        should(res.body.data.errors[0]).have.property('error', 'filter');
        should(res.body.data.errors[0]).have.property('value', 'age');

        done();
      });
  });

  it('should handle pattern options', function (done) {
    request(server)
      .get('/api/filters?criteria__$in=jean&criteria.color__$in=yellow')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).not.equal(null);

        should(res.body.data.filters).have.property('criteria.color');

        done();
      });
  });

});
