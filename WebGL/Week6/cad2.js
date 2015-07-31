"use strict";

var canvas;
var gl;
var alpha = 1;

var red = vec4(1.0, 0.0, 0.0, alpha); // red
var green = vec4(0.0, 1.0, 0.0, alpha); // green
var blue = vec4(0.0, 0.0, 1.0, alpha); // blue
var black = vec4(0.0, 0.0, 0.0, alpha); // black
var white = vec4(1.0, 1.0, 1.0, alpha); // white
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

var objArray = [];

var inpSx = 1;
var inpSy = 1;
var inpSz = 1;
var inpColor = red;
var inpShape = 0;
var inpRx = 0;
var inpRy = 0;
var inpRz = 0;
var inpPx = 0;
var inpPy = 0;
var inpPz = 0;
var usrObj, wf_usrObj;



var program;
var vPosition;
var vColor;
var uMV;

function init(){

    canvas = document.getElementById("gl-canvas");
    
    document.getElementById("cpInput").color.fromString("ff0000");
    document.getElementById("Controls").value = 0;
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    
    //  Load shaders and initialize attribute buffers    
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    
    // set the shader to use
    gl.useProgram(program);
    
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");
    uMV = gl.getUniformLocation(program, "modelViewMatrix");
    
    var modelView = mat4();
    modelView = mult(modelView, translate(-0.5, 0.5, -0.8));
    modelView = mult(modelView, rotateX(-80));
    modelView = mult(modelView, rotateY(30));
    modelView = mult(modelView, rotateZ(20));
    modelView = mult(modelView, scalem(0.5, 0.5, 0.5));
    
    cone = createCone(rCone, hCone, red, modelView);
    cone.primtype = gl.TRIANGLES;
    
    wf_cone = createCone(rCone, hCone, black, modelView);
    objArray.push(cone);
    objArray.push(wf_cone);
    
    modelView = mat4();
    modelView = mult(modelView, translate(0.5, 0.5, 0.8));
    
    modelView = mult(modelView, scalem(0.5, 0.5, 0.5));
    
    sphere = createSphere(blue, modelView);
    sphere.primtype = gl.TRIANGLES;
    
    wf_sphere = createSphere(black, modelView);
    objArray.push(sphere);
    objArray.push(wf_sphere);
    
    
    modelView = mat4();
    modelView = mult(modelView, translate(-0.5, -0.5, -0.5));
    modelView = mult(modelView, rotateX(10));
    modelView = mult(modelView, rotateY(-30));
    modelView = mult(modelView, rotateZ(10));
    modelView = mult(modelView, scalem(0.8, 0.8, 0.8));
    
    cylinder = createCylinder(rCylinder, hCylinder, green, modelView);
    cylinder.primtype = gl.TRIANGLES;
    
    wf_cylinder = createCylinder(rCylinder, hCylinder, black, modelView);
    objArray.push(cylinder);
    objArray.push(wf_cylinder);
    
    
    render();
};

function createCone(r, h, color, modelView){
    var myCone = createGeneralCone(r, 0.0001, h, color, modelView);
	myCone.shape = "cone";
    return myCone;
    
}

function createCylinder(r, h, color, modelView){
    var myCylinder = createGeneralCone(r, r, h, color, modelView);
	myCylinder.shape = "cylinder";
    return myCylinder;
    
}

function createGeneralCone(r1, r2, h, color, modelView){

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
    
        for (var i = 0; i < nPhi; i++) {
            var first = 2 * i;
            var second = (2 * i + 2) % 200;
            indexData.push(vertices.length - 2);
            
            indexData.push(second);
            indexData.push(first);
            
            
        }
    }
    if (r2 != 0) {
    
        for (var i = 0; i < nPhi; i++) {
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
        modelView: modelView,
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

function createSphere(color, modelView){
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
		shape:"sphere",
        modelView: modelView,
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
    
    // connect up the shader parameters: vertex position and projection/model matrices
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(vPosition, obj.vertSize, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(vColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
    gl.vertexAttribPointer(vColor, obj.colorSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
    
    gl.uniformMatrix4fv(uMV, false, flatten(obj.modelView));
    
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
    gl.depthFunc(gl.LEQUAL);
    //gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    
    for (var i = 0; i < objArray.length; i++) {
        draw(gl, objArray[i]);
    }
    
    window.requestAnimFrame(render);
    
}

function addObj(){
    var modelView = mat4();
	//modelView = mult(modelView, scalem(1, 1, -1));
    modelView = mult(modelView, translate(inpPx, inpPy, inpPz));
    modelView = mult(modelView, rotateX(inpRx));
    modelView = mult(modelView, rotateY(inpRy));
    modelView = mult(modelView, rotateZ(inpRz));
    modelView = mult(modelView, scalem(inpSx, inpSy, inpSz));
	
    switch (Number(inpShape)) {
        case 0:
            usrObj = createSphere(inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;
            
            wf_usrObj = createSphere(black, modelView);
            
            break;
            
        case 1:
            usrObj = createCone(rCone, hCone, inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;
            
            wf_usrObj = createCone(rCone, hCone, black, modelView);
            
            break;
            
        case 2:
            usrObj = createCylinder(rCylinder, hCylinder, inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;
            
            wf_usrObj = createCylinder(rCylinder, hCylinder, black, modelView);
            
            break;
    }
    
    objArray.push(usrObj);
    objArray.push(wf_usrObj);
}

function removeLastObj(){
    objArray.pop();
    objArray.pop();
}

function removeAllObj(){
    objArray = [];
}

function saveToFile(){
    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
	var res="";
	for (var k = 0; k < objArray.length; k+=2) {
		var u = objArray[k].modelView;
		var m_str = objArray[k].shape+"\r\n[ \r\n";
		//m_str.push("[");
        for ( var i = 0; i < u.length; i++ ) {
            m_str = m_str.concat( u[i].join(" "),"\r\n" );
           // for ( var j = 0; j < u[i].length; ++j ) {
            //    if ( u[i][j] !== v[i][j] ) { return false; }
           // }
        }
		m_str = m_str.concat("]\r\n");
		res += m_str+"\r\n";
    }
	

	
    var blob = new Blob([res], {
        type:  "text/plain;charset=utf-8"
    }); // the blob

  saveAs(blob, "debug.txt");
}
