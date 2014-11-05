var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var should = require('should');
var restless = require('../index');

var bbb = new restless.Resource();

var aaa = new restless.Resource({

  resources: {
    xxx: true,
    bbb: bbb
  },

  get_xxx: function (req, res, respond) {
    respond('OK');
  }

});


var api = express();

api.use(bodyParser.json());

aaa.install(api, '/aaa');

var server = express();

server.use('/api', api);


// Actual tests
// ------------

describe('Sub-resources', function () {
  it('Should available as res.resources.sub', function () {
    should(aaa.resources.bbb).equal(bbb);
  });

  it('Should available as res.sub', function () {
    should(aaa.bbb).equal(bbb);
  });

  it('should work as expected', function (done) {
    request(server)
      .get('/api/aaa/111/xxx')
      .expect(200, done);
  });
});
