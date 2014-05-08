express-restless
================

Installation
------------

    % npm install --save express-restless


Getting Started
---------------

    var _ = require('underscore');
    var express = require('express');
    var restless = require('./index');

    var data = {
      users: [
        {id: '0', name: 'Jean'},
        {id: '1', name: 'Somchai'}
      ],
      articles: [
        {id: '0', user: '0', title: 'Bonjour'},
        {id: '1', user: '1', title: 'Sawadde'},
        {id: '2', user: '0', title: 'Salut'}
      ]
    };

    var articles = new restless.Resource({
      get_collection: function (req, res, respond) {
        var rec = _.where(data.articles, {user: req.params.user});

        if (rec.length) {
          respond('OK', rec);
        } else {
          respond('NotFound');
        }
      }
    });

    var users = new restless.Resource({
      id: 'user',

      resources: {
        count: true,
        articles: articles
      },

      get_collection: function (req, res, respond) {
        respond('OK', data.users);
      },

      get_document: function (req, res, respond) {
        var rec = _.where(data.users, {id: req.params.user});

        if (rec.length) {
          respond('OK', rec[0]);
        } else {
          respond('NotFound');
        }
      },

      get_count: function (req, res, respond) {
        var rec = _.where(data.articles, {user: req.params.user});

        respond('OK', rec.length);
      }
    });

    var api = express();

    api.use(express.urlencoded());
    api.use(express.json());

    restless.install(api);

    articles.install(api, '/articles');
    users.install(api, '/users');

    var server = express();

    server.use('/api', api);

    server.listen('8080');
