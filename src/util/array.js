/*!
 * Array
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

module.exports = {
    /**
     * 元素在数组中的位置
     * 
     * @method  inArray
     * @param   element {Mixed}   待查找的数组元素
     * @param   array {Array}     数组
     * @param   from {Integer}    起始索引
     * @return  {Integer}
     */
    inArray: function( element, array, from ) {
        var index = -1;

        if ( this.isArray( array ) ) {
            var indexOf = Array.prototype.indexOf;
            var length = array.length;

            from = from ? from < 0 ? Math.max( 0, length + from ) : from : 0;

            if ( indexOf ) {
                index = indexOf.apply( array, [element, from] );
            }
            else {
                for ( ; from < length; from++ ) {
                    if ( from in array && array[from] === element ) {
                        index = from;
                        break;
                    }
                }
            }
        }

        return index;
    },

    /**
     * 过滤数组、对象
     *
     * @method  filter
     * @param   target {Array/Object/String}    被过滤的目标
     * @param   callback {Function}             过滤用的回调函数
     * @param   [context] {Mixed}               回调函数的上下文
     * @return  {Array/Object/String}           与被过滤的目标相同类型
     *
     * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
     */
    filter: function( target, callback, context ) {
        return filterElement.apply(
                    this,
                    [
                        target,
                        callback,
                        context,
                        [].filter,
                        function( stack, cbVal, ele, idx, plainObj, arrOrStr ) {
                            if ( cbVal ) {
                                if ( plainObj ) {
                                    stack[ idx ] = ele;
                                }
                                else if ( arrOrStr ) {
                                    stack.push( ele );
                                }
                            }
                        }
                    ]
                );
    },

    /**
     * 改变对象/数组/字符串每个单位的值
     *
     * @method  map
     * @param   target {Array/Object/String}    被操作的目标
     * @param   callback {Function}             改变单位值的回调函数
     * @param   [context] {Mixed}               回调函数的上下文
     * @return  {Array/Object/String}           与被过滤的目标相同类型
     *
     * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
     */
    map: function( target, callback, context ) {
        return filterElement.apply(
                    this,
                    [
                        target,
                        callback,
                        context,
                        [].map,
                        function( stack, cbVal, ele, idx, plainObj, arrOrStr ) {
                            stack[ idx ] = cbVal;
                        }
                    ]
                );
    },

    /**
     * Calculate product of an array.
     *
     * @method  product
     * @param   array {Array}
     * @return  {Number}
     */
    product: function( array ) {
        var result = 1;
        var count = 0;
        var lib = this;

        lib.each( array, function( number, index ) {
            if ( lib.isNumeric( number ) ) {
                count++;
                result *= number;
            }
        });

        return count === 0 ? 0 : result;
    },

    /**
     * Remove repeated values.
     * A numeric type string will be converted to number.
     *
     * @method  unique
     * @param   array {Array}
     * @param   last {Boolean}  whether keep the last value
     * @return  {Array}
     */
    unique: function( array, last ) {
        var result = [];
        var lib = this;

        last = !!last;

        if ( lib.isArray( array ) ) {
            lib.each( (last ? array.reverse() : array), function( n, i ) {
                if ( lib.isNumeric( n ) ) {
                    n = parseFloat( n );
                }

                if ( lib.inArray( n, result ) === -1 ) {
                    result.push( n );
                }
            });

            if ( last ) {
                array.reverse();
                result.reverse();
            }
        }

        return result;
    },

    /**
     * 建立一个包含指定范围单元的数组
     * 返回数组中从 from 到 to 的单元，包括它们本身。
     * 如果 from > to，则序列将从 to 到 from。
     *
     * @method  range
     * @param   from {Number/String}    起始单元
     * @param   to {Number/String}      终止单元
     * @param   [step] {Number}         单元之间的步进值
     * @return  {Array}
     *
     * refer: http://www.php.net/manual/en/function.range.php
     */
    range: function( from, to, step ) {
        var result = [];
        var lib = this;
        var callback;

        // step 应该为正值。如果未指定，step 则默认为 1。
        step = lib.isNumeric( step ) && step * 1 > 0 ? step * 1 : 1;

        // Numeric
        if ( lib.isNumeric( from ) && lib.isNumeric( to ) ) {
            var l_from = floatLength( from );
            var l_to = floatLength( to );
            var l_step = floatLength( step );
            var decDigit = Math.max( l_from, l_to, l_step );

            // 用整数处理浮点数，避免精度问题造成的 BUG
            if ( decDigit > 0 ) {
                decDigit = lib.zerofill( 1, decDigit + 1 ) * 1;
                step *= decDigit;

                callback = function( number ) {
                    return number/decDigit;
                };
            }
            else {
                decDigit = 1;
            }

            from *= decDigit;
            to *= decDigit;
        }
        // English alphabet
        else {
            var rCharL = /^[a-z]$/;
            var rCharU = /^[A-Z]$/;

            from += "";
            to += "";

            if ( rCharL.test( from ) && rCharL.test( to ) || rCharU.test( from ) && rCharU.test( to ) ) {
                from = from.charCodeAt(0);
                to = to.charCodeAt(0);

                callback = function( code ) {
                    return String.fromCharCode( code );
                };
            }
        }

        if ( lib.isNumber( from ) && lib.isNumber( to ) ) {
            if ( from > to ) {
                result = range(to, from, step, callback).reverse();
            }
            else if ( from < to ) {
                result = range(from, to, step, callback);
            }
            else {
                result = [ callback ? callback( from ) : from ];
            }
        }

        return result;
    },

    /**
     * Apply a function simultaneously against two values of the 
     * array (default is from left-to-right) as to reduce it to a single value.
     *
     * @method  reduce
     * @param   array {Array}           An array of numeric values to be manipulated.
     * @param   callback {Function}     Function to execute on each value in the array.
     * @param   [initialValue] {Mixed}  Object to use as the first argument to the first call of the callback.
     * @param   [right] {Boolean}       Whether manipulates the array from right-to-left.
     * @return  {Mixed}
     *
     * Callback takes four arguments:
     *  - previousValue
     *          The value previously returned in the last invocation of the callback, or initialValue, if supplied.
     *  - currentValue
     *          The current element being processed in the array.
     *  - index
     *          The index of the current element being processed in the array.
     *  - array
     *          The array reduce was called upon.
     *
     * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
     *        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
     */
    reduce: function( array, callback, initialValue, right ) {
        var lib = this;
        var result;

        right = !!right;

        if ( lib.isArray( array ) ) {
            var args = arguments;
            var origin = right ? [].reduceRight : [].reduce;
            var hasInitVal = args.length > 2;

            if ( origin ) {
                result = origin.apply( array, (hasInitVal ? [callback, initialValue] : [callback]) );
            }
            else {
                var index = 0;
                var length = array.length;

                if ( !hasInitVal ) {
                    initialValue = array[0];
                    index = 1;
                    length--;
                }

                if ( lib.isFunction( callback ) ) {
                    length = hasInitVal ? length : length + 1;

                    for ( ; index < length; index++ ) {
                        initialValue = callback.apply( window, [initialValue, array[index], index, array] );
                    }

                    result = initialValue;
                }
            }
        }

        return result;
    },

    /**
     * Flattens a nested array.
     *
     * @method  flatten
     * @param   array {Array}   a nested array
     * @return  {Array}
     */
    flatten: function( array ) {
        var result = flattenArray.call( this, array );

        return this.isArray( result ) ? result : [];
    }
};

