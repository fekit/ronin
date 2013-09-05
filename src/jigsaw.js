/*!
 * Jigsaw
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

var $ = require( "./core/main" );
var Constructor = require( "./core/constructor" );
var C = new Constructor( $,
		[
			require( "./core/object" )
		]
	);

module.exports = $;

});
