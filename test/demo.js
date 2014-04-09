var express = require('express');
var request = require('supertest');
var restless = require('../index');

var asks = new restless.Resource({

  id: 'ask',
  name: 'asks',

  get_collection: function (req, res, respond) {
    respond('OK', 'a');
  }

});

var users = new restless.Resource({

  id: 'user',
  name: 'users',

  resources: {
    deactivate: true,
    asks: asks
  },

  get_collection: function (req, res, respond) {
    respond('OK', 'b');
  },

  get_document: function (req, res, respond) {
    respond('OK', 'c');
  },

  get_deactivate: function (req, res, respond) {
    respond('OK', 'd');
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', asks.endpoint);
server.use('/api', users.endpoint);


// Actual tests
// ------------

describe('GET /api/asks', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/asks')
      .expect(200, done);
  });
});

describe('GET /api/users', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users')
      .expect(200, done);
  });
});

describe('GET /api/users/123', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users/123')
      .expect(200, done);
  });
});

describe('GET /api/users/123/deactivate', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users/123/deactivate')
      .expect(200, done);
  });
});
