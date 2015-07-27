"use strict";

var canvas;
var gl;



var vertices = [];
var indexData = [];

var points = [];

var latitudeBands = 30;
var longitudeBands =30;

function init(){

    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    createSphere();
    drawShape();
};

function createSphere () {
    var vertexPositionData = [];
   // var normalData = [];
   // var textureCoordData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        var theta = latNumber * 2* Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosTheta * cosPhi;
           // var y = cosTheta;
         //   var z = sinPhi * sinTheta;
            var y = sinTheta;
            var z = cosTheta * sinPhi;
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

            points.push(vec4(x,y,z,1));
            vertices.push(vec4(x,y,z,1));
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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexData), gl.STATIC_DRAW);


    render();
}


function render(){


    gl.clear(gl.COLOR_BUFFER_BIT);

 /*   var index = points.length;
    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.LINE_LOOP, i, 3 ); */
    gl.drawElements(gl.TRIANGLES,indexData.length, gl.UNSIGNED_BYTE,0);




}
