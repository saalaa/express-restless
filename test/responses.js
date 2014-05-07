var express = require('express');
var request = require('supertest');
var restless = require('../index');

var responses = new restless.Resource({

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

  get_collection: function (req, res, respond) {
    respond('OK', 'get_collection', {
      hello: 'world'
    });
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());
server.use(restless.api());

server.use('/api', responses.endpoint('/responses'));
server.use('/api', more_responses.endpoint('/more-responses'));


// Actual tests
// ------------

describe('/api/responses', function () {

  var methods = [
    'get',
    'post',
    'put',
    'patch',
    'delete'
  ];

  methods.forEach(function (method) {
    var attr = method === 'delete' ? 'del' : method;
    var name = method.toUpperCase();

    it(name + ' should respond with `200` and `' + method + '_collection` on collection', function (done) {
      var regexp = new RegExp(method + '_collection');

      request(server)
        [attr]('/api/responses')
        .expect(200)
        .expect(regexp, done);
    });

    it(name + ' should respond with `200` and `' + method + '_document` on document', function (done) {
      var regexp = new RegExp(method + '_document');

      request(server)
        [attr]('/api/responses/123')
        .expect(200)
        .expect(regexp, done);
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
