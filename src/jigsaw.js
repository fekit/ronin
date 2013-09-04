/*!
 * Jigsaw
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

var $ = require( "./core/main" );

module.exports = $.mixin( $,
		// 工具
		require( "./core/object" ),
		require( "./core/array" ),
		require( "./core/string" ),
		require( "./util/i18n" )
	);

});
