module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
          options: {
            //sourceMap: true,
            //sourceMapName: 'assets/js/app.min.map',
            compress: {
              drop_console: false
            }
          },
          vendor: {
            options: {
                sourceMap: true,
                sourceMapName: 'assets/js/vendor.min.map',
                compress: {
                  drop_console: false
                }
            },
            files: {
              'assets/js/vendor.min.js': ['assets/js/vendor.js']
            }
          },
          app: {
            options: {
                sourceMap: true,
                sourceMapName: 'assets/js/app.min.map',
                compress: {
                  drop_console: false
                }
            },
            files: {
              'assets/js/app.min.js': ['assets/js/app.js']
            }
          }
        },
        watch: {
            react: {
                files: ['src/**/*.jsx','src/**/*.js'],
                tasks: ['browserify:app']
            },
            styles: {
              files: ['assets/less/**/*.less'], // which files to watch
              tasks: ['less','concat'],
              options: {
                nospawn: true
              }
            }
        },

        browserify: {
            options: {
                transform: [ require('grunt-react').browserify ]
            },
            app: {
                src: "src/components/App.jsx",
                dest: 'assets/js/app.js',
                options: {
                  external: [
                    'react',
                    'react/addons',
                    'lodash',
                    'underscore.string',
                    'loglevel',
                    'classnames'
                  ]
                }
            },
            vendor: {
                // External modules that don't need to be constantly re-compiled
                src: ['.'],
                dest: 'assets/js/vendor.js',
                options: {
                  debug: false,
                  require: [
                    'react',
                    'react/addons',
                    'lodash',
                    'underscore.string',
                    'loglevel',
                    'classnames'
                  ]
                }
            }
        },
        less: {
            options: {
                //cleancss: true
                //compress:true
            },
            files: {
                expand: true,
                cwd: "assets/less",
                src: ["common/*.less","*.less"],
                dest: "assets/css",
                ext: ".css"
            }
        },
        concat: {
            css: {
                src: ['assets/css/**/*.css','!assets/css/all.css'],
                dest: "assets/css/all.css"
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['browserify:vendor','browserify:app','less', 'concat', 'watch']);
    grunt.registerTask('prod', ['browserify:vendor','browserify:app','less', 'concat', 'uglify:vendor', 'uglify:app']);
};
