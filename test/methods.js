var express = require('express');
var request = require('supertest');
var restless = require('../index');

var all = new restless.Resource({

  get_collection: function (req, res, respond) {
    respond('OK', 'a');
  },

  put_collection: function (req, res, respond) {
    respond('OK', 'a');
  },

  post_collection: function (req, res, respond) {
    respond('OK', 'a');
  },

  patch_collection: function (req, res, respond) {
    respond('OK', 'a');
  },

  delete_collection: function (req, res, respond) {
    respond('OK', 'a');
  }

});

var none = new restless.Resource();

var some = new restless.Resource({

  get_collection: function (req, res, respond) {
    respond('OK', 'a');
  }

});

var api = express();

api.use(express.methodOverride());
api.use(express.urlencoded());
api.use(express.json());

restless.install(api);

all.install(api, '/all');
none.install(api, '/none');
some.install(api, '/some');

var server = express();

server.use('/api', api);


// Actual tests
// ------------

describe('/api/all', function () {
  it('GET should respond with `200`', function (done) {
    request(server)
      .get('/api/all')
      .expect(200, done);
  });

  it('PUT should respond with `200`', function (done) {
    request(server)
      .put('/api/all')
      .expect(200, done);
  });

  it('POST should respond with `200`', function (done) {
    request(server)
      .post('/api/all')
      .expect(200, done);
  });

  it('PATCH should respond with `200`', function (done) {
    request(server)
      .patch('/api/all')
      .expect(200, done);
  });

  it('DELETE should respond with `200`', function (done) {
    request(server)
      .del('/api/all')
      .expect(200, done);
  });
});

describe('/api/none', function () {
  it('GET should respond with `501`', function (done) {
    request(server)
      .get('/api/none')
      .expect(501, done);
  });

  it('PUT should respond with `501`', function (done) {
    request(server)
      .put('/api/none')
      .expect(501, done);
  });

  it('POST should respond with `501`', function (done) {
    request(server)
      .post('/api/none')
      .expect(501, done);
  });

  it('PATCH should respond with `501`', function (done) {
    request(server)
      .patch('/api/none')
      .expect(501, done);
  });

  it('DELETE should respond with `501`', function (done) {
    request(server)
      .del('/api/none')
      .expect(501, done);
  });
});

describe('/api/some', function () {
  it('GET should respond with `200`', function (done) {
    request(server)
      .get('/api/some')
      .expect(200, done);
  });

  it('PUT should respond with `501`', function (done) {
    request(server)
      .put('/api/some')
      .expect(501, done);
  });

  it('PUT with X-HTTP-Method-Override=GET should respond with `200`', function (done) {
    request(server)
      .put('/api/some')
      .set('X-HTTP-Method-Override', 'GET')
      .expect(200, done);
  });

  it('GET with X-HTTP-Method-Override=PUT should respond with `501`', function (done) {
    request(server)
      .get('/api/some')
      .set('X-HTTP-Method-Override', 'PUT')
      .expect(501, done);
  });
});
