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
    repo: info
    pkg: pkg
    meta:
      modules: "src/modules"
      proc: "src/preprocessor"
      temp: ".<%= pkg.name %>-cache"
    concat:
      coffee:
        options:
          process: ( src, filepath ) ->
            return src.replace /@(NAME|VERSION)/g, ( text, key ) ->
              return info[key.toLowerCase()]
        files:
          "<%= meta.temp %>/preprocessor.coffee": [
              "<%= meta.proc %>/intro.coffee"
              "<%= meta.proc %>/variables.coffee"
              "<%= meta.proc %>/functions.coffee"
              "<%= meta.proc %>/methods.coffee"
              "<%= meta.proc %>/outro.coffee"
            ]
          "<%= pkg.name %>.coffee": [
              "src/intro.coffee"
              "<%= meta.temp %>/preprocessor.coffee"
              "src/variables.coffee"
              "src/functions.coffee"
              "<%= meta.modules %>/builtin.coffee"
              "<%= meta.modules %>/global.coffee"
              "<%= meta.modules %>/object.coffee"
              "<%= meta.modules %>/array.coffee"
              "<%= meta.modules %>/string.coffee"
              "<%= meta.modules %>/date.coffee"
              "src/outro.coffee"
            ]
      js:
        files: "<%= pkg.name %>.js": [
            "build/intro.js"
            "<%= meta.temp %>/<%= pkg.name %>.js"
            "build/outro.js"
          ]
    coffee:
      options:
        bare: true
        separator: "\x20"
      build:
        src: "<%= pkg.name %>.coffee"
        dest: "<%= meta.temp %>/<%= pkg.name %>.js"
    uglify:
      options:
        banner: "/*!\n" +
                " * <%= repo.name %> v<%= repo.version %>\n" +
                " * <%= pkg.homepage %>\n" +
                " *\n" +
                " * Copyright Ourai Lin, http://ourai.ws/\n" +
                " *\n" +
                " * Date: <%= grunt.template.today('yyyy-mm-dd') %>\n" +
                " */\n"
        sourceMap: false
      build:
        src: "<%= pkg.name %>.js"
        dest: "<%= pkg.name %>.min.js"
    copy:
      test:
        expand: true
        cwd: "."
        src: ["**.js"]
        dest: "test"
    jasmine:
      test:
        src: "test/<%= pkg.name %>.js"
        options:
          specs: "test/*Spec.js"

  grunt.loadNpmTasks task for task in npmTasks

  grunt.registerTask "compile", [
      "concat:coffee"
      "coffee:build"
      "concat:js"
      "uglify"
    ]
  grunt.registerTask "default", [
      "compile"
      "copy"
    ]
