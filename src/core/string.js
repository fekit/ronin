/*!
 * String
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

module.exports = {
    /**
     * 用指定占位符填补字符串
     * 
     * @method  pad
     * @param   string {String}         源字符串
     * @param   length {Integer}        生成字符串的长度，正数为在后面补充，负数则在前面补充
     * @param   placeholder {String}    占位符
     * @return  {String}
     */
    pad: function( string, length, placeholder ) {
        // 占位符只能指定为一个字符
        // 占位符默认为空格
        if ( this.isString(placeholder) === false || placeholder.length !== 1 ) {
            placeholder = "\x20";
        }

        // Set length to 0 if it isn't an integer.
        if ( !this.isInteger( length ) ) {
            length = 0;
        }

        string = String(string);

        var index = 1;
        var unit = String(placeholder);
        var len = Math.abs( length ) - string.length;

        if ( len > 0 ) {
            // 补全占位符
            for ( ; index < len; index++ ) {
                placeholder += unit
            }

            string = length > 0 ? string + placeholder : placeholder + string;
        }

        return string;
    },

    /**
     * 将字符串首字母大写
     * 
     * @method  capitalize
     * @param   string {String}     源字符串
     * @return  {String}
     */
    capitalize: function( string ) {
        return this.isString(string) ?
            string.replace(/[a-z]+/ig, function( c ) {
                return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
            }) : "";
    },

    /**
     * 将字符串转换为驼峰式
     * 
     * @method  camelCase
     * @param   string {String}         源字符串
     * @param   is_upper {Boolean}      是否为大驼峰式
     * @return  {String}
     */
    camelCase: function( string, is_upper ) {
        if ( this.isString(string) ) {
            string = string.toLowerCase().replace(/[-_\x20]([a-z]|[0-9])/ig, function( all, letter ) {
                return letter.toUpperCase();
            });

            var firstLetter = string.charAt(0);

            string = (is_upper === true ? firstLetter.toUpperCase() : firstLetter.toLowerCase()) + string.slice(1);
        }

        return string;
    },

    /**
     * 补零
     * 
     * @method  zerofill
     * @param   number {Number}     源数字
     * @param   digit {Integer}     数字位数，正数为在后面补充，负数则在前面补充
     * @return  {String}
     */    
    zerofill: function( number, digit ) {
        var result = "";
        var lib = this;

        if ( lib.isNumeric( number ) && lib.isInteger( digit ) ) {
            var rfloat = /^([-+]?\d+)\.(\d+)$/;
            var isFloat = rfloat.test( number );
            var prefix = "";

            digit = parseInt( digit );

            // 浮点型数字时 digit 则为小数点后的位数
            if ( digit > 0 && isFloat ) {
                number = (number + "").match( rfloat );
                prefix = number[1] * 1 + ".";
                number = number[2];
            }
            // Negative number
            else if ( number * 1 < 0 ) {
                prefix = "-";
                number = (number + "").substring( 1 );
            }

            result = lib.pad( number, digit, "0" );

            if ( digit < 0 && isFloat ) {
                result = "";
            }
            else {
                result = prefix + result;
            }
        }

        return result;
    },

    /**
     * Removes whitespace from both ends of the string.
     *
     * @method  trim
     * @param   object {Mixed}
     * @return  {String}
     * 
     * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
     */
    trim: function( object ) {
        // Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        var func = "".trim;

        return object == null ? "" : func && !func.call( "\uFEFF\xA0" ) ? func.call( object ) : ( object + "" ).replace( rtrim, "" );
    },

    /**
     * Return information about characters used in a string.
     *
     * Depending on mode will return one of the following:
     *  - 0: an array with the byte-value as key and the frequency of every byte as value
     *  - 1: same as 0 but only byte-values with a frequency greater than zero are listed
     *  - 2: same as 0 but only byte-values with a frequency equal to zero are listed
     *  - 3: a string containing all unique characters is returned
     *  - 4: a string containing all not used characters is returned
     * 
     * @method  countChars
     * @param   string {String}
     * @param   [mode] {Integer}
     * @return  {JSON}
     *
     * refer: http://www.php.net/manual/en/function.count-chars.php
     */
    countChars: function( string, mode ) {
        var result = null;
        var lib = this;

        if ( lib.isString( string ) ) {
            if ( !lib.isInteger( mode ) || mode < 0 ) {
                mode = 0;
            }

            var bytes = {};
            var chars = [];

            lib.each( string, function( chr, idx ) {
                var code = chr.charCodeAt(0);

                if ( lib.isNumber( bytes[code] ) ) {
                    bytes[code]++;
                }
                else {
                    bytes[code] = 1;

                    if ( lib.inArray( chars ) < 0 ) {
                        chars.push( chr );
                    }
                }
            });

            switch( mode ) {
                case 0:
                    break;
                case 1:
                    result = bytes;
                    break;
                case 2:
                    break;
                case 3:
                    result = chars.join("");
                    break;
                case 4:
                    break;
            }
        }

        return result;
    }

    /**
     * 将字符串转换为以 \u 开头的十六进制 Unicode
     * 
     * @method  unicode
     * @param   string {String}
     * @return  {String}
     */    
    // unicode: function( string ) {
    //     return unicode.call(this, string);
    // }

    /**
     * 对字符串编码
     * 
     * @method  encode
     * @param   target {String}     目标
     * @param   type {String}       编码类型
     * @return  {String}
     */
    /*encode: function( target, type ) {
        var result = target;

        type = String(type).toLowerCase();

        switch( type ) {
            case "unicode":
                result = unicode.call(this, target);
                break;
            case "base64":
                result = utf8_to_base64.call(this, target);
                break;
        }

        return result;
    },*/

    /**
     * 对字符串解码
     * 
     * @method  decode
     * @param   target {String}     目标
     * @param   type {String}       目标类型
     * @return  {String}
     */
    // decode: function( target, type ) {}
};

/**
 * 将字符串转换为以 \u 开头的十六进制 Unicode
 * 
 * @private
 * @method  unicode
 * @param   string {String}
 * @return  {String}
 */    
function unicode( string ) {
    var result = [];

    if ( this.isString( string ) ) {
        for( var i = 0; i < string.length; i++ ) {
            result.push( "\\u" + this.pad( Number(string[i].charCodeAt(0)).toString(16), 4, "0" ).toUpperCase() );
        }
    }

    return result.join("");
}

/**
 * 将 UTF8 字符串转换为 BASE64
 * 
 * @private
 * @method  utf8_to_base64
 * @param   string {String}
 * @return  {String}
 */    
function utf8_to_base64( string ) {
    var result = string;
    var btoa = window.btoa;
    var atob = window.atob;

    if ( this.isString( string ) ) {
        if ( this.isFunction( btoa ) ) {
            result = btoa( unescape(encodeURIComponent( string )) );
        }
    }

    return result;
}

});