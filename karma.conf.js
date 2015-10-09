module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.js',
      'spec/**/*.js'
    ],
    exclude: [],
    preprocessors: {
      'src/**/*.js': 'coverage'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    coverageReporter: {
      dir: 'spec/coverage/',
      includeAllSources: true,
      reporters: [
        { type: 'html', subdir: '.'},
        { type: 'json', subdir: '.', file: 'coverage.json' }
      ]
    }
  });
};
