/*!
 * Install
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * Started on Sat Aug 10 01:20:43 2013
 * 
 * Copyright (c) 2013 Ourai.WS http://ourai.ws/
 */
;(function( window, undefined ) {

"use strict";

// 核心对象在全局变量中的名字
var GLOBAL_NAME = "JR";
// 是否需要引入 sea.js
var NEED_SEAJS = needSeaJS();
// 路径解析器实例
var parser = (function() {
        /**
         * URI 解析器
         * 
         * @class URIParser
         * @constructor
         */
        function URIParser() {}

        URIParser.prototype = {
            /**
             * 获取文件所在的目录
             * 
             * @method  dirname
             * @param   path {String}
             * @return  {String}
             */
            dirname: function( path ) {
                return path.match( /[^?#]*\// )[0];
            },

            /**
             * 获取绝对路径
             * 
             * @method  fullpath
             * @param   relative {String}   相对路径
             * @param   base {String}       基础路径
             * @return  {String}
             */
            fullpath: function( relative, base ) {
                var dotPath = relative.match( /(\.{1,2}\/)+/ )[0];
                var dotSegs = pathSegments( dotPath );

                if ( typeof base !== "string" ) {
                    // 默认为当然脚本所在文件夹
                    base = this.dirname( currentPath() );
                }

                var segs = pathSegments( base );

                if ( dotPath !== "./" ) {
                    for ( var i = 0; i < dotSegs.length; i++ ) {
                        segs.pop();
                    }
                }

                return segs.join("\/") + "\/" + relative.slice( relative.indexOf(dotPath) + dotPath.length );
            },

            /**
             * 获取当前脚本文件的 URL
             * 
             * @method  script
             * @param   callback {Function}   包含抛出异常语句的回调函数（无抛出异常则无法正常获取）
             * @return  {String}
             */
            script: function( callback ) {
                var url = "";

                if ( typeof callback === "function" ) {
                    try {
                        callback();
                    }
                    catch( e ) {
                        // Firefox
                        if ( e.fileName ) {
                            url = e.fileName;
                        }
                        // Safari
                        else if ( e.sourceURL ) {
                            url = e.sourceURL;
                        }
                        // Opera 9
                        else if ( e.stacktrace ) {
                            url = (e.stacktrace.match( /\(\) in\s+(.*?\:\/\/\S+)/m ) || ["", ""])[1];
                        }
                        // Chrome 4+/IE 10+
                        else if ( e.stack ) {
                            url = (e.stack.match( /((http|file)\:\/{2,3}\S+\/\S+\.[a-z0-9]+)/i ) || ['',''])[1];
                        }
                    }
                }

                return url;
            }
        };

        /**
         * 获取路径片段（由“/”分割的字符串）
         * 
         * @private
         * @method  pathSegments
         * @param   path {String}   路径
         * @return  {Array}
         */
        function pathSegments( path ) {
            var segs = path.split( "\/" );

            if ( segs.slice( -1 ) === "" ) {
                segs.pop();
            }

            return segs;
        }

        /**
         * 获取当前脚本的 URI
         * 
         * @private
         * @method  currentPath
         * @return  {String}
         */
        function currentPath() {
            var scripts = document.getElementsByTagName( "script" );
            var script = scripts[ scripts.length - 1 ];

            return script.hasAttribute ?
                script.src :
                // hack for IE8-
                // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
                script.getAttribute( "src", 4 );
        }

        return new URIParser();
    })();

if ( NEED_SEAJS ) {
    includeSeaJS();
}
else {
    initialize();
}

/**
 * 初始化
 *
 * @private
 * @method  initialize
 * @return
 */
function initialize() {
    seajs.use(
        // “拼图” url
        parser.fullpath("../src/jigsaw", (NEED_SEAJS ? seajs.data.base : undefined)),
        // 回调函数
        function( jsrev ) {
            // 将 URI 解析器附着在核心对象上
            // jsrev.mix( parser );
            // 将对象暴露到全局变量中
            window[GLOBAL_NAME] = jsrev;
        }
    );
}

/**
 * 判断是否需要引入 sea.js
 *
 * @private
 * @method  needSeaJS
 * @return  {Boolean}
 */
function needSeaJS() {
    return !(typeof window.define === "function" && window.define.cmd && window.seajs);
}

/**
 * 引入 sea.js
 *
 * @private
 * @method  includeSeaJS
 * @return
 */
function includeSeaJS() {
    var head = document.getElementsByTagName( "head" )[0];
    var script = document.createElement( "script" );

    script.id = "seajsnode";
    script.src = parser.fullpath( "../lib/seajs/dist/sea.js" );

    // sea.js 加载完成后初始化
    script.onload = script.onreadystatechange = function() {
        if ( /^(?:loaded|complete|undefined)$/.test( script.readyState ) ) {
            script.onload = script.onreadystatechange = null;
            head.removeChild( script );
            script = null;

            initialize();
        }
    };

    head.appendChild( script );
}

})( window );
