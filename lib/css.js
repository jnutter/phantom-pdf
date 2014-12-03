var less = require('less');
var fs = require('fs');
var path = require('path');

exports.process = function(manifest, callback) {
	// We already have css attached or there isnt any less to compile
	if(manifest.css || !manifest.less) {
		return callback(process.env.NODE_ENV === 'test' ? 'no processing needed' : null);
	}

	fs.exists(manifest.less, function (exists) {
		if(!exists) {
			return callback('Less file not found');
		}
		fs.readFile(manifest.less, function(err, data){

      var dynamicVariables = "";
      if(manifest.lessVariables) {
        manifest.lessVariables.split(',').forEach(function(keyValuePair){
          dynamicVariables += "@" + keyValuePair.replace("=",":") + ";";
        });

      }
			less.render(dynamicVariables + data.toString(), {cleancss: true, paths: [path.dirname(manifest.less)], rootpath: path.dirname(manifest.less)}, function (err, css) {
				if(!err) {
					manifest.css = css;
				}
			  callback(err);
			});
		});
	});
};