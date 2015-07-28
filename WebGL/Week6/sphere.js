"use strict";

var canvas;
var gl;



var vertices = [];
var indexData = [];

var colors = [];

var latitudeBands = 10;
var longitudeBands = 10;
var radius = 1;

var vertexColors = [//    vec4( 0.1, 0.1, 0.1, 1.0 ),  
vec4(0.8, 0.0, 0.0, 1.0), // red
 vec4(0.8, 0.8, 0.0, 1.0), // yellow
 vec4(0.0, 0.8, 0.0, 1.0), // green
 vec4(0.0, 0.0, 0.8, 1.0), // blue
 vec4(0.8, 0.0, 0.8, 1.0), // magenta
 //     vec4( 0.8, 0.8, 0.8, 1.0 ),  
vec4(0.0, 0.8, 0.8, 1.0) // cyan
];

var program;
var program1;

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
  
            vertices.push(vec4(radius * x, radius * y, radius * z, 1));
            colors.push(vec4(0.0, 0.0, 0.8, 1.0));
        }
    }
    
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(first + 1);
            indexData.push(second);
            
            
            indexData.push(second);
            indexData.push(first + 1);
            indexData.push(second + 1);
            
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
    
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    program1 = initShaders(gl, "vertex-shader", "fragment-shader1");
    //   gl.useProgram(program);
    
    
    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    
    bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    vPosition1 = gl.getAttribLocation(program1, "vPosition");
    
    ibufferId = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibufferId);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    vColor = gl.getAttribLocation(program, "vColor");
    
    render();
}

var bufferId, bufferId1;
var ibufferId;
var cBuffer;
var vPosition;
var vColor;
var vPosition1;

function render(){


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
       for( var i=0; i<indexData.length-3; i+=3)
          gl.drawElements( gl.TRIANGLES, 3, gl.UNSIGNED_SHORT,2*i );
    // gl.drawElements(gl.LINE_LOOP, indexData.length, gl.UNSIGNED_SHORT, 0);
    //      gl.drawElements(gl.TRIANGLES,indexData.length, gl.UNSIGNED_SHORT,0);
    
    gl.useProgram(program1);
    gl.enableVertexAttribArray(vPosition1);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.vertexAttribPointer(vPosition1, 4, gl.FLOAT, false, 0, 0);
    for (var i = 0; i < indexData.length - 3; i = i + 3) 
        gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, 2 * i);
    
    window.requestAnimFrame(render);
    
    
}
