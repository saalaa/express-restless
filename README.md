express-restless
================

Installation
------------

    % npm install --save express-restless


Getting Started
---------------

    var data = [
      {id: 0, name: 'Tom'},
      {id: 1, name: 'Jerry'}
    ];

    var users = new restless.Resource({
      name: 'users',

      get_collection: function (req, res, respond) {
        respond('OK', data);
      },

      get_document: function (req, res, respond) {
        var rec = _.where(data, {id: req.params.user});

        if (rec) {
          respond('OK', rec);
        } else {
          respond('NotFound');
        }
      }
    });

Demonstration
-------------

Live demonstration: http://runnable.com/U0ahL92Mi8VtE-y3
