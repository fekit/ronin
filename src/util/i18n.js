/*!
 * Internationalization
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

var storage = {};

module.exports = {
    /**
     * Internationalization
     *
     * When the first argument is a plain object, is a setter.
     * When the first argument is a string, maybe a getter.
     *
     * @method  i18n
     * @return  {Object}
     */
    i18n: function() {
        var lib = this;
        var args = arguments;
        var data = args[0];
        var result = null;

        // Save i18n data at internal object.
        if ( lib.isPlainObject( data ) ) {
            lib.mixin( storage, data );
        }
        // Get i18n text.
        else if ( lib.isString( data ) && /^[0-9A-Z_.]+[^_.]$/i.test( data ) ) {
            var pairs = args[1];

            if ( !lib.isPlainObject( pairs ) ) {
                pairs = {};
            }

            result = i18nText.call( this, data );

            if ( lib.isString( result ) ) {
                result = result.replace( /\{%\s*([A-Z0-9_]+)\s*%\}/ig, function( text, key ) {
                    return pairs[ key ];
                });
            }
        }

        return result;
    }
};

/**
 * Get i18n text form internal storage.
 *
 * @private
 * @method  i18nText
 * @param   ns_str {String}
 * @return  {String}
 */
function i18nText( ns_str ) {
    var text = storage;

    this.each( ns_str.split("."), function( part ) {
        return typeof( text = text[ part ] ) in { "string": true, "number": true, "object": true };
    });

    return typeof( text ) in { "string": true, "number": true } ? text : "";
}

});
