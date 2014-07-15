var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var should = require('should');
var restless = require('../index');

var sorting = new restless.Resource({

  get_collection: function (req, res, respond) {
    respond('OK', this.parse(req));
  },

  post_collection: function (req, res, respond) {
    var inline_options = {
      sorting: [
        'name',
        '-age'
      ]
    };

    respond('OK', this.parse(req, inline_options));
  }

});

var api = express();

api.use(bodyParser.json());

sorting.install(api, '/sorting');

var server = express();

server.use('/api', api);


// Actual tests
// ------------

describe('Sorting handling', function () {

  it('should respond with the default sorting', function (done) {
    request(server)
      .get('/api/sorting')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).equal(null);
        should(res.body.data.sorting).equal(null);

        done();
      });
  });

  it('should respond with the sorting passed', function (done) {
    request(server)
      .post('/api/sorting?sort=name')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).equal(null);

        should(res.body.data.sorting).have.property('name', 1);

        done();
      });
  });

  it('should respond with a useful error', function (done) {
    request(server)
      .post('/api/sorting?sort=-age,xxx')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        should(res.body.data.errors).not.equal(null);

        should(res.body.data.sorting).have.property('age', -1);

        should(res.body.data.errors[0]).have.property('error', 'sorting');
        should(res.body.data.errors[0]).have.property('value', 'xxx');

        done();
      });
  });

});
