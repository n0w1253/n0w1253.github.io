"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

var theta = -0.5;
var thetaLoc;

window.onload = function init()
{
    document.getElementById("field").value = NumTimesToSubdivide;
    document.getElementById("field2").value = theta;
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    drawGasket();
};

function drawGasket() {
//
    //  Initialize our data for the Sierpinski Gasket
    //



    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );



    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(4, 11), gl.STREAM_DRAW );
//    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    thetaLoc = gl.getUniformLocation( program, "theta" );
    render();
}

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}

function render()
{
    points = [];

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.5 ),
        vec2(  0.5, -0.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
        NumTimesToSubdivide);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );


    var index = 0;

    while (index < points.length) {
        gl.uniform1f(thetaLoc, theta);
    //    gl.drawArrays(gl.LINE_LOOP, index, 3);
        gl.drawArrays(gl.TRIANGLES, index, 3);
        index = index + 3;
    }

 //   gl.gl.drawArrays(gl.TRIANGLES, 0, points.length);

}
