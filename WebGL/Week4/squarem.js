"use strict";

var canvas;
var gl;


var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var break_points_idx = [];
var points = [];
var colors = [];

var redraw = false;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    break_points_idx.push(index);

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
      redraw = true;
    });

    canvas.addEventListener("mouseup", function(event){
      redraw = false;
        break_points_idx.push(index);
    });

    canvas.addEventListener("mousemove", function(event){

        if(redraw) {
          gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
          var t = vec2(2*event.clientX/canvas.width-1,
           2*(canvas.height-event.clientY)/canvas.height-1);
            points.push(t);
       // gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
            gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STREAM_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[(index)%7]);
            colors.push(t);
        //gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STREAM_DRAW);
        index++;
      }

    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
   // gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STREAM_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
   // gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STREAM_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
  //  gl.drawArrays(gl.POINTS, 0, index);
    var i;
    for (i = 0; i < break_points_idx.length - 1; i++) {
        gl.drawArrays(gl.LINE_STRIP, break_points_idx[i], break_points_idx[i+1] - break_points_idx[i] );
    }

    gl.drawArrays(gl.LINE_STRIP, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1] );
    window.requestAnimFrame(render);

}
