module.exports = function( grunt ) {
  var pkg = grunt.file.readJSON("package.json");
  var info = {
      name: pkg.name.charAt(0).toUpperCase() + pkg.name.substring(1),
      version: pkg.version
    };
  var npmTasks = [
      "grunt-contrib-coffee",
      "grunt-contrib-uglify",
      "grunt-contrib-concat",
      "grunt-contrib-clean",
      "grunt-contrib-copy"
    ];
  var index = 0;
  var length = npmTasks.length;

  grunt.initConfig({
    pkg: pkg,
    meta: {
      src: "src",
      coffee: "<%= meta.src %>/coffee",
      core: "<%= meta.coffee %>/core",
      dest: "dest",
      build: "build",
      tests: "<%= meta.build %>/tests",
      tasks: "<%= meta.build %>/tasks"
    },
    concat: {
      coffee: {
        src: ["<%= meta.coffee %>/intro.coffee",
              "<%= meta.coffee %>/variables.coffee",
              "<%= meta.coffee %>/functions.coffee",
              "<%= meta.core %>/global.coffee",
              "<%= meta.core %>/object.coffee",
              "<%= meta.core %>/array.coffee",
              "<%= meta.core %>/string.coffee",
              "<%= meta.coffee %>/bridge.coffee",
              "<%= meta.coffee %>/outro.coffee"],
        dest: "<%= meta.dest %>/<%= pkg.name %>.coffee"
      },
      js: {
        options: {
          process: function( src, filepath ) {
            return src.replace(/@(NAME|VERSION)/g, function( text, key ) {
              return info[key.toLowerCase()];
            });
          }
        },
        src: ["<%= meta.src %>/vendors/miso.js",
              "<%= meta.src %>/intro.js",
              "<%= meta.src %>/<%= pkg.name %>.js",
              "<%= meta.src %>/outro.js"],
        dest: "<%= meta.dest %>/<%= pkg.name %>.js"
      }
    },
    coffee: {
      options: {
        bare: true,
        separator: "\x20"
      },
      build: {
        src: "<%= meta.dest %>/<%= pkg.name %>.coffee",
        dest: "<%= meta.src %>/<%= pkg.name %>.js"
      }
    },
    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
      build: {
        src: "<%= meta.dest %>/<%= pkg.name %>.js",
        dest: "<%= meta.dest %>/<%= pkg.name %>.min.js"
      }
    },
    clean: {
      compiled: {
        src: ["<%= meta.dest %>/*.coffee"]
      }
    },
    copy: {
      test: {
        expand: true,
        cwd: "<%= meta.dest %>",
        src: ["**.js"],
        dest: "<%= meta.tests %>"
      }
    }
  });

  for (; index < length; index++) {
    grunt.loadNpmTasks(npmTasks[index]);
  }

  grunt.registerTask("compile", ["concat:coffee", "coffee", "concat:js", "uglify"]);
  grunt.registerTask("default", ["compile", "clean", "copy"]);
};
