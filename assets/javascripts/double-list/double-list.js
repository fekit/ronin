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
				init( setting );
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
			"selected", "haschildren", "title", "content"
		]),
		// 默认参数
		defaults = {
			"listTitle": {
				"alternative": "备选",
				"selected": "已选"
			},
			"buttons": null
		};

	/**
	 * 创建对象
	 * 
	 * @method	create
	 * @param		{JSON} setting
	 * @return	{Object}
	 */
	Comp.create = function( setting ) {
		return new Comp( setting );
	};

	/**
	 * 初始化操作
	 * 
	 * @private
	 * @method	init
	 * @param		{JSON} setting
	 * @return
	 */
	function init( setting ) {
		var ul, flag, data;

		// 只能对一个列表进行初始化
		if ( $.isPlainObject(setting) && $(setting.element).size() === 1 ) {
			flag = compName.full + "_inited";
			ul = $(setting.element);

			defaults = $.extend(true, defaults, setting);

			// 限制目标为 ul
			if ( String(ul.get(0).nodeName).toLowerCase() === "ul" && ul.data(flag) !== true ) {
				data = setting.data;

				constructListFrame( ul );

				// 根据传入数据构造列表
				if ( $.isArray(data) ) {
					constructList( ul.empty(), data );
				}
				// 从原有 HTML 结构化列表
				else {
					structuredList( ul );
				}

				addEvents( ul );

				ul.data(flag, true);
			}
		}
	}

	/**
	 * 生成 CSS class 列表
	 *
	 * @private
	 * @method	createClasses
	 * @param		{String} prefix
	 * @param		{Array} list
	 * @return	{JSON}
	 */
	function createClasses( prefix, list ) {
		var classSet = {};

		$.each( list, function( idx, item ) {
			classSet[$.camelCase(item)] = prefix + "-" + item;
		});

		return classSet;
	}

	/**
	 * 构建框架
	 * 
	 * @private
	 * @method	constructListFrame
	 * @param		{jQuery DOM} ul
	 * @return
	 */
	function constructListFrame( ul ) {
		var template = ["<dl><dt class=\"" + classes.title + "\">" +
						defaults.listTitle.alternative + "</dt><dd class=\"" + classes.content + "\"></dd></dl>"],
			buttons = ["<div class=\"" + classes.buttonset + "\">"],
			container, dls;

		ul.addClass(classes.tree).wrap("<div class=\"" + classes.doublelist + "\" />");

		if ( $.isArray(defaults.buttons) === false ) {
			defaults.buttons = [{ "text": "全部添加 &gt;&gt;", "action": "add", "scope": "all" },
								{ "text": "添加 &gt;", "action": "add" },
								{ "text": "&lt; 删除", "action": "delete" },
								{ "text": "&lt;&lt; 全部删除", "action": "delete", "scope": "all" }];
		}

		$.each( defaults.buttons, function( idx, info ) {
			buttons.push("<button type=\"button\" class=\"" + classes.button + "\" data-action=\"" + info.action + "\" data-scope=\"" + (info.scope || "selected") + "\">" + info.text + "</button>");
		});
		buttons.push("</div>");

		container = ul.closest("." + classes.doublelist);
		container.append(template.join("") + buttons.join("") + template.join(""));
		dls = $("dl", container);

		dls.eq(0).attr("data-flag", "source")
			.find("dd").append( ul );
		dls.eq(1).attr("data-flag", "target")
			.find("dt").text( defaults.listTitle.selected );
	}

	/**
	 * 构建列表
	 * 
	 * @private
	 * @method	constructList
	 * @param		{jQuery DOM} ul
	 * @param		{Array} data
	 * @return
	 */
	function constructList( ul, data ) {
		var level;

		if ( $.isArray(data) ) {
			level = ul.closest("ul[data-level]").attr("data-level");
			level = level !== undefined && level !=="" ? (level * 1 + 1) : 1;

			ul.attr({
				"data-level": level,
				"data-tree": (new Date).getTime()
			});

			// 读取数据添加节点
			$.each( data, function( i, d ) {
				var hasChildren = $.isArray(d.children) && d.children.length > 0,
						li;

				// if ( level === 1 && hasChildren === false ) {
				// 	return false;
				// }

				ul.append("<li data-value=\"" + (d.value || "") + "\"><div class=\"" + classes.node + "\"><span>" + d.text + "</span></div></li>");

				// 深度添加节点
				if ( hasChildren ) {
					li = $("li:last", ul);
					li.addClass(classes.haschildren).append("<ul class=\"" + classes.tree + "\" />");

					constructList( $("ul", li), d.children );
				}
			});
		}
	}

	/**
	 * 结构化列表
	 * 
	 * @private
	 * @method	structuredList
	 * @param		{jQuery DOM} ul
	 * @return
	 */
	function structuredList( ul ) {
		var childNodes = ul.children("li");

		childNodes.each(function() {
			var node = $(this),
					child = node.children(),
					count = child.size(),
					value = node.attr("data-value"),
					temp;
			
			if ( $.type(value) === "string" && value !== "" ) {
				// 文本节点
				if ( count === 0 ) {
					temp = $.trim(node.text());
					node.empty().append("<div class=\"" + classes.node + "\"><span>" + temp + "</span></div>");
				}
				// 子节点只有一个且为 a 或者 span
				else if( count === 1 && child.get(0).nodeName.toLowerCase() in { "a": 1, "span": 1 } ) {
					child.wrap("<div class=\"" + classes.node + "\" />");
				}
				// 移除不符合规定的节点
				else {
					node.remove();
				}
			}
			else {
				node.remove();
			}
		});
	}

	/**
	 * 添加事件
	 * 
	 * @private
	 * @method	addEvents
	 * @param		{jQuery DOM} ul
	 * @return
	 */
	function addEvents( ul ) {
		// 树节点
		$("li", $("." + classes.doublelist)).live({
			"click": function( e ) {
				var li = $(this),
						cls = classes.selected;

				// 按住 CTRL 键进行多选
				if ( e.ctrlKey ) {
					if ( li.hasClass(cls) ) {
						li.removeClass(cls);
					}
					else {
						li.addClass(cls);
					}
				}
				else {
					$(("li." + cls), li.closest("dd")).not(li).removeClass(cls);

					if ( li.hasClass(cls) === false ) {
						li.addClass(cls);
					}
				}

				return false;
			},
			"dblclick": function( e ) {}
		});

		// 按钮
		$("button", $("." + classes.doublelist)).bind({
			"click": function( e ) {
				var btn = $(this),
						DL_container = btn.closest("." + classes.doublelist),
						source, target, collection;

				if ( btn.attr("data-action") === "add" ) {
					source = $("dl[data-flag='source']", DL_container).children("." + classes.content);
					target = $("dl[data-flag='target']", DL_container).children("." + classes.content);
				}
				else {
					source = $("dl[data-flag='target']", DL_container).children("." + classes.content);
					target = $("dl[data-flag='source']", DL_container).children("." + classes.content);
				}

				if ( btn.attr("data-scope") === "all" ) {
					collection = $("li:not(." + classes.haschildren + ")", source);
				}
				else {
					collection = $(("." + classes.selected), source)
				}

				collection.each(function() {
					copyBranch($(this).removeClass(classes.selected));
				});
			}
		});
	}

	/**
	 * 复制树枝
	 * 
	 * @private
	 * @method	copyBranch
	 * @param		{jQuery DOM} li
	 * @return
	 */
	function copyBranch( li ) {
		var parentBranch = li.closest("ul"),
				sourceList = li.closest("dl"),
				targetList = sourceList.siblings("dl"),
				baseOn;

		if ( $("dd", targetList).children("ul").size() === 0 ) {
			baseOn = $("dd", targetList).append( $("dd", sourceList).children("ul").clone().empty() );
		}

		$.each( $.makeArray(li.parentsUntil("dd")).reverse(), function( idx, ele ) {
			var tagName, copy, attr;

			tagName = ele.tagName.toLowerCase();
			ele = $(ele);

			switch( tagName ) {
				case "li":
					attr = "data-value";
					break;
				case "ul":
					attr = "data-tree";
					break;
			}

			copy = $("[" + attr + "='" + ele.attr(attr) + "']", targetList);

			if ( copy.size() === 0 ) {
				if ( tagName === "li" ) {
					baseOn.append( ele.clone().empty() );
					baseOn = baseOn.children("li:last");

					if ( baseOn.siblings("." + classes.node).size() === 0 ) {
						baseOn.append( ele.children("." + classes.node).clone() );
					}
				}
				else if ( tagName === "ul" ) {
					baseOn.append( ele.clone().empty() );
					baseOn = baseOn.children("ul");
				}
			}
			else {
				baseOn = copy;
			}
		});

		baseOn.append( li );

		if ( parentBranch.children("li").size() === 0 ) {
			parentBranch.closest("li").remove();
		}
	}

	return Comp;

})();

window.DoubleList = _C;

})( window, window.jQuery );