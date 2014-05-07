var express = require('express');
var request = require('supertest');
var restless = require('../index');

var articles = new restless.Resource({

  id: 'article',
  name: 'articles',

  get_collection: function (req, res, respond) {
    respond('OK', req.params.user);
  },

  get_document: function (req, res, respond) {
    respond('OK', req.params.article);
  }

});

var users = new restless.Resource({

  id: 'user',
  name: 'users',

  resources: {
    deactivate: true,
    articles: articles
  },

  get_collection: function (req, res, respond) {
    respond('OK', 'noe');
  },

  get_document: function (req, res, respond) {
    respond('OK', req.params.user);
  },

  get_deactivate: function (req, res, respond) {
    respond('OK', req.params.user);
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', articles.endpoint('/articles'));
server.use('/api', users.endpoint('/users'));


// Actual tests
// ------------

describe('GET /api/articles', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/articles')
      .expect(200, done);
  });
});

describe('GET /api/users', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.should.equal('noe');

        done();
      });
  });
});

describe('GET /api/users/123', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users/123')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.should.equal('123');

        done();
      });
  });
});

describe('GET /api/users/123/deactivate', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users/123/deactivate')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.should.equal('123');

        done();
      });
  });
});

describe('GET /api/users/123/articles', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users/123/articles')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.should.equal('123');

        done();
      });
  });
});

describe('GET /api/users/123/articles/456', function () {
  it('respond with `200`', function (done) {
    request(server)
      .get('/api/users/123/articles/456')
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.should.equal('456');

        done();
      });
  });
});

