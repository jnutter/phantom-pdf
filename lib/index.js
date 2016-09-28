var child = require('child_process');
var dependencies = require('./dependencies');
var deepExtend = require('deep-extend');
var css = require('./css');
var fs = require('fs');
var async = require('async');
var phantomjsPath = 'phantomjs';

var processes = []; // internal cache to remove processes if parent process exits

process.on('exit', function() {
  processes.forEach(function(ps) {
    try {
      ps.kill('SIGTERM');
    } catch(e) {}
  });
});

var Pdf = function (manifest, data, callback) {

  var self = this;

  this.manifest = deepExtend({}, require('./defaults'), manifest);
  if (this.manifest.phantomjsPath) {
    phantomjsPath = this.manifest.phantomjsPath;
  }
  this.data = data || {};
  this.callback = callback;
  this.processTimeout = manifest.timeout || 180000; // 3 minute default timeout
  this.run = pdfGenerator;

  dependencies.isPhantomInstalled(phantomjsPath, function (installed) {
    if (!installed) {
      return self.callback({error: 'PhantomJS not installed'});
    }
    css.process(self.manifest, function (err) {
      if (err) {
        self.callback(err);
      } else {
        self.run();
      }
    });
  });

  return this;
};

var pdfGenerator = function () {
  var self = this;
  var rand = Date.now() + '' + Math.random();

  var manifestFilename = self.manifest.tmpDir + '/phantom-manifest.' + rand + '.json';
  var dataFilename = self.manifest.tmpDir + '/phantom-data.' + rand + '.json';
  var isDebug = self.manifest.isDebug;

  var phantomError = null;

  async.parallel([
      function (callback) {
        fs.writeFile(manifestFilename, JSON.stringify(self.manifest), function (err) {
          callback(err)
        });
      },
      function (callback) {
        fs.writeFile(dataFilename, JSON.stringify(self.data), function (err) {
          callback(err)
        });
      }
    ],
    function (err) {

      // Return if there is an error
      if(err) {
        return self.callback(err);
      }

      var stdin = [phantomjsPath];
      stdin.push(__dirname + '/../phantom/index.js');
      stdin.push(manifestFilename);
      stdin.push(dataFilename);
      stdin.push(isDebug);

      var ps = child.exec(stdin.join(' '));
      processes.push(ps);

      // Kill process if it is dangling there too long
      var termTimeout = setTimeout(function () {
        ps.kill('SIGTERM');
      }, self.processTimeout);

      var killTimeout = setTimeout(function () {
        ps.kill('SIGKILL');
      }, self.processTimeout + 30000); // wait 30 seconds longer before force

      ps.on('error', function (err) {
        phantomError = err;
      });

      ps.on('uncaughtException', function (err) {
        phantomError = err;
      });

      ps.on('exit', function (code) {
        if (code === null) {
          code = 2;
        }
        clearTimeout(killTimeout);
        clearTimeout(termTimeout);
        // remove from process list
        for(var i = 0; i < processes.length; i++) {
          if(processes[i] === ps) {
            processes.splice(i, 1);
            break;
          }
        }
        // JUST INCASE delete files
        if (code !== 0) {
          return self.callback({
            code: code,
            error: phantomError
          });
        }

        self.callback(null, self.manifest.output);
      });

      ps.stdout.on('data', function (std) {
        console.log(std);
      });

      ps.stderr.on('data', function (std) {
        console.log(std);
      });

    });
}

module.exports = Pdf;
