var express = require('express');
var request = require('supertest');
var restless = require('../index');

var exception = new restless.Resource({

  get_collection: function (req, res, respond) {
    throw new Error('xxx');
  }

});

var api = express();

api.use(express.urlencoded());
api.use(express.json());

restless.install(api);

exception.install(api, '/exception');

var server = express();

server.use('/api', api);


// Actual tests
// ------------

describe('/api/exception', function () {

  it('should respond with `500`', function (done) {
    request(server)
      .get('/api/exception')
      .expect(500, done);
  });

});
