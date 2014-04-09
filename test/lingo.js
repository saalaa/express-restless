var should = require('should');
var restless = require('../index');

var aaaes = new restless.Resource({
  name: 'aaas'
});

var bbbes = new restless.Resource({
  id: 'rrr',
  name: 'bbbs'
});

var ccces = new restless.Resource({
  name: 'cccs',

  initialize: function () {
    this.id = 'rrr';
  }
});


// Actual tests
// ------------

describe('Resource name/id handling', function () {

  describe('/api/aaas', function () {
    it('should map to aaa', function (done) {
      aaaes.id.should.equal('aaa');
      done();
    });
  });

  describe('/api/bbbs', function () {
    it('should map to rrr', function (done) {
      bbbes.id.should.equal('rrr');
      done();
    });
  });

  describe('/api/cccs', function () {
    it('should map to rrr', function (done) {
      ccces.id.should.equal('rrr');
      done();
    });
  });

  describe('Providing no name', function () {
    it('should throw an exception', function (done) {
      (function () {
        new restless.Resource();
      }).should.throw();

      done();
    });
  });


});
