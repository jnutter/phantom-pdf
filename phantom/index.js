var Render = require('./render');
var fs = require('fs');
var phantomArgs;

console.log('Phantom booted');


if (phantom.version.major > 1) {
	phantomArgs = system.args;
} else {
	phantomArgs = phantom.args;
}

if (phantomArgs.length < 1) {
	console.log('incorrect args');
	phantom.exit(1);
}

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

console.log('Reading config files');
var manifest = require(phantomArgs[0]);
var data = require(phantomArgs[1]);
var isDebug = phantomArgs[2];

console.log('Removing config files');
fs.remove(phantomArgs[0]);
fs.remove(phantomArgs[1]);

console.log('Loading page');
new Render(manifest, data, isDebug, function(err) {
	if(err){
		console.error(err);
    phantom.exit(1);
	} else {
	  phantom.exit();
  }
});
