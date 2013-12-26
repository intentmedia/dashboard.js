module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      'public/bundled/app.css': [
        'app/client/css/yui-reset.css',
        'app/client/css/font-awesome.min.css',
        'app/client/css/framework.css',
        'app/client/css/app.css',
        'app/services/*/*.css'
      ],
      'public/bundled/lib.js': [
        'node_modules/numeral/min/numeral.min.js',
        'app/client/js/lib/jquery-1.9.1.min.js',
        'app/client/js/lib/jquery-ui-1.9.2.custom.min.js',
        'app/client/js/lib/moment.min.js',
        'node_modules/hogan.js/web/builds/2.0.0/hogan-2.0.0.min.js',
        'node_modules/d3/d3.js'
      ],
      'public/bundled/app.js': [
        'app/client/js/*.js',
        'app/services/*/client.js'
      ]
    },
    fingerprint: {
      assets: {
        src: [
          'public/bundled/*'
        ],
        filename: '.fingerprint'
      }
    },
    hogan: {
      compile: {
        src: [
          'app/client/views/templates/*.html',
          'app/services/*/*.html'
        ],
        dest: 'public/bundled/templates.js'
      }
    },
    jshint: {
      options: {
        browser: true,
        curly: true,
        eqeqeq: true,
        evil: true,
        forin: true,
        indent: 2,
        jquery: true,
        quotmark: 'single',
        undef: true,
        unused: false,
        trailing: true,
        globals: {
          d3: true,
          Dashboard: true,
          Hogan: true,
          HoganTemplates: true,
          numeral: true,
          moment: true
        }
      },
      app: [
        'app/client/js/*.js',
        'app/services/*/client.js'
      ]
    },
    watch: {
      files: [
        'app/client/**',
        'app/server/**',
        'app/services/**'
      ],
      tasks: 'default'
    }
  });

  grunt.registerMultiTask('hogan', 'Pre-compile hogan.js templates', function () {
    var Hogan = require('hogan.js');
    var path = require('path');
    var data = this.data;

    var namespace = data.namespace || 'HoganTemplates';
    var output = 'var ' + namespace + ' = {};';

    grunt.file.expand(data.src).forEach(function (template) {
      var name = path.basename(template, path.extname(template));
      try {
        output += "\n" + namespace + "['" + name + "'] = " +
          Hogan.compile(grunt.file.read(template).toString(), { asString: true }) + ';';
      } catch (error) {
        grunt.log.writeln('Error compiling template ' + name + ' in ' + template);
        throw error;
      }
    });
    grunt.file.write(data.dest, output);
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-fingerprint');

  // Default task.
  grunt.registerTask('default', ['jshint', 'hogan', 'concat', 'fingerprint']);

};
