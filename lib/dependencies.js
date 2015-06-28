var child = require('child_process');

exports.isPhantomInstalled = function(phantomjsPath, callback) {
	console.info('Checking if phantomjs is installed in provided path: ', phantomjsPath);
	child.exec('which phantomjs', function(err, stdo, stde){
		callback(!!stdo.toString());
	});
}
