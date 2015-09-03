/*
 * angular-google-places-autocomplete
 *
 * Copyright (c) 2014 "kuhnza" David Kuhn
 * Licensed under the MIT license.
 * https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE
 */

'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jasmine: true,
        node: true,
        mocha: true,
        predef: ['after', 'afterEach', 'angular', 'before', 'beforeEach',
                 'describe', 'expect', 'inject', 'it', 'jasmine', 'spyOn',
                 'xdescribe', 'xit']
        },
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'test/**/*.js'
        ]
    },

    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        browsers: ['PhantomJS'],
        reporters: ['mocha'],
        autoWatch: false,
        singleRun: true
      },
      dev: {
        browsers: ['PhantomJS'],
        reporters: ['mocha'],
        autoWatch: true,
        singleRun: false
      },
      release: {
        browsers: ['PhantomJS', 'Chrome', 'Firefox'],
        reporters: ['mocha'],
        autoWatch: false,
        singleRun: true
      },
      coverage: {
        browsers: ['PhantomJS'],
        reporters: ['coverage'],
        autoWatch: false,
        singleRun: true
      }
    },

    clean: {
      dist: {
        src: 'dist',
        dot: true
      },
      lib: {
        src: 'example/lib',
        dot: true
      },
      bower: {
        src: 'bower_components',
        dot: true
      }
    },

    bower: {
      install: {
        options: {
          targetDir: 'example/lib'
        }
      }
    },

    cssmin: {
      dist: {
        expand: true,
        cwd: 'dist/',
        files: {
          'dist/autocomplete.min.css': 'src/autocomplete.css'
        }
      }

    },

    uglify: {
      dist: {
        files: {
          'dist/autocomplete.min.js': 'src/autocomplete.js'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('build', [
    'jshint',
    'clean',
    'bower',
    'cssmin',
    'uglify'
  ]);
};
