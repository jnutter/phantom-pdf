var child = require('child_process');
var dependencies = require('./dependencies');
var deepExtend = require('deep-extend');
var css = require('./css');
var fs = require('fs');
var async = require('async');

var Pdf = module.exports = function(manifest, data, callback) {

	var self = this;

	this.manifest = deepExtend({}, require('./defaults'), manifest);
	this.data = data || {};
  this.callback = callback;

	dependencies.isPhantomInstalled(function(installed){
		if(!installed) {
			return self.callback({error: 'PhantomJS not installed'});
		}
		css.process(self.manifest, function(){
			self.run();
		});
	});

	return this;
};

Pdf.prototype.run = function() {
	var self = this;
  var rand = Date.now()+''+Math.random();

  var manifestFilename = self.manifest.tmpDir+'/phantom-manifest.'+rand+'.json';
  var dataFilename =  self.manifest.tmpDir+'/phantom-data.'+rand+'.json';

  var phantomError = null;

  async.parallel([
      function(callback) {
        fs.writeFile(manifestFilename, JSON.stringify(self.manifest), function(err) {callback(err)});
      },
      function(callback) {
        fs.writeFile(dataFilename, JSON.stringify(self.data), function(err) {callback(err)});
      }
    ],
    function(err){

      var stdin = ['phantomjs'];
      stdin.push(__dirname+'/../phantom/index.js');
      stdin.push(manifestFilename);
      stdin.push(dataFilename);

      var ps = child.exec(stdin.join(' '));

      ps.on('error',function(err){
        phantomError = err;
      });

      ps.on('uncaughtException', function(err) {
        phantomError = err;
      });

      ps.on('exit', function(code){
        // JUST INCASE delete files
        if (code != 0) {
          return self.callback({
            code: code,
            error: phantomError
          });
        }

        self.callback(null, self.manifest.output);
      });

      ps.stdout.on('data', function(std){
        console.log(std);
      });

      ps.stderr.on('data', function(std){
        console.log(std);
      });

  });
}
