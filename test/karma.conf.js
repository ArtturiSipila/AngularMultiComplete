// Karma configuration
// Generated on Wed Jan 14 2015 12:48:43 GMT+0200 (EET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.min.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/app.js',
      'src/autocompleteTemplate.html',
      'src/autocomplete.js',
      'test/*Spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      //stripPrefix: 'public/',
      //stripSufix: '.ext',

      // If your build process changes the path to your templates,
      // use stripPrefix and prependPrefix to adjust it.
      //stripPrefix: "source/path/to/templates/.*/",
      //prependPrefix: "web/path/to/templates/",



      // prepend this to the
      //prependPrefix: 'served/',

      // or define a custom transform function
      /*
      cacheIdFromPath: function(filepath) {
        return cacheId;
      },
      */

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      //moduleName: 'foo'

      // the name of the Angular module to create
      moduleName: "my.templates"
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],
    //reporters: ['story','progress'],
    //reporters: ['story','progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['Chrome'],
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
