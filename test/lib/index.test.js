var assert = require("assert")
  , proxyquire =  require('proxyquire')
  , index = require('../../lib/index');

describe('Bootstrap', function () {
  before(function(){
    var dependenciesStub = {
      isPhantomInstalled: function(cb) {
        cb(true);
      }
    };
    var childProcessStub = {
      exec: function(command) {

      }
    };

    var cssStub = {
      process: function(manifest, callback) {
        callback();
      }
    };
    this.dependencies = proxyquire('../../lib/index', { 'dependencies': dependenciesStub, 'child_process': childProcessStub, './css': cssStub });
  });

  it('Should bootstrap up', function(done){
    index.prototype._run = index.prototype.run;
    index.prototype.run = function() {
      assert(true);
      done();
    }
    new index({},{}, function(err){
      assert(false, err);
      done();
    });
  });

});