# Phantom PDF

A very opinionated PDF generation using [PhantomJS](http://phantomjs.org/) written for [Node.js](http://nodejs.org/). This is a push to get it out there. Unit tests and better documentation to come.

## Installing

  Make sure you have [PhantomJS](http://phantomjs.org/) installed. Download link can be found on their website.

    npm install phantom-pdf

## Rendering a PDF

```javascript
  var PhantomPDF = require('phantom-pdf');

  var manifest = {
    templates: {
      body: _dirname+'/templates/body.hbs', // Body is required as its the entry point
      // If header is defined it will be the page header
      // Note: phantomSettings.paperSize.header.height must also be set
      header: _dirname+'/templates/header.hbs',
      // If footer is defined it will be the page header
      // Note: phantomSettings.paperSize.footer.height must also be set
      footer: _dirname+'/templates/footer.hbs',
      // This is an example of having a parcial view
      product: _dirname+'/templates/product.hbs'
    },
    helpers: _dirname+'/helpers/index.js', // Handlebars helper
    helperVariables: {}, // Additional data to be passed in the helper such as local
    less: _dirname + '/less/index.less', // Less file to render into css
    output: '/tmp/foo.pdf', // This is the destination of the newly created PDF
    // Settings to be passed into phantom
    // List of settings: http://phantomjs.org/api/webpage/
    phantomSettings: {
      paperSize: {
        format: 'Letter',
        orientation: 'portrait',
        margin: {
          top: '0.25in',
          right: '0.5in',
          bottom: '0.25in',
          left: '0.5in'
        },
        header: {
          height: '0.5in'
        },
        footer: {
          height: '0.5in'
        }
      }
    }
  };

  var data = { // Put any data you want to be exposed to your handlebars template
    products: ['soccer ball', 'baseball', 'football'],
    category: 'Balls'
  };
  var pdf = new PhantomPDF(manifest, data, function(err){
    ...
  });
```
