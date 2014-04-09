var express = require('express');
var restless = require('../index');

var asks = new restless.Resource({

  id: 'ask',
  name: 'asks',

  get_collection: function (req, res, respond) {
    respond('OK', 'get_collection()');
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
    respond('OK', 'get_collection()');
  },

  get_document: function (req, res, respond) {
    respond('OK', 'get_document()');
  },

  get_deactivate: function (req, res, respond) {
    respond('OK', 'get_deactivate()');
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', asks.endpoint);
server.use('/api', users.endpoint);

server.listen('6666');
