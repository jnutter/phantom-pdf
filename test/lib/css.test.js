var assert = require("assert");
var css = require("../../lib/css");

describe('less > css', function () {

  it('should break out if there is not less file in the manifest', function(done){
    css.process({}, function(err) {
      assert.equal(err, 'no processing needed');
      done();
    })
  });

  it('should break out if there is already a css file', function(done){
    css.process({css: 'foo: bar;'}, function(err) {
      assert.equal(err, 'no processing needed');
      done();
    })
  });

  it('should error if there isnt a less file', function(done){
    css.process({less: __dirname+'/foo.less'}, function(err) {
      assert.equal(err, 'Less file not found');
      done();
    })
  });

  it('should render a less file to css', function(done){
    var manifest = {less: __dirname+'/test-fail.less'};
    css.process(manifest, function(err) {
      assert.notEqual(err, null);
      done();
    })
  });

});