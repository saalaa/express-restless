var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var restless = require('../index');

var unauthorized_1 = new restless.Resource({

  is_authenticated: false

});

var unauthorized_2 = new restless.Resource({

  is_authenticated: function () {
    return false;
  }

});

var authorized = new restless.Resource({

  is_authenticated: function () {
    return true;
  }

});

var api = express();

api.use(bodyParser.json());

unauthorized_1.install(api, '/unauthorized-1');
unauthorized_2.install(api, '/unauthorized-2');
authorized.install(api, '/authorized');

var server = express();

server.use('/api', api);


// Actual tests
// ------------

describe('Authentication handling', function () {

  it('should respond with `401`', function (done) {
    request(server)
      .get('/api/unauthorized-1')
      .expect(401, done);
  });

  it('should respond with `401`', function (done) {
    request(server)
      .get('/api/unauthorized-2')
      .expect(401, done);
  });

  it('should respond with `501`', function (done) {
    request(server)
      .get('/api/authorized')
      .expect(501, done);
  });

});
