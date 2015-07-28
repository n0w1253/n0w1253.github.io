"use strict";

var canvas;
var gl;


var nPhi = 10;
var r1 = 0.5;
var r2 = 0.0;
var h = 0.5;

var cone;
var s_cone;

function init(){

    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    //  Load shaders and initialize attribute buffers    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    var program1 = initShaders(gl, "vertex-shader", "fragment-shader1");
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    var vColor = gl.getAttribLocation(program, "vColor");
    var uMV = gl.getUniformLocation(program, "modelViewMatrix");
    
    var vPosition1 = gl.getAttribLocation(program1, "vPosition");
    var vColor1 = gl.getAttribLocation(program1, "vColor");
    var uMV1 = gl.getUniformLocation(program1, "modelViewMatrix");
    
    var modelView = mat4();
    modelView = mult(modelView, rotate(20, [1, 0, 0]));
    modelView = mult(modelView, rotate(30, [0, 1, 0]));
    modelView = mult(modelView, rotate(20, [0, 0, 1]));
    
    cone = createCone(gl, program, modelView,vPosition,vColor,uMV);
	
	s_cone = createCone(gl, program1, modelView,vPosition1,vColor1,uMV1);
    render();
};

function createCone(gl, program, modelView,vPosition,vColor,uMV){

    var colors = [];
    
    var vertices = [];
    var indexData = [];
	
    var pt = [], nt = [];
    var Phi = 0, dPhi = 2 * Math.PI / (nPhi - 1), Nx = r1 - r2, Ny = h, N = Math.sqrt(Nx * Nx + Ny * Ny);
    Nx /= N;
    Ny /= N;
    for (var i = 0; i < nPhi; i++) {
        var cosPhi = Math.cos(Phi);
        var sinPhi = Math.sin(Phi);
        var cosPhi2 = Math.cos(Phi + dPhi / 2);
        var sinPhi2 = Math.sin(Phi + dPhi / 2);
        pt.push(-h / 2, cosPhi * r1, sinPhi * r1); // points
        vertices.push(vec4(-h / 2, cosPhi * r1, sinPhi * r1, 1));
        colors.push(vec4(0.0, 0.0, 0.8, 1.0));
        
        //   nt.push ( Nx, Ny*cosPhi, Ny*sinPhi );         // normals
        pt.push(h / 2, cosPhi2 * r2, sinPhi2 * r2); // points
        vertices.push(vec4(h / 2, cosPhi * r2, sinPhi * r2, 1));
        colors.push(vec4(0.0, 0.0, 0.8, 1.0));
        //   nt.push ( Nx, Ny*cosPhi2, Ny*sinPhi2 );       // normals
        Phi += dPhi;
    }
    
    if (r1 != 0) {
        vertices.push(vec4(-h / 2, 0, 0, 1));
        colors.push(vec4(0.0, 0.0, 0.8, 1.0));
    }
    
    if (r2 != 0) {
        vertices.push(vec4(h / 2, 0, 0, 1));
        colors.push(vec4(0.0, 0.0, 0.8, 1.0));
    }
    
    for (var i = 0; i < nPhi - 1; i++) {
        var first = 2 * i;
        var second = 2 * i + 1;
        var third = (2 * i + 2) % 200;
        var fourth = (2 * i + 3) % 200;
        indexData.push(first);
        indexData.push(second);
        indexData.push(third);
        
        
        indexData.push(second);
        indexData.push(third);
        indexData.push(fourth);
        
    }
    
    if (r1 != 0) {
    
        for (var i = 0; i < nPhi - 1; i++) {
            var first = 2 * i;
            var second = (2 * i + 2) % 200;
            indexData.push(vertices.length - 2);
            
            indexData.push(second);
            indexData.push(first);
            
            
        }
    }
    if (r2 != 0) {
    
        for (var i = 0; i < nPhi - 1; i++) {
            var first = 2 * i + 1;
            var second = (2 * i + 3) % 200;
            indexData.push(vertices.length - 1);
            indexData.push(first);
            indexData.push(second);
            
        }
    }
    
    
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var cone = {
        program: program,
        modelView: modelView,
		vPosition: vPosition,
		vColor: vColor,
		uMV: uMV,
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: indexBuffer,
        vertSize: 4,
        nVerts: vertices.length,
        colorSize: 4,
        nColors: colors.length,
        nIndices: indexData.length,
        primtype: gl.LINE_LOOP
    };
    return cone;
}




function draw(gl, obj){
   
    // set the vertex buffer to be drawn
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    
    // set the shader to use
    gl.useProgram(obj.program);
    
    // connect up the shader parameters: vertex position and projection/model matrices
    gl.enableVertexAttribArray(obj.vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(obj.vPosition, obj.vertSize, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(obj.vColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
    gl.vertexAttribPointer(obj.vColor, obj.colorSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
    
    //  gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(obj.uMV, false, flatten(obj.modelView));
    
    // draw the object
    // gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    for (var i = 0; i < obj.nIndices - 3; i = i + 3) 
        gl.drawElements(obj.primtype, 3, gl.UNSIGNED_SHORT, 2 * i);
}

function render(){
   // clear the background
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	cone.primtype = gl.TRIANGLES;
    draw(gl, cone);	
	draw(gl, s_cone);
    
    window.requestAnimFrame(render);
    
}
