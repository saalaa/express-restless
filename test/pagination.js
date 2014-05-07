var express = require('express');
var request = require('supertest');
var should = require('should');
var restless = require('../index');

var pagination = new restless.Resource({

  get_collection: function (req, res, respond) {
    respond('OK', this.paginate(req));
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', pagination.endpoint('/pagination'));


// Actual tests
// ------------

describe('Pagination handling', function () {

  it('should respond with the default page', function (done) {
    request(server)
      .get('/api/pagination')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.offset.should.equal(0);
        res.body.data.limit.should.equal(100);

        done();
      });
  });

  it('should respond with the default page for invalid input', function (done) {
    request(server)
      .get('/api/pagination?skip=hello&limit=')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.offset.should.equal(0);
        res.body.data.limit.should.equal(100);

        done();
      });
  });

  it('should respond with the provided page if valid', function (done) {
    request(server)
      .get('/api/pagination?skip=40&limit=20')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.offset.should.equal(40);
        res.body.data.limit.should.equal(20);

        done();
      });
  });

  it('should respond with the adjusted page if invalid', function (done) {
    request(server)
      .get('/api/pagination?skip=40&limit=200')
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        res.body.data.offset.should.equal(40);
        res.body.data.limit.should.equal(100);

        done();
      });
  });

});
