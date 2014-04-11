var express = require('express');
var request = require('supertest');
var restless = require('../index');

var unauthorized_1 = new restless.Resource({

  name: 'unauthorized-1',

  is_authenticated: false

});

var unauthorized_2 = new restless.Resource({

  name: 'unauthorized-2',

  is_authenticated: function () {
    return false;
  }

});

var authorized = new restless.Resource({

  name: 'authorized',

  is_authenticated: function () {
    return true;
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', unauthorized_1.endpoint());
server.use('/api', unauthorized_2.endpoint());
server.use('/api', authorized.endpoint());


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
