var express = require('express');
var restless = require('../index');

var articles = new restless.Resource({

  name: 'articles',

  get_collection: function (req, res, respond) {
    respond('OK', 'articles::get_collection(' + req.params.user + ')');
  },

  get_document: function (req, res, respond) {
    respond('OK', 'articles::get_collection(' + req.params.user + ', ' + req.params.article + ')');
  }

});

var users = new restless.Resource({

  name: 'users',

  resources: {
    deactivate: true,
    articles: articles
  },

  get_collection: function (req, res, respond) {
    respond('OK', 'users::get_collection()');
  },

  get_document: function (req, res, respond) {
    respond('OK', 'users::get_document(' + req.params.user + ')');
  },

  get_deactivate: function (req, res, respond) {
    respond('OK', 'users::get_deactivate(' + req.params.user + ')');
  }

});

var server = express();

server.use(express.urlencoded());
server.use(express.json());

server.use('/api', articles.endpoint);
server.use('/api', users.endpoint);

server.listen('6666');
