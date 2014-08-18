var child = require('child_process');

exports.isPhantomInstalled = function(callback) {
	child.exec('which phantomjs', function(err, stdo, stde){
		callback(!!stdo.toString());
	});
}