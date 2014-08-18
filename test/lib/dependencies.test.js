var assert = require("assert")
  , proxyquire =  require('proxyquire');

describe('Dependencies', function () {
  before(function(){
    var childProcessStub = {
      exec: function(cmd, cb) {
        cb(null, '/foo/bar');
      }
    };
    this.dependencies = proxyquire('../../lib/dependencies', { 'child_process': childProcessStub });
  });

  describe('Phantom', function () {

    it('should return true if phantom is installed', function(done){
      this.dependencies.isPhantomInstalled(function(installed) {
        assert.equal(installed, true);
        done();
      });
    });

  });

});