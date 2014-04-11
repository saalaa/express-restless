var express = require('express');
var request = require('supertest');
var restless = require('../index');

var pagination = new restless.Resource({

  name: 'pagination',

  get_collection: function (req, res, respond) {
    respond('OK', this.paginate(req));
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', pagination.endpoint());


// Actual tests
// ------------

describe('Pagination handling', function () {

  it('should respond with the default page', function (done) {
    request(server)
      .get('/api/pagination')
      .expect(new RegExp('100'), done);
  });

  it('should respond with the default page for invalid input', function (done) {
    request(server)
      .get('/api/pagination?skip=hello&limit=')
      .expect(new RegExp('100'), done);
  });

  it('should respond with the provided page if valid', function (done) {
    request(server)
      .get('/api/pagination?skip=40&limit=20')
      .expect(new RegExp('20'))
      .expect(new RegExp('40'), done);
  });

  it('should respond with the adjusted page if invalid', function (done) {
    request(server)
      .get('/api/pagination?skip=40&limit=200')
      .expect(new RegExp('100'))
      .expect(new RegExp('40'), done);
  });

});
