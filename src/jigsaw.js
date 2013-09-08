/*!
 * Jigsaw
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

var C = require("./core/constructor");

var $ = require( "./core/main" );
// var utils = [
// 		require( "./core/object" ),
// 		require( "./core/array" ),
// 		require( "./core/string" )
// 	];

	new C(C, $);
console.dir( C );

// module.exports = $.absorb( utils );

});