/**
 * A internal usage to flatten a nested array.
 *
 * @private
 * @method  flattenArray
 * @param   array {Array}
 * @return  {Mixed}
 */
function flattenArray( array ) {
    var lib = this;
    var arr = [];

    if ( lib.isArray( array ) ) {
        lib.each( array, function( n, i ) {
            arr = arr.concat( flattenArray.call( lib, n ) );
        });
    }
    else {
        arr = array;
    }

    return arr;
}

/**
 * 获取小数点后面的位数
 *
 * @private
 * @method  floatLength
 * @param   number {Number}
 * @return  {Integer}
 */
function floatLength( number ) {
    var rfloat = /^([-+]?\d+)\.(\d+)$/;

    return (rfloat.test( number ) ? (number + "").match( rfloat )[2] : "").length;
}

/**
 * Create an array contains specified range.
 *
 * @private
 * @method  range
 * @param   from {Number/String}
 * @param   to {Number/String}
 * @param   step {Number}
 * @param   callback {Function}
 * @return  {Array}
 */
function range( begin, end, step, callback ) {
    var array = [];

    for ( ; begin <= end; ) {
        array.push( callback ? callback( begin ) : begin );

        begin += step;
    }

    return array;
}

/**
 * Filter elements in a set.
 * 
 * @private
 * @method  filterElement
 * @param   target {Array/Object/String}    operated object
 * @param   callback {Function}             callback to change unit's value
 * @param   context {Mixed}                 context of callback
 * @param   method {Function}               Array's prototype method
 * @param   func {Function}                 callback for internal usage
 * @return  {Array/Object/String}           与被过滤的目标相同类型
 */
function filterElement( target, callback, context, method, func ) {
    var result = null;
    var lib = this;

    if ( lib.isFunction( callback ) ) {
        var arrOrStr = lib.type( target ) in { "array": true, "string": true };

        // default context is the window object
        if ( context == null ) {
            context = window;
        }

        // use Array's prototype method
        if ( lib.isFunction( method ) && arrOrStr ) {
            result = method.apply( target, [callback, context] );
        }
        else {
            var plainObj = lib.isPlainObject( target );

            if ( plainObj ) {
                result = {};
            }
            else if ( arrOrStr ) {
                result = [];
            }

            if ( result !== null ) {
                lib.each( target, function( ele, idx ) {
                    var cbVal = callback.apply( context, [ele, idx, lib.isString(target) ? new String(target) : target] );

                    func( result, cbVal, ele, idx, plainObj, arrOrStr )
                });
            }
        }

        if ( lib.isString( target ) ) {
            result = result.join( "" );
        }
    }

    return result;
}

});
