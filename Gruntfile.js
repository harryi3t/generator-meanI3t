'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: {
      dev: {
        src: 'dev.json'
      }
    },

    watch: {
      files: ['**/*.js'],
      tasks: ['exec:test']
    },

    nodemon:{
      dev: {
        script: 'server.js'
      }
    },

    concurrent: {
      target: {
        tasks: ['nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    }

  });
  require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('prod', ['concurrent']);
  grunt.registerTask('local', ['env', 'concurrent']);
};
