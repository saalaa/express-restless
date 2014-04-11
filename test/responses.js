var express = require('express');
var request = require('supertest');
var restless = require('../index');

var responses = new restless.Resource({

  name: 'responses',

  get_collection: function (req, res, respond) {
    respond('OK', 'get_collection');
  },

  put_collection: function (req, res, respond) {
    respond('OK', 'put_collection');
  },

  post_collection: function (req, res, respond) {
    respond('OK', 'post_collection');
  },

  patch_collection: function (req, res, respond) {
    respond('OK', 'patch_collection');
  },

  delete_collection: function (req, res, respond) {
    respond('OK', 'delete_collection');
  },

  get_document: function (req, res, respond) {
    respond('OK', 'get_document');
  },

  put_document: function (req, res, respond) {
    respond('OK', 'put_document');
  },

  post_document: function (req, res, respond) {
    respond('OK', 'post_document');
  },

  patch_document: function (req, res, respond) {
    respond('OK', 'patch_document');
  },

  delete_document: function (req, res, respond) {
    respond('OK', 'delete_document');
  }

});

var more_responses = new restless.Resource({

  name: 'more-responses',

  get_collection: function (req, res, respond) {
    respond('OK', 'get_collection', {
      hello: 'world'
    });
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', responses.endpoint());
server.use('/api', more_responses.endpoint());


// Actual tests
// ------------

describe('/api/responses', function () {

  var methods = [
    'get',
    'post',
    'put',
    'patch',
    'del'
  ];

  methods.forEach(function (method) {
    var name = method.toUpperCase();

    it(name + ' should respond with `200` on collection', function (done) {
      request(server)
        [method]('/api/responses')
        .expect(200, done);
    });

    it(name + ' should respond with `200` on document', function (done) {
      request(server)
        [method]('/api/responses/123')
        .expect(200, done);
    });

  });

});

describe('/api/more-responses', function () {

  it('should respond with `200`', function (done) {
    request(server)
      .get('/api/more-responses')
      .expect(200, done);
  });

  it('should respond with `hello`', function (done) {
    request(server)
      .get('/api/more-responses')
      .expect(/hello/, done);
  });

});
