module.exports = ( grunt ) ->
  pkg = grunt.file.readJSON "package.json"
  info =
    name: pkg.name.charAt(0).toUpperCase() + pkg.name.substring(1)
    version: pkg.version
  npmTasks = [
      "grunt-contrib-coffee"
      "grunt-contrib-uglify"
      "grunt-contrib-concat"
      "grunt-contrib-clean"
      "grunt-contrib-copy"
      "grunt-contrib-jasmine"
    ]

  grunt.initConfig
    pkg: pkg
    meta:
      src: "src"
      coffee: "<%= meta.src %>/coffee"
      proc: "<%= meta.coffee %>/preprocessor"
      class: "<%= meta.coffee %>/classes"
      core: "<%= meta.coffee %>/core"
      dest: "dest"
      vendors: "vendors"
      miso: "<%= meta.vendors %>/miso/dest"
      build: "build"
      tests: "<%= meta.build %>/tests"
      tasks: "<%= meta.build %>/tasks"
    concat:
      coffee_proc:
        src: [
            "<%= meta.proc %>/intro.coffee"
            "<%= meta.proc %>/variables.coffee"
            "<%= meta.proc %>/functions.coffee"
            "<%= meta.proc %>/methods.coffee"
            "<%= meta.proc %>/outro.coffee"
          ]
        dest: "<%= meta.coffee %>/preprocessor.coffee"
      coffee:
        src: [
            "<%= meta.coffee %>/intro.coffee"
            # preprocessor
            "<%= meta.proc %>/intro.coffee"
            "<%= meta.proc %>/variables.coffee"
            "<%= meta.proc %>/functions.coffee"
            "<%= meta.proc %>/methods.coffee"
            "<%= meta.proc %>/outro.coffee"
            # ---
            "<%= meta.coffee %>/variables.coffee"
            "<%= meta.coffee %>/functions.coffee"
            "<%= meta.core %>/builtin.coffee"
            "<%= meta.core %>/global.coffee"
            "<%= meta.core %>/object.coffee"
            "<%= meta.core %>/array.coffee"
            "<%= meta.core %>/string.coffee"
            "<%= meta.core %>/date.coffee"
            "<%= meta.coffee %>/outro.coffee"
          ]
        dest: "<%= meta.dest %>/<%= pkg.name %>.coffee"
      js:
        options:
          process: ( src, filepath ) ->
            return src.replace /@(NAME|VERSION)/g, ( text, key ) ->
              return info[key.toLowerCase()]
        src: [
            # "<%= meta.miso %>/miso.js"
            "<%= meta.src %>/intro.js"
            "<%= meta.src %>/<%= pkg.name %>.js"
            "<%= meta.src %>/outro.js"
          ]
        dest: "<%= meta.dest %>/<%= pkg.name %>.js"
    coffee:
      options:
        bare: true
        separator: "\x20"
      build:
        src: "<%= meta.dest %>/<%= pkg.name %>.coffee"
        dest: "<%= meta.src %>/<%= pkg.name %>.js"
      preprocessor:
        src: "<%= meta.coffee %>/preprocessor.coffee"
        dest: "<%= meta.src %>/preprocessor.js"
    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      build:
        src: "<%= meta.dest %>/<%= pkg.name %>.js"
        dest: "<%= meta.dest %>/<%= pkg.name %>.min.js"
    clean:
      compiled:
        src: ["<%= meta.dest %>/*.coffee"]
    copy:
      test:
        expand: true
        cwd: "<%= meta.dest %>"
        src: ["**.js"]
        dest: "<%= meta.tests %>"
    jasmine:
      test:
        src: "<%= meta.tests %>/<%= pkg.name %>.js"
        options:
          specs: "<%= meta.tests %>/*Spec.js"

  grunt.loadNpmTasks task for task in npmTasks

  grunt.registerTask "preprocessor", ["concat:coffee_proc", "coffee:preprocessor"]

  grunt.registerTask "compile", ["concat:coffee", "coffee:build", "concat:js", "uglify"]
  grunt.registerTask "default", ["compile", "clean", "copy"]
