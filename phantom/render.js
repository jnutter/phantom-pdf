var fs = require('fs');
var Handlebars = require('handlebars');

var Render = module.exports = function(manifest, data, debug, callback) {
  var partials = this.loadPartials(manifest.templates);
  var phantomSettings = manifest.phantomSettings;

  if (!partials.body) {
    return callback('body.hbs not found');
  }

  console.log('Booting page in phantom');
  var page = require('webpage').create();

  if(manifest.helpers) {
	this.registerHelpers(require(manifest.helpers), manifest.helperVariables);
  }

  console.log('Set headers and footers');
  var headerAndFooterInserts = '';
  if(debug !== 'true') {
    headerAndFooterInserts = "<div style='visibility:hidden;position: absolute; top: 0; left: -9999px;'>" + this.setPrintHeadersOrFooters(partials, phantomSettings, data) + "</div>";
  }

  console.log('Setup page');
  this.setPageSettings(page, phantomSettings);

  console.log('Register parcials');
  this.registerPartial(partials);

  console.log('Register CSS parcials');
  this.registerCss(manifest.css);

  page.settings.resourceTimeout = 30000; // 30 seconds
  page.onResourceTimeout = function(e) {
    page.render(manifest.output);
    callback(e);
  };
  console.log('Setting content');

  page.content = Handlebars.compile("<!DOCTYPE html><html><head><style type='text/css'>{{> css}}</style></head><body>{{> body}}" + headerAndFooterInserts + "</body></html>")(data);

  console.log('Content set');

  if (manifest.scripts) {
    manifest.scripts.forEach(function(script) {
      console.log("Loading Script:", script);
      page.injectJs(script);
    });
  }

  page.onLoadFinished = function(status) {
    console.log('Page finished loading', status);
    if (status !== 'success') {
      callback('error');
      return;
    } else {
      if (debug === 'true') {
        try {
          page.render(manifest.output);
          fs.write(manifest.output, page.content, 'w');
          callback();
        } catch (e) {
          console.log(e);
          callback(e);
        }
      } else {
        page.render(manifest.output);
        callback();
      }
    }
  }
};

Render.prototype.setPrintHeadersOrFooters = function(partials, phantomSettings, data) {
  var headerAndFooterInserts = '';

  ['header', 'footer'].forEach(function(type) {

    if (partials[type] && phantomSettings.paperSize[type] && phantomSettings.paperSize[type].height) {

      var partial = Handlebars.compile(partials[type])({data: data});
      headerAndFooterInserts += partial;

      phantomSettings.paperSize[type].contents = phantom.callback(function(pageNum, numPages) {
        var template = Handlebars.compile('<style>{{> css}}</style>' + partials[type]);
        var rendered = template({pageNum: pageNum, numPages: numPages, data: data});
        return rendered;

      });
    }
  });
  return headerAndFooterInserts;
};

Render.prototype.setPageSettings = function(page, phantomSettings) {
  for (var key in phantomSettings) {
    if (phantomSettings.hasOwnProperty(key) && page.hasOwnProperty(key)) {
      page[key] = phantomSettings[key];
    }
  }
}

// Get rid of replace
Render.prototype.registerCss = function(css) {
  //css = css.replace(/__&quote;__/g, "'");
  Handlebars.registerPartial('css', css || '');
}

Render.prototype.loadPartials = function(templates) {
  var self = this;
  var partials = {};
  var path = '';
  for (key in templates) {
    path = templates[key];
    if (fs.exists(path) && fs.isFile(path) && path.indexOf('.hbs') !== -1) {
      partials[key] = fs.read(path);
    }
  }
  return partials;
};

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

Render.prototype.registerHelpers = function(helpers, vars) {
  for (key in vars) {
    helpers[key] = vars[key];
  }
  ;

  for (key in helpers) {
    if (isFunction(helpers[key]))
      Handlebars.registerHelper(key, helpers[key]);
  }

};

Render.prototype.registerPartial = function(partials) {
  for (key in partials) {
    Handlebars.registerPartial(key, partials[key]);
  }
};
