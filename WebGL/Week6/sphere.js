"use strict";

var canvas;
var gl;



var vertices = [];
var indexData = [];

var colors = [];

var latitudeBands = 60;
var longitudeBands = 60;

var vertexColors = [
    //    vec4( 0.1, 0.1, 0.1, 1.0 ),  
        vec4( 0.8, 0.0, 0.0, 1.0 ),  // red
        vec4( 0.8, 0.8, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 0.8, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 0.8, 1.0 ),  // blue
        vec4( 0.8, 0.0, 0.8, 1.0 ),  // magenta
   //     vec4( 0.8, 0.8, 0.8, 1.0 ),  
        vec4( 0.0, 0.8, 0.8, 1.0 )   // cyan
    ];


function init(){

    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    createSphere();
    drawShape();
};

function createSphere(){
    var vertexPositionData = [];
    // var normalData = [];
    // var textureCoordData = [];
	var c_idx = 0;
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * 2 * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);
            
            /* normalData.push(x);
             normalData.push(y);
             normalData.push(z);
             textureCoordData.push(u);
             textureCoordData.push(v);
             vertexPositionData.push(radius * x);
             vertexPositionData.push(radius * y);
             vertexPositionData.push(radius * z);
             */
        //    points.push(vec4(x, y, z, 1));
            vertices.push(vec4(x, y, z, 1));
			colors.push(vertexColors[Math.floor(Math.random() * 6 )] );
        }
    }
    
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }
    
    
}

function drawShape(){

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var ibufferId = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibufferId);
    //  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    render();
}


function render(){


    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //  for( var i=0; i<indexData.length; i+=3)
    //      gl.drawElements( gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT,2*i );
   // gl.drawElements(gl.LINE_LOOP, indexData.length, gl.UNSIGNED_SHORT, 0);
       gl.drawElements(gl.TRIANGLES,indexData.length, gl.UNSIGNED_SHORT,0);
    
    window.requestAnimFrame(render);
    
    
}
