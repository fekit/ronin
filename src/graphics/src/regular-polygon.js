(function( window ) {
	
var Polygon = (function() {
	
var Polygon = function( count, radius ) {
		return new RegularPolygon( count, radius );
	}
	
function RegularPolygon( count, radius ) {
	count = Number( count );
	
	if ( !isNaN( count ) && count > 0 ) {
		var dCircle = 360/count,										// 圆心角度数
			cCircle = {x: 0, y: 0},										// 外接圆圆心坐标
			dApex = 180-dCircle,										// 多边形顶角度数
			cApex = {x: cCircle.x, y: cCircle.y - radius},				// 多边形顶点坐标
		
		radius = radius || 100;											// 外接圆半径
		
		this.vertices = new Array();
		
		this.apex = {
			coordinate: cApex,
			degree: dApex
		};
		
		this.radian = function (degree) {
			return degree*Math.PI/180;
		};
		
		this.side = {
			length: Math.round(Math.abs(Math.sin(this.radian(dCircle/2))*radius*2)),
			count: count
		};
		
		this.circle = {
			radius: radius,
			coordinate: cCircle,
			degree: dCircle
		}
		
		if (count != 1 && count != 4) {
			countCoordinate.call( this );
		}
		else if (count == 4) {
			this.vertices.push( { coordinate: cApex } );
			this.vertices.push( { coordinate: { x: cCircle.x - radius, y: cCircle.y } } );
			this.vertices.push( { coordinate: { x: cCircle.x, y: cCircle.y + radius } } );
			this.vertices.push( { coordinate: { x: cCircle.x + radius, y: cCircle.y } } );
		}
		
		for ( var i=0, j=this.vertices; i<j.length; i++ ) {
			j[i].color = getColorCircle.call( this, j[i], i );
		}
	}
}

// 获取点坐标
function countCoordinate() {
	this.vertices.push( { coordinate: this.apex.coordinate } );
	
	var count = this.side.count,
		dCircle = this.circle.degree,
		cCircle = this.circle.coordinate,
		radius = this.circle.radius,
	
		_oddEven = count%2 == 0 ? "even" : "odd",										// 角数为奇偶
		_hw = null,
		
		_fixedCornerAmount = _oddEven == "odd" ? 1 : 2,
		_aboveCornerAmount = dCircle < 90 ? Math.floor(90/dCircle) : 0,
		_belowCornerAmount = 0,
		
		_aboveLeft = new Array(),														// 圆中心轴左侧点坐标集合（包括顶点）
		_aboveRight = new Array(),														// 圆中心轴右侧点坐标集合（包括底点）
		_belowLeft = new Array(),
		_belowRight = new Array();
					
	for (var i=1; i<=_aboveCornerAmount; i++) {
		_hw = getCornerHW.call(this, i*dCircle, "above");
		_aboveLeft.push( { coordinate: { x: cCircle.x - _hw.width, y: cCircle.y - _hw.height } } );
		_aboveRight.unshift( { coordinate: { x: cCircle.x + _hw.width, y: cCircle.y - _hw.height } } );
	}
	
	if (_oddEven == "odd") {
		_belowCornerAmount = (count - _fixedCornerAmount - _aboveCornerAmount*2)/2;
		
		for (var i=0; i<_belowCornerAmount; i++) {
			_hw = getCornerHW.call(this, i*dCircle);
			_belowLeft.unshift( { coordinate: { x: cCircle.x - _hw.width, y: cCircle.y + _hw.height } } );
			_belowRight.push( { coordinate: { x: cCircle.x + _hw.width, y: cCircle.y + _hw.height } } );
		}
		
		this.vertices = this.vertices.concat( _aboveLeft ).concat( _belowLeft ).concat( _belowRight ).concat( _aboveRight );
	}
	else {
		for ( var i=0, j=_aboveLeft; i<j.length; i++ ) {
			if ( j[i].coordinate.y != Math.abs(j[i].coordinate.y) ) {
				_belowLeft.unshift( { coordinate: { x: j[i].coordinate.x, y: cCircle.y + Math.abs(j[i].coordinate.y) } } );
			}
		}
						
		for ( var i=0, j=_aboveRight; i<j.length; i++ ) {
			if ( j[i].coordinate.y != Math.abs(j[i].coordinate.y) ) {
				_belowRight.unshift( { coordinate: { x: j[i].coordinate.x, y: cCircle.y + Math.abs(j[i].coordinate.y) } } );
			}
		}
		
		(this.vertices = this.vertices.concat( _aboveLeft.concat(_belowLeft) )).push( { coordinate: { x: cCircle.x, y: cCircle.y + radius } } );
		this.vertices = this.vertices.concat( _belowRight.concat(_aboveRight) );
	}
}

function getCornerHW(_cornerdegree, _cornerposition) {
	var _cd = _cornerdegree;
	_cd = _cornerposition == "above" ? (90-_cd) : (90-_cd-this.circle.degree/2);
	
	return {
		height: Math.round(Math.abs(Math.sin(this.radian(_cd))*this.circle.radius)),
		width: Math.abs((Math.cos(this.radian(_cd))*this.circle.radius))
	}
}

// 获取对应坐标的颜色值
function getColorCircle( vertex, index ) {
	var C = M = Y = K = 0,																// CMYK 颜色
		colorCentralAngle = 120,														// CMY 三色点所组成三角形的圆心角度数
		currentAngle = this.circle.degree * index,
		color = { cmyk: {}, rgb: {}, web: {} };
	
	if ( currentAngle%colorCentralAngle == 0 ) {
		color.cmyk = currentAngle/colorCentralAngle == 0 ?
					{ "C": 0, "M": 100, "Y": 100, "K": 0 } : currentAngle/colorCentralAngle == 1 ?
					{ "C": 100, "M": 100, "Y": 0, "K": 0 } : { "C": 100, "M": 0, "Y": 100, "K": 0 };
	}
	else if ( currentAngle > 0 && currentAngle < colorCentralAngle ) {
		color.cmyk = {
				"C": currentAngle <= 60 ? 0 : (currentAngle - 60)/60*100,
				"M": 100,
				"Y": currentAngle >= 60 ? 0 : (60 - currentAngle)/60*100,
				"K": 0
			};
	}
	else if ( currentAngle > colorCentralAngle && currentAngle < colorCentralAngle*2  ) {
		color.cmyk = {
				"C": 100,
				"M": currentAngle >= 180 ? 0 : (180 - currentAngle)/60*100,
				"Y": currentAngle <= 180 ? 0 : (currentAngle - 180)/60*100,
				"K": 0
			};
	}
	else if ( currentAngle > colorCentralAngle*2 && currentAngle < colorCentralAngle*3 ) {
		color.cmyk = {
				"C": currentAngle >= 300 ? 0 : (300 - currentAngle)/60*100,
				"M": currentAngle <= 300 ? 0 : (currentAngle - 300)/60*100,
				"Y": 100,
				"K": 0
			};
	}
	
	color.rgb = CMYK2RGB( color.cmyk );
	color.web = RGB2WEB( color.rgb );
	
	return color;
}

/*
	R   =   255*(100-C)*(100-K)/10000;
	G   =   255*(100-M)*(100-K)/10000;
	B   =   255*(100-Y)*(100-K)/10000; 
 */
function CMYK2RGB( CMYK ) {
	return {
			"R": Math.round( 255*(100-CMYK.C)*(100-CMYK.K)/10000 ),
			"G": Math.round( 255*(100-CMYK.M)*(100-CMYK.K)/10000 ),
			"B": Math.round( 255*(100-CMYK.Y)*(100-CMYK.K)/10000 )
		};
}

function RGB2WEB( RGB ) {
	var web = new Array();
	
	for ( var i in RGB ) {
		var color = RGB[i].toString(16);
		web.push( color.length == 1 ? "0" + color : color );
	}
	return web.join( "" ).toUpperCase();
}

function color2code( RGB ) {
	return "rgb(" + RGB.R + "," + RGB.G + "," + RGB.B + ")";
}

function createSVG( container, size ) {
	var svg = createSVGElement( "svg" ), g,
		gradientWrapper,														// 渐变效果
		lineWrapper, shapeWrapper, textWrapper, tspanWrapper, filterWrapper,
		num,
		shape = "circle";
	
	svg.createSVGRect();
	setElementAttr( svg, {
		id: "polySVG",
		version: "1.1",
		width: 690,
		height: "100%",
		"xmlns": "http://www.w3.org/2000/svg"
	} );
	gradientWrapper = createSVGElement( "defs" );
	svg.appendChild( gradientWrapper );
	
	for ( var i=0; i<3; i++ ) {
		svg.appendChild( setElementAttr( createSVGElement( "g" ), { id: "polyG-" + (i+1) } ) );
	}
	
	container.appendChild( svg );
	
	lineWrapper = document.getElementById( "polyG-1" );
	shapeWrapper = document.getElementById( "polyG-2" );
	textWrapper = document.getElementById( "polyG-3" );
	shape = shape.toLowerCase();
	
	filterWrapper = setElementAttr( createSVGElement( "filter" ), {
		id: "filter"
	});
	gradientWrapper.appendChild( filterWrapper );
	
	for ( var i=0, j=this.vertices; i<j.length; i++ ) {
		num = i + 1;
		
		// 放射渐变
		var radialGradient = setElementAttr( createSVGElement( "radialGradient" ), {
				id: "radialGradient-" + num,
				cx: "50%",
				cy: "25%",
				r: "50%",
				fx: "50%",
				fy: "10%"
			} ),
			radialGradientStop1 = setElementAttr( createSVGElement( "stop" ), {
				offset: "0%",
				style: "stop-color: rgb(255,255,255); stop-opacity:1;"
			} ),
			radialGradientStop2 = setElementAttr( createSVGElement( "stop" ), {
				offset: "100%",
				style: "stop-color: " + color2code( j[i].color.rgb ) + "; stop-opacity:1;"//rgb(230,0,18)
			} );
		radialGradient.appendChild( radialGradientStop1 );
		radialGradient.appendChild( radialGradientStop2 );
		gradientWrapper.appendChild( radialGradient );
		
		// 线性渐变
		var linearGradient = setElementAttr( createSVGElement( "linearGradient" ), {
				id: "linearGradient-" + num,
				x1: "0%",
				y1: "0%",
				x2: "100%",
				y2: "100%"
			} ),
			linearGradientStop1 = setElementAttr( createSVGElement( "stop" ), {
				offset: "0%",
				style: "stop-color: " + color2code( j[i].color.rgb ) + "; stop-opacity:1;"
			} ),
			linearGradientStop2 = setElementAttr( createSVGElement( "stop" ), {
				offset: "100%",
				style: "stop-color: " + color2code( j[i+1] ? j[i+1].color.rgb : j[0].color.rgb ) + "; stop-opacity:1;"
			} );
		linearGradient.appendChild( linearGradientStop1 );
		linearGradient.appendChild( linearGradientStop2 );
		gradientWrapper.appendChild( linearGradient );
		
		shapeWrapper.appendChild( setElementAttr( createSVGElement( shape ), {
			id: shape + "-" + num,
			cx: j[i].coordinate.x,
			cy: j[i].coordinate.y,
			r: size,
			fill: "url(#radialGradient-" + num + ")"
		} ) );
		
		tspanWrapper = setElementAttr( createSVGElement( "text" ), {
			id: "text-" + num,
			fill: "#FFF",
			style: "font: normal bold 14px/1.5 SimSun; text-align: center;"
		} );
		
		var tspan = setElementAttr( createSVGElement( "tspan" ), {
			id: "tspan-" + num,
			x: j[i].coordinate.x,
			y: j[i].coordinate.y
		} );
		
		tspan.appendChild( document.createTextNode( "关键字检测" + num ) );
		tspanWrapper.appendChild( tspan );
		textWrapper.appendChild( tspanWrapper );
//		setElementAttr( tspan, { x: j[i].coordinate.x - tspanWrapper.getBBox().width/2, y: j[i].coordinate.y + tspanWrapper.getBBox().height/4 } );
		
		lineWrapper.appendChild( setElementAttr( createSVGElement( "line" ), {
			id: "line-" + num,
			x1: j[i].coordinate.x,
			y1: j[i].coordinate.y,
			x2: j[i+1] ? j[i+1].coordinate.x : j[0].coordinate.x,
			y2: j[i+1] ? j[i+1].coordinate.y : j[0].coordinate.y,
			stroke: "url(#linearGradient-" + num + ")",
			"stroke-width": 8
		} ) );
	}
	
	shapeWrapper.appendChild( setElementAttr( createSVGElement( shape ), {
		id: shape + "-center",
		cx: this.circle.coordinate.x,
		cy: this.circle.coordinate.y,
		r: 5,
		fill: "black"
	} ) );
}

function createVML( container, size ) {
	// 添加 namespace
	if ( !document.namespaces.rpv ) {
		document.namespaces.add( "rpv", "urn:schemas-microsoft-com:vml" );
		document.createStyleSheet().cssText = "rpv\\:group, rpv\\:fill, rpv\\:path, rpv\\:shape, rpv\\:stroke, rpv\\:line, rpv\\:oval { behavior:url(#default#VML); display: inline-block; }";
	}
	
	var vml, g,
		gradientWrapper,														// 渐变效果
		lineWrapper, shapeWrapper, textWrapper, tspanWrapper,
		num,
		shape = "oval";
	
	vml = createVMLElement( ["<group id=\"polyVML\" style=\"position: relative; width: 690px; height: 690px;\" />"] );
	for ( var i=0; i<3; i++ ) {
		vml.appendChild( createVMLElement( ["<group id=\"polyG-" + (i+1) + "\" coordorig=\"-1000, -1000\" coordsize=\"500, 500\" style=\"position: relative; width: 690px; height: 690px;\" />"] ) );
	}
	container.appendChild( vml );
	
	
	
	lineWrapper = document.getElementById( "polyG-1" );
	shapeWrapper = document.getElementById( "polyG-2" );
	textWrapper = document.getElementById( "polyG-3" );
	
	for ( var i=0, j=this.vertices; i<j.length; i++ ) {
		num = i + 1;
		
//		// 放射渐变
//		var radialGradient = setElementAttr( createSVGElement( "radialGradient" ), {
//				id: "radialGradient-" + num,
//				cx: "50%",
//				cy: "25%",
//				r: "50%",
//				fx: "50%",
//				fy: "10%"
//			} ),
//			radialGradientStop1 = setElementAttr( createSVGElement( "stop" ), {
//				offset: "0%",
//				style: "stop-color: rgb(255,255,255); stop-opacity:1;"
//			} ),
//			radialGradientStop2 = setElementAttr( createSVGElement( "stop" ), {
//				offset: "100%",
//				style: "stop-color: " + color2code( j[i].color.rgb ) + "; stop-opacity:1;"//rgb(230,0,18)
//			} );
//		radialGradient.appendChild( radialGradientStop1 );
//		radialGradient.appendChild( radialGradientStop2 );
//		gradientWrapper.appendChild( radialGradient );
//		
//		// 线性渐变
//		var linearGradient = setElementAttr( createSVGElement( "linearGradient" ), {
//				id: "linearGradient-" + num,
//				x1: "0%",
//				y1: "0%",
//				x2: "100%",
//				y2: "100%"
//			} ),
//			linearGradientStop1 = setElementAttr( createSVGElement( "stop" ), {
//				offset: "0%",
//				style: "stop-color: " + color2code( j[i].color.rgb ) + "; stop-opacity:1;"
//			} ),
//			linearGradientStop2 = setElementAttr( createSVGElement( "stop" ), {
//				offset: "100%",
//				style: "stop-color: " + color2code( j[i+1] ? j[i+1].color.rgb : j[0].color.rgb ) + "; stop-opacity:1;"
//			} );
//		linearGradient.appendChild( linearGradientStop1 );
//		linearGradient.appendChild( linearGradientStop2 );
//		gradientWrapper.appendChild( linearGradient );
		
		shape = createVMLElement( ["<oval fillcolor=\"" + color2code( j[i].color.rgb ) + "\" StrokeColor=\"" + color2code( j[i].color.rgb ) + "\" style=\"position: relative; left: " + j[i].coordinate.x + "px; top: " + j[i].coordinate.y + "px; z-index: 5; width: " + size*2 + "px; height: " + size*2 + "px;\" />"] );
//		shape.appendChild( createVMLElement( ["<fill type=\"gradient\" color=\"" + color2code( j[i].color.rgb ) + "\" style=\"position: relative; left: " + j[i].coordinate.x + "px; top: " + j[i].coordinate.y + "px; z-index: 5; width: " + size*2 + "px; height: " + size*2 + "px;\" />"] ) );
		shapeWrapper.appendChild( shape );
		
//		tspanWrapper = setElementAttr( createSVGElement( "text" ), {
//			id: "text-" + num,
//			x: j[i].coordinate.x,
//			y: j[i].coordinate.y,
//			fill: "#FFF",
//			style: "font: normal bold 22px/36px SimSun; text-align: center;"
//		} );
//		
//		var tspan = setElementAttr( createSVGElement( "tspan" ), {
//			id: "tspan-" + num,
//			x: j[i].coordinate.x,
//			y: j[i].coordinate.y
//		} );
//		
//		tspan.appendChild( document.createTextNode( "圆球" + num ) );
//		tspanWrapper.appendChild( tspan );
////		textWrapper.appendChild( tspanWrapper );
//		
//		lineWrapper.appendChild( setElementAttr( createSVGElement( "line" ), {
//			id: "line-" + num,
//			x1: j[i].coordinate.x,
//			y1: j[i].coordinate.y,
//			x2: j[i+1] ? j[i+1].coordinate.x : j[0].coordinate.x,
//			y2: j[i+1] ? j[i+1].coordinate.y : j[0].coordinate.y,
//			stroke: "url(#linearGradient-" + num + ")",
//			"stroke-width": 4
//		} ) );
	}
}

function createSVGElement( nodeName ) {
	return document.createElementNS( "http://www.w3.org/2000/svg", nodeName );
}

function setElementAttr( element, setting ) {
	for ( var i in setting ) {
		element.setAttribute( i, setting[i] );
	}
	
	return element;
}

function createVMLElement( markup ) {
	var vmlStyle = "display: inline-block; behavior:url(#default#VML);",
		isIE8 = navigator.userAgent.indexOf("MSIE 8.0") > -1;
	
	markup = markup.join("");
	
	if (isIE8) { // add xmlns and style inline
		markup = markup.replace('/>', ' xmlns="urn:schemas-microsoft-com:vml" />');
		if (markup.indexOf('style="') === -1) {
			markup = markup.replace('/>', ' style="' + vmlStyle + '" />');
		} else {
			markup = markup.replace('style="', 'style="' + vmlStyle);
		}
	
	} else { // add namespace
		markup = markup.replace('<', '<rpv:');
	}
	
	return document.createElement( markup );
}

RegularPolygon.prototype = {
	offset: function (x, y) {
		this.circle.coordinate.x += x;
		this.circle.coordinate.y += y;
		
		for (var i=0, j=this.vertices; i<j.length; i++) {
			j[i].coordinate.x += x;
			j[i].coordinate.y += y;
		}
	},
	draw: function( container, size ) {
		if ( this.side.count && !isNaN(parseInt(this.side.count)) ) {
			var isIE = /msie/i.test( navigator.userAgent ),
				hasSVG = !!document.createElementNS && !!document.createElementNS( "http://www.w3.org/2000/svg", "svg").createSVGRect;
			
			if ( isIE && !hasSVG ) {
				createVML.apply( this, [ container, size ] );
			}
			else {
				createSVG.apply( this, [ container, size ] );
			}
		}
	}
};

return Polygon;

})();

window.Polygon = Polygon;
	
})( window );