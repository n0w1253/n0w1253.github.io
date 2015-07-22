"use strict";

var canvas;
var gl;

var maxNumVertices  = 600;
var increment = 600;
var index = 0;
var break_points_idx = [];
var points = [];
var colors = [];

var redraw = false;


var color = vec4( 1.0, 0.0, 0.0, 1.0 );  // red
    

window.onload = function init() {
    break_points_idx.push(index);

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
		//console.log("new color "+color);
      redraw = true;
    });

    canvas.addEventListener("mouseup", function(event){
      redraw = false;
        break_points_idx.push(index);
    });

    canvas.addEventListener("mouseout", function(event){
        break_points_idx.push(index);
    });

    canvas.addEventListener("mousemove", function(event){

        if(redraw) {
            var newBuffer = false;
            var t = vec2(2*event.clientX/canvas.width-1,
                2*(canvas.height-event.clientY)/canvas.height-1);
            points.push(t);

            gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
            if (index >= maxNumVertices) {
                maxNumVertices += increment;
                gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STREAM_DRAW );
                newBuffer = true;
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
            } else {
                gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
            }

            t = color;
            colors.push(t);
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            if (newBuffer) {
               // console.log("new buffer size "+maxNumVertices);
                gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STREAM_DRAW );
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
            } else {
                gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
            }


        index++;
      }

    } );


   // var htmlElt = document.getElementsByTagName("HTML")[0];

    window.addEventListener("mouseup", function(event){
        redraw = false;
        break_points_idx.push(index);
    });

    window.addEventListener("mousedown", function(event){
        redraw = true;
    });

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STREAM_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STREAM_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
	gl.lineWidth(20.0);
    gl.enable(gl.BLEND);
  
  //  gl.drawArrays(gl.POINTS, 0, index);
    var i;
    for (i = 0; i < break_points_idx.length - 1; i++) {
        var p1 = vec4(points[i],0,1);
        var p2 = vec4(points[i+1],0,1);
        var v = normalize( p2 - p1);

        var perpendicular = vec2(-v.y, v.x);
        perpendicular = scale(20.0/2, perpendicular);

        var c1 = p1 - perpendicular;
        var c2 = p1 + perpendicular;
        var c3 = p2 - perpendicular;
        var c4 = p2 + perpendicular;

        var triangle_points = [c1.xy,c2.xy,c3.xy,c3.xy,c2.xy,c4.xy];
     //   gl.bufferData(gl.ARRAY_BUFFER, flatten(triangle_points), gl.STREAM_DRAW);
     //   gl.drawArrays(gl.TRIANGLES, 0, 6);
     //   gl.drawArrays(gl.POINTS, break_points_idx[i], break_points_idx[i+1] - break_points_idx[i] );
        gl.drawArrays(gl.LINE_STRIP, break_points_idx[i], break_points_idx[i+1] - break_points_idx[i] );
    }

  //  gl.drawArrays(gl.POINTS, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1] );
    gl.drawArrays(gl.LINE_STRIP, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1] );
    window.requestAnimFrame(render);

}
