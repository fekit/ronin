/*!
 * URI Scheme parser
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 *
 * refer:
 *  - http://en.wikipedia.org/wiki/URI_scheme
 * 
 * Copyright (c) 2013 Ourai.WS http://ourai.ws/
 */
define(function( require, exports, module ) {

"use strict";

module.exports = {
    /**
     * 解析并返回 URL 的各部分信息 
     * 
     * @method  parseURL
     * @param   url {String}            待解析的 url
     * @param   protocol_list {Array}   被禁止的协议列表
     * @return  {JSON}
     */
    parseURL: function( url, protocol_list ) {
        var result = null;

        if ( this.isString( url ) ) {
            var rHost = /^([\w-]+\.)+?[\w-]+?$/;
            var rIP = /^(([1-9]?\d|(1\d{2}|2([0-4]\d|5[0-5])))\.?){3}([1-9]?\d|(1\d{2}|2([0-4]\d|5[0-5])))(:\d{1,5})?$/;
            var host = url.split("/")[0];
            var link = document.createElement( "a" );
            
            // 所传字符串是域名格式时默认为 HTTP 协议
            if ( rHost.test( host ) || rIP.test( host ) ) {
                url = "http:\/\/" + url;
            }
            
            result = {};
            link.href = url;
            
            // 遍历 Link DOM 的属性
            for ( var attr_key in link ) {
                // 捕获 IE9- 中有的属性所造成的异常
                try {
                    var attr_val = link[attr_key];
                    
                    // 只获取 Location 对象中存在的属性
                    if ( this.isString(attr_val) && location[attr_key] !== undefined ) {
                        result[attr_key] = attr_val;
                    }
                }
                catch( e ) {
                }
            }
            
            var protocol = result.protocol;
            
            if ( this.isArray( protocol_list ) === false ) {
                protocol_list = [];
            }
            
            // 默认禁止 JavaScript 与 data URI 协议
            protocol_list.push( "javascript" );
            protocol_list.push( "data" );
            
            // 协议为空值（undefined 及 null）或在禁止协议列表中
            if ( this.isString( protocol ) === false || (new RegExp(("^" + protocol_list.join("|")), "i")).test( protocol ) ) {
                result = null;
            }
        }

        return result;
    }/*,

    parseHash: function() {},

    parseJSON: function() {},*/

    /**
     * 转换为字符串
     *
     * @method  stringify
     * @param   object {Mixed}
     * @return  {String}
     */
    //stringify: function() {}
};

});
