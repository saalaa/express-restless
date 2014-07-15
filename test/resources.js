var express = require('express');
var bodyParser = require('body-parser');
var request = require('supertest');
var restless = require('../index');

var aaa = new restless.Resource({
  resources: { xxx: true },
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

describe('Resources that only define sub-resources', function () {

  it('should work as expected', function (done) {
    request(server)
      .get('/api/aaa/111/xxx')
      .expect(200, done);
  });

});
