var timers = setInterval(function() {
    if ( window.JR ) {
        clearInterval( timers );
    }
}, 100);

function filterElement() {
    // Object
    JR.filter(
            {
                "Number": 22,
                "Boolean": false,
                "String": "JavaScript Revolution",
                "Object": {},
                "Function": function() {},
                "Date": new Date
            },
            function( val, key, src ) {
                console.log( "context: ", this );
                console.log( "key: ", key );
                console.log( "value: ", val );
                console.log( "origin: ", src );
                console.log( "--------------------" );

                return JR.isEmpty( val );
            },
            JR
        );
    // Array
    JR.filter(
            [22, false, "JavaScript Revolution", {}, function() {}, new Date],
            function( val, idx, src ) {
                console.log( "context: ", this );
                console.log( "index: ", idx );
                console.log( "value: ", val );
                console.log( "origin: ", src );
                console.log( "--------------------" );
                
                return JR.isEmpty( val );
            },
            document
        );
    // String
    JR.filter( "JavaScript Revolution", function( chr, idx, src ) {
            console.log( "context: ", this );
            console.log( "index: ", idx );
            console.log( "char: ", chr );
            console.log( "origin: ", src );
            console.log( "--------------------" );

            return chr.charCodeAt(0) < 97;
        });
}

// map 方法
function mappingElement() {
    // Object
    JR.map(
            {
                "Number": 22,
                "Boolean": false,
                "String": "JavaScript Revolution",
                "Object": {},
                "Function": function() {},
                "Date": new Date
            },
            function( val, key, src ) {
                console.log( "context: ", this );
                console.log( "key: ", key );
                console.log( "value: ", val );
                console.log( "origin: ", src );
                console.log( "--------------------" );

                return JR.type( val );
            },
            JR
        );
    // Array
    JR.map(
            [22, false, "JavaScript Revolution", {}, function() {}, new Date],
            function( val, idx, src ) {
                console.log( "context: ", this );
                console.log( "index: ", idx );
                console.log( "value: ", val );
                console.log( "origin: ", src );
                console.log( "--------------------" );
                
                return JR.type( val );
            },
            document
        );
    // String
    JR.map( "JavaScript Revolution", function( chr, idx, src ) {
            console.log( "context: ", this );
            console.log( "index: ", idx );
            console.log( "char: ", chr );
            console.log( "origin: ", src );
            console.log( "--------------------" );

            return chr.charCodeAt(0);
        });
}

// 检测 JS 文件 URL
function detectFileURL() {
    alert( JR.script( function() { throw Error("from test.js"); } ) || "from test.html" );
}

function compare() {
    JR.equal(
        [ 1, 2, 3, 4, 5, 6,
            [
                {
                    "asd": 321,
                    "a": 123
                },
                [ "b", "boy", "by" ],
                [ "c", "d", "e" ]
            ]
        ],
        [1,2,3,4,5,6,[{"a": 123,"asd":321},["b","boy","by"],["c", "d", "e"]]]
    );
}

function removeRepeatedValue() {
    var arr = [1, 2, 3, 3, 4, 5, "3", "fuck", true, {}, true, "3", {}, "fuck"];

    console.log( "Origin: ", arr );

    console.log( "Keep first values: ", JR.unique( arr ) );

    console.log( "Origin: ", arr );

    console.log( "Keep last values: ", JR.unique( arr, true ) );
}

function zerofill() {
    JR.each( ["+0001110.001", "-0001110.001", "0001110.001", "10", "03", "-05"], function( n, i ) {
        console.log( n + " is: " );
        console.log( JR.zerofill( n, 6 ) );
    });
}
