"use strict";

var canvas;
var gl;

var maxNumVertices = 600;
var increment = 600;
var index = 0;
var break_points_idx = [];
var points = [];
var vertices = [];
var colors = [];
var pixWidth = 2;
var alpha = 1;
var vertex_colors = [];

var redraw = false;
var newmousedown = false;
var newSecPoint = false;

var vBuffer;
var cBuffer;


var color = vec4(1.0, 0.0, 0.0, 1); // red
function init(){
    break_points_idx.push(index);
    
    canvas = document.getElementById("gl-canvas");
	
	document.getElementById("cpInput").color.fromString("ff0000");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    canvas.addEventListener("mousedown", function(event){
        //  console.log("new color " + color);
        redraw = true;
        newmousedown = true;
    });
    
    canvas.addEventListener("mouseup", function(event){
        redraw = false;
        break_points_idx.push(index);
        //  console.log("idx " + index);
    });
    
    canvas.addEventListener("mouseout", function(event){
        break_points_idx.push(index);
        //  console.log("idx " + index);
    });
    
    canvas.addEventListener("mousemove", function(event){
        draw(event)
    });
    
    canvas.addEventListener("touchstart", function(event){
        event.preventDefault();
        redraw = true;
		//window.alert("started" +" "+ event.clientX +" "+ canvas.width +" "+ canvas.height+" "+ event.clientY);
        newmousedown = true;
    }, false);
    
    canvas.addEventListener("touchend", function(event){
        event.preventDefault();
        redraw = false;
        break_points_idx.push(index);
        //  console.log("idx " + index);
    }, false);
    
    canvas.addEventListener("touchcancel", function(event){
        event.preventDefault();
        break_points_idx.push(index);
        //  console.log("idx " + index);
    }, false);
    
    canvas.addEventListener("touchmove", function(event){
        event.preventDefault();
		var evt = event.changedTouches[0];
        draw(evt)
    }, false);
    // var htmlElt = document.getElementsByTagName("HTML")[0];
    
    window.addEventListener("mouseup", function(event){
        redraw = false;
        break_points_idx.push(index);
        //    console.log("idx " + index);
    });
    
    window.addEventListener("mousedown", function(event){
        redraw = true;
        newmousedown = true;
    });
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STREAM_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STREAM_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    render();
    
}

function draw(event){

    if (redraw) {
        var newBuffer = false;
    //    var t = vec2(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1);
		
		var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
		
		var t = vec2(2 * x / canvas.width - 1, 2 * (canvas.height - y) / canvas.height - 1);
		
		
        points.push(t);
		        
        if (newmousedown) {
            newmousedown = false;
			newSecPoint = true;
            return;
        }
					
        var p1 = points[points.length - 2];
        var p2 = points[points.length - 1];
        var v = normalize(subtract(p2, p1));
        var perpendicular = vec2(-v[1], v[0]);
        perpendicular = scale(pixWidth / 512.0, perpendicular);
        
		var c1;
        var c2;
		
	//	if (!newSecPoint) {
		//	c1 = vertices[vertices.length -3];
		//	c2 = vertices[vertices.length -2];
	//		c1 = vertices[vertices.length -1];
	//		c2 = vertices[vertices.length -3];
	//	} else {
			c1 = subtract(p1, perpendicular);
			c2 = add(p1, perpendicular);
	//		newSecPoint = false;
	//	}
        
        var c3 = subtract(p2, perpendicular);
        var c4 = add(p2, perpendicular);
        
    //    vertices.push(c3, c1, c2, c3, c2, c4);
	//  vertices.push(c1, c3, c2, c3, c4, c2);
         vertices.push(c1, c2,c3,c4);
        //      console.log("vertices "+c1+c2+c3+c3+c2+c4);      
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        if (index >= maxNumVertices) {
        
            maxNumVertices += increment;
            gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STREAM_DRAW);
            newBuffer = true;
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
            //	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
        }
        else {
      //      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten([c3, c1, c2, c3, c2, c4]));
	//	 gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten([c1, c3, c2, c3, c4, c2]));
	gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten([c1, c2,c3,c4]));
            //	gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));
        }
        
        t = color;
        colors.push(color);
      //  vertex_colors.push(t, t, t, t, t, t);
	  vertex_colors.push(t, t, t, t);
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        if (newBuffer) {
            //	var cBuffer = gl.createBuffer();
            //	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            // console.log("new buffer size "+maxNumVertices);
            gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STREAM_DRAW);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertex_colors));
            //	 gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
        }
        else {
            gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten([color, color, color, color, color, color]));
			gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten([color, color, color, color]));
            //	 gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(color));
        }
        
        
       // index += 6;
		 index += 4;
        //	index++;
    }
    
}

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.lineWidth(10.0);
    gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    var i;
    for (i = 0; i < break_points_idx.length - 1; i++) {
       // gl.drawArrays(gl.TRIANGLES, break_points_idx[i], break_points_idx[i + 1] - break_points_idx[i]);
        
        //   gl.drawArrays(gl.POINTS, break_points_idx[i], break_points_idx[i + 1] - break_points_idx[i]);
      //  gl.drawArrays(gl.LINE_STRIP, break_points_idx[i], break_points_idx[i + 1] - break_points_idx[i]);
	  gl.drawArrays(gl.TRIANGLE_STRIP, break_points_idx[i], break_points_idx[i + 1] - break_points_idx[i]);
    }
    
    //    gl.drawArrays(gl.POINTS, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1]);
   // gl.drawArrays(gl.LINE_STRIP, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1]);
   // gl.drawArrays(gl.TRIANGLES, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1]);
   
   gl.drawArrays(gl.TRIANGLE_STRIP, break_points_idx[break_points_idx.length - 1], index - break_points_idx[break_points_idx.length - 1]);
    window.requestAnimFrame(render);
    
}


