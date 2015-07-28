"use strict";

var canvas;
var gl;

var red = vec4(1.0, 0.0, 0.0, 1); // red
var green = vec4(0.0, 1.0, 0.0, 1); // green
var blue = vec4(0.0, 0.0, 1.0, 1); // blue
var black = vec4(0.0, 0.0, 0.0, 1); // black
var white = vec4(1.0, 1.0, 1.0, 1); // white

var nPhi = 50;

var rCone = 0.25;
var hCone = 0.5;
var cone;
var wf_cone;

var rCylinder = 0.25;
var hCylinder = 0.5
var cylinder;
var wf_cylinder;

var latitudeBands = 30;
var longitudeBands = 30;
var radius = 0.25;
var sphere;
var wf_sphere;

function scaleM( x, y, z )
{
    if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;

    return result;
}

function init(){

    canvas = document.getElementById("gl-canvas");
	
	document.getElementById("cpInput").color.fromString("ff0000");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    
    //  Load shaders and initialize attribute buffers    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    var vColor = gl.getAttribLocation(program, "vColor");
    var uMV = gl.getUniformLocation(program, "modelViewMatrix");
        
    var modelView = mat4();
	modelView = mult(modelView,translate( -0.5, 0.5, 0.5 ));
    modelView = mult(modelView, rotate(-80, [1, 0, 0]));
    modelView = mult(modelView, rotate(-30, [0, 1, 0]));
    modelView = mult(modelView, rotate(-10, [0, 0, 1]));
    modelView = mult(modelView,scaleM(0.5, 0.5, 0.5));
	
    cone = createCone(rCone, hCone, gl, program, red, modelView,vPosition,vColor,uMV);
	cone.primtype = gl.TRIANGLES;
	
	wf_cone = createCone(rCone, hCone,gl, program,black, modelView,vPosition,vColor,uMV);
	
	modelView = mat4();
	modelView = mult(modelView,translate( 0.5, 0.5, 0.5 ));
	//var s = scale(modelView,vec4(0.5, 0.5, 0.5,1) );
	modelView = mult(modelView,scaleM(0.5, 0.5, 0.5));
		
	sphere = createSphere(gl, program,blue, modelView,vPosition,vColor,uMV);
	sphere.primtype = gl.TRIANGLES;
	
	wf_sphere = createSphere(gl, program, black,modelView,vPosition,vColor,uMV);
	
	modelView = mat4();
	modelView = mult(modelView,translate( -0.5, -0.5, -0.5 ));
	modelView = mult(modelView, rotate(10, [1, 0, 0]));
    modelView = mult(modelView, rotate(30, [0, 1, 0]));
    modelView = mult(modelView, rotate(10, [0, 0, 1]));
	modelView = mult(modelView,scaleM(0.5, 0.5, 0.5));
    
    cylinder = createCylinder(rCylinder, hCylinder, gl, program, green, modelView,vPosition,vColor,uMV);
	cylinder.primtype = gl.TRIANGLES;
	
	wf_cylinder = createCylinder(rCylinder, hCylinder,gl, program,black, modelView,vPosition,vColor,uMV);
	
    render();
};

function createCone(r, h, gl, program, color, modelView, vPosition, vColor, uMV){
	var myCone = createGeneralCone(r,0.0001,h,gl, program, color, modelView,vPosition,vColor,uMV);
	return myCone;
	
}

function createCylinder(r, h, gl, program, color, modelView, vPosition, vColor, uMV){
	var myCylinder = createGeneralCone(r,r,h,gl, program, color, modelView,vPosition,vColor,uMV);
	return myCylinder;
	
}
function createGeneralCone(r1,r2,h,gl, program, color, modelView,vPosition,vColor,uMV){

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
        colors.push(color);
        
        //   nt.push ( Nx, Ny*cosPhi, Ny*sinPhi );         // normals
        pt.push(h / 2, cosPhi2 * r2, sinPhi2 * r2); // points
        vertices.push(vec4(h / 2, cosPhi * r2, sinPhi * r2, 1));
        colors.push(color);
        //   nt.push ( Nx, Ny*cosPhi2, Ny*sinPhi2 );       // normals
        Phi += dPhi;
    }
    
    if (r1 != 0) {
        vertices.push(vec4(-h / 2, 0, 0, 1));
        colors.push(color);
    }
    
    if (r2 != 0) {
        vertices.push(vec4(h / 2, 0, 0, 1));
        colors.push(color);
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

function createSphere(gl, program, color,modelView,vPosition,vColor,uMV){
     var colors = [];
    
    var vertices = [];
    var indexData = [];
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
            colors.push(color);
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
    
	var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
    var sphere = {
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
    return sphere;
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);
	
    draw(gl, cone);	
	draw(gl, wf_cone);
	
	
	draw(gl, sphere);
	draw(gl, wf_sphere);
	
    draw(gl, cylinder);
	draw(gl, wf_cylinder);
    window.requestAnimFrame(render);
    
}
