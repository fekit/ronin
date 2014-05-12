/*!
 * jQuery-based double list item picker
 * 
 * Copyright 2013, Ourai Lin
 * 
 * Date: Thu Apr 18 22:35:13 2013
 */ 
;(function( window, $, undefined ) {

"use strict";

var _C = (function() {

    var Comp = function( setting ) {
            // 不是用 new 关键字构造时
            if ( this === undefined || this === window ) {
                return Comp.create( setting );
            }
            else {
                init.apply(this, [setting]);
            }
        },
        // 组件名称
        compName = {
            "full": "DoubleList",
            "alias": "DL"
        },
        // 组件的 CSS class
        classes = createClasses(compName.alias, [
            "doublelist", "buttonset", "button", "trigger",
            "list", "item",
            "tree", "branch", "node",
            "wrapper", "title", "content",
            "selected", "haschildren", "expanded", "collapsed",
            "viewTile", "operation", "append", "info", "icon", "extra", "text"
        ]),
        // 默认参数
        defaults = {
            // 视图
            "view": "list",         // "list", "tile"
            // 初始化的 HTML
            "element": null,
            // 初始化的数据
            "data": null,
            // 列表标题
            "label": {
                "alternative": "备选",
                "selected": "已选"
            },
            // 操作按钮
            "buttons": null,
            // 生成后
            "create": null,
            // 触发器
            "trigger": $.noop,
            "beforeAdd": $.noop,
            "beforeRemove": $.noop,
            // 添加
            "add": $.noop,
            // 删除
            "remove": $.noop,
            // 条目数据过滤
            "dataFilter": null
        },
        // 数据存储
        dataStore = {};

    /**
     * 创建对象
     * 
     * @method  create
     * @param       {JSON} setting
     * @return  {Object}
     */
    Comp.create = function( setting ) {
        return new Comp( setting );
    };

    Comp._classes = classes;

    Comp.unique = uniqueID;

    /**
     * 初始化操作
     * 
     * @private
     * @method  init
     * @param       {JSON} setting
     * @return
     */
    function init( setting ) {
        $.extend( this, {
            // 设置参数
            "_setting": defaults,
            // 来源
            "origin": null
        });

        if ( $.isPlainObject(setting) ) {
            this._setting = $.extend(true, defaults, setting);

            var data = this._setting.data;
            var hasData = $.isArray(data);
            var ele = $(this._setting.element);

            // 通过元素创建
            if ( ele.size() > 0 ) {
                this.origin = hasData ? "mix" : "html";

                __construct.apply(this, [ele, data]);
            }
            // 通过数据创建
            else if ( hasData ) {
                this.origin = "data";

                __construct.apply(this, [data]);
            }
        }
    }

    /**
     * 对象实例的方法
     */
    $.extend( Comp.prototype, {
        "produce": function( parent, data, view ) {
            parent = $(parent);

            if ( parent.size() === 1 && parent.get(0).tagName.toLowerCase() === "li" ) {
                parent.addClass( classes.haschildren ).append( "<ul />" );

                constructList.apply(this, [parent.children("ul"), data, view]);
            }
        },
        "destory": function() {
            // reset the double list to initial status
            // return { "element": list DOM, "data": initialization data }
        },
        "insert": function() {
            // insert an item into the left list
            // call the function 'constructListItem'
        },
        "remove": function() {
            // remove the selected item from left list
        },
        "append": function() {
            // move the selected item from left list to right list
            // call the function 'copyBranch'
        },
        "discard": function() {
            // move the selected item from right list to left list
        }
    });

    /**
     * 生成 CSS class 列表
     *
     * @private
     * @method  createClasses
     * @param       {String} prefix
     * @param       {Array} list
     * @return  {JSON}
     */
    function createClasses( prefix, list ) {
        var classSet = {};

        $.each( list, function( idx, item ) {
            classSet[$.camelCase(item)] = prefix + "-" + item.replace(/[A-Z]/, function( w ) {
                return "-" + w.toLowerCase();
            });
        });

        return classSet;
    }

    /**
     * 生成唯一标识
     * 
     * @private
     * @method  uniqueID
     * @param   {DOM} dom
     * @return  {String}
     */
    function uniqueID( dom ) {
        var id;
        var type;

        if ( $.type(dom) === "object" ) {
            if ( dom.tagName.toLowerCase() === "li" ) {
                type = "node";
            }
            else if ( dom.tagName.toLowerCase() === "ul" ) {
                type = "tree"
            }
        }
        else {
            type = dom;
        }

        if ( dataStore[type] === undefined ) {
            dataStore[type] = 0;
        }

        dataStore[type]++;
        id = type + "-" + dataStore[type];

        return id;
    }

    /**
     * 获取节点名（tagName）
     * 
     * @private
     * @method  getNodeName
     * @param   {DOM} node
     * @return  {String}
     */
    function getNodeName( node ) {
        return node.nodeName.toLowerCase();
    }

    /**
     * 构造双列表
     * 
     * @private
     * @method  __construct
     * @param   {Variant}
     * @return
     */
    function __construct() {
        var args = arguments;
        var flag = compName.full + "_inited";
        var data = args[0];
        var ele;

        // 从数据
        if ( $.isArray(data) ) {
            ele = $("<ul></ul>");
        }
        // 从元素
        else {
            data = args[1];
            ele = $(args[0])
        }

        // 初始化界面及事件
        if ( ele.size() === 1 && ele.data(flag) !== true ) {
            // UI
            constructList.apply(this, [ele, data]);
            constructFrame.apply(this, [ele]);

            var callback = this._setting.create;
            var dl = ele.closest("." + classes.doublelist);

            if ( $.isFunction(callback) ) {
                callback.apply(this, [dl]);
            }

            // 事件
            bindEvents.apply(this, [dl]);

            ele.data(flag, true);
        }
    }

    /**
     * 构建框架
     * 
     * @private
     * @method  constructFrame
     * @param   {jQuery DOM} ele
     * @return
     */
    function constructFrame( ele ) {
        ele.wrap("<div class=\"" + classes.doublelist + "\" />")
            .wrap("<dl class=\"" + classes.wrapper + "\" data-flag=\"alternative\" />")
            .before("<dt class=\"" + classes.title + "\">" + this._setting.label.alternative + "</dt>")
            .wrap("<dd class=\"" + classes.content + "\" />")
            .closest("dl").clone().attr("data-flag", "selected")
            .find("dt").text( this._setting.label.selected )
            .siblings("dd").find("ul").removeAttr("id").empty()
            .closest("dl").appendTo(ele.closest("." + classes.doublelist));

        var btns = this._setting.buttons;
        var html = [];

        if ( $.isArray( btns ) ) {
            html.push("<div class=\"" + classes.buttonset + "\">");

            $.each( btns, function( i, d ) {
                html.push("<button type=\"button\" class=\"" + classes.button + "\" data-action=\"" + d.action + "\" data-scope=\"" + (d.scope || "selected") + "\">" + d.text + "</button>");
            });

            html.push("</div>");

            ele.closest("dl").after( $(html.join("")) );
        }
    }

    /**
     * 构建列表
     * 
     * @private
     * @method  constructList
     * @param   {jQuery DOM} ele
     * @param   {Array} data
     * @param   {String} view
     * @return
     */
    function constructList( ele, data, view ) {
        var _this = this;
        var items = [];
        var level = ele.closest("ul[data-level]").attr("data-level");

        // 列表的层级
        if ( level !== undefined && level !== "" ) {
            level = level * 1 + 1;
        }
        else {
            level = 1;
        }

        ele.addClass( classes.list ).attr({ "data-level": level, "data-serial": uniqueID("list") });

        // 结构化列表条目
        ele.children("li").each(function() {
            constructItem.apply(_this, [this, view])
        });

        // 通过数据来构造条目
        $.each((data || []), function( i, d ) {
            items.push( constructItem.apply(_this, [d, view]) );
        });

        ele.append( items.join("") );
    }

    /**
     * 构建条目
     * 
     * @private
     * @method  constructItem
     * @param   {Variant} unkn
     * @param   {String} view
     * @return  {String}
     */
    function constructItem( unkn, view ) {
        var html = [];
        var setting = this._setting;

        if ( view in { "list": 1, "tile": 1 } === false ) {
            view = setting.view;
        }

        // 通过数据构造
        if ( $.isPlainObject(unkn) ) {
            var data = unkn;
            var filter = setting.dataFilter;
            var attrs = [];

            if ( $.isFunction(filter) ) {
                data = filter( data );
            }

            attrs.push( "class=\"" + classes.item + "\"" );
            attrs.push( "data-value=\"" + data.value + "\"" );
            attrs.push( "data-serial=\"" + uniqueID("item") + "\"" );

            // 图标/头像
            if ( $.type( data.icon ) === "string" ) {
                html.push( "<img class=\"" + classes.icon + "\" src=\"" + data.icon + "\">" );
            }

            html.push( "<span class=\"" + classes.text + "\">" + data.text + "</span>" );

            // 备注/额外信息
            if ( $.type( data.extra ) === "string" ) {
                html.push( "<span class=\"" + classes.extra + "\">" + data.extra + "</span>" );
            }

            html = ["<li " + attrs.join(" ") + ">" + constructNode(html.join(""), view) + "</li>"];
        }
        // 结构化 HTMLLIElement
        else if ( $.type(unkn) === "object" && getNodeName(unkn) === "li" ) {
            var li = $(unkn);
            var childNodes = li.children();
            var nodeCount = childNodes.size();
            var nodeHTML = "";

            li.addClass( classes.item ).attr("data-serial", uniqueID("item"));

            if ( li.attr("data-value") === undefined ) {
                li.attr("data-value", "");
            }

            // 文本节点
            if ( nodeCount === 0 ) {
                nodeHTML = constructNode(("<span class=\"" + classes.text + "\">" + $.trim(li.text()) + "</span>"), view);
            }
            else {
                // 子节点只有一个且为 a 或者 span
                if ( nodeCount === 1 && getNodeName(childNodes.get(0)) in { "a": 1, "span": 1 } ) {
                    childNodes.addClass( classes.text );
                }

                nodeHTML = constructNode(childNodes, view);
            }

            li.html( nodeHTML );
        }

        return html.join("");
    }

    /**
     * 构建节点
     * 
     * @private
     * @method  constructNode
     * @param   {String/jQuery DOM} nodeContent
     * @param   {String} view
     * @return  {String}
     */
    function constructNode( nodeContent, view ) {
        var node = $("<div />");
        var html = [];

        node.addClass( classes.node );

        if ( view === "tile" ) {
            node.addClass( classes.viewTile );
        }

        html.push( "<button class=\"" + classes.trigger + "\">trigger</button>" );
        html.push( "<div class=\"" + classes.operation + " " + classes.append + "\"><button>+</button></div>" );
        html.push( "<div class=\"" + classes.info + "\" />" );

        node.append( html.join("") ).children( "." + classes.info ).append( $(nodeContent) );

        return $("<div />").append( node ).html();
    }

    /**
     * 绑定事件
     * 
     * @private
     * @method  bindEvents
     * @param   {jQuery DOM} dl
     * @return
     */
    function bindEvents( dl ) {
        var inst = this;

        // 条目伸缩
        $("." + classes.item).live({
            "click": function( e ) {
                var callback = inst._setting.trigger;
                var li = $(this);
                var eCls = classes.expanded;
                var cCls = classes.collapsed;
                var sCls = classes.selected;
                var expanded = li.hasClass( eCls );
                var collapsed = li.hasClass( cCls );

                $(("." + sCls), li.closest("." + classes.content)).removeClass( sCls );
                li.addClass( sCls );

                // 节点可以伸缩时
                if ( expanded || collapsed ) {
                    if ( $.isFunction(callback) ) {
                        callback.apply(inst, [this, expanded, collapsed]);
                    }

                    if ( expanded ) {
                        li.removeClass( eCls ).addClass( cCls );
                    }
                    else if ( collapsed ) {
                        li.removeClass( cCls ).addClass( eCls );
                    }
                }

                return false;
            }
        });

        // 移动条目
        $("." + classes.operation + " button").live("click", function( e ) {
            var btn = $(this);
            var act = btn.parent().hasClass( classes.append ) ? "add" : "delete";

            copyItem.apply(inst, [btn.closest("." + classes.item).removeClass(classes.selected), act]);

            return false;
        });
    }

    /**
     * 复制条目
     * 
     * @private
     * @method  copyItem
     * @param   {jQuery DOM} li
     * @param   {String} act
     * @return
     */
    function copyItem( li, act ) {
        var parentBranch = li.closest("ul");
        var sourceList = li.closest("dl");
        var targetList = sourceList.siblings("dl");
        var flag = targetList.attr("data-flag");
        var btnWrp = li.children("." + classes.node).children("." + classes.operation);
        var setting = this._setting;
        var baseOn;
        var beforeCallback;
        var afterCallback;

        $("button", btnWrp).text( flag === "selected" ? "-" : "+" );

        if ( flag === "selected" ) {
            btnWrp.removeClass( classes.append );
        }
        else {
            btnWrp.addClass( classes.append );
        }

        if ( act === "add" ) {
            beforeCallback = setting.beforeAdd;
            afterCallback = setting.add;
        }
        else {
            beforeCallback = setting.beforeRemove;
            afterCallback = setting.remove;
        }

        if ( $.isFunction( beforeCallback ) ) {
            beforeCallback.apply(this, [li]);
        }

        // 目标列表中是否有 level 1 的 tree
        if ( $("dd", targetList).children("ul").size() === 0 ) {
            baseOn = $("dd", targetList).append( $("dd", sourceList).children("ul").clone().removeAttr("id").empty() );
        }

        // 逐层添加
        $.each( $.makeArray(li.parentsUntil("dd")).reverse(), function( idx, ele ) {
            var node = $(ele);
            var copy = $("[data-serial='" + node.attr("data-serial") + "']", targetList);

            if ( copy.size() === 0 ) {
                baseOn.append( node.clone().removeAttr("id").empty() );

                if ( node.is("li") ) {
                    baseOn = baseOn.children("li:last");

                    if ( baseOn.siblings("." + classes.node).size() === 0 ) {
                        baseOn.append( node.children("." + classes.node).clone() );
                    }
                }
                else if ( node.is("ul") ) {
                    baseOn = baseOn.children("ul");
                }
            }
            else {
                baseOn = copy;
            }
        });

        if ( $("[data-serial='" + li.attr("data-serial") + "']", targetList).size() > 0 ) {
            li.children("ul").children().each(function() {
                copyItem( $(this) );
            });

            li.remove();
        }
        else {
            baseOn.append( li );
        }

        if ( parentBranch.children("li").size() === 0 ) {
            parentBranch.closest("li").remove();
        }

        if ( $.isFunction( afterCallback ) ) {
            afterCallback.apply(this, [li]);
        }
    }

    return Comp;

})();

window.DoubleList = _C;

})( window, window.jQuery );
