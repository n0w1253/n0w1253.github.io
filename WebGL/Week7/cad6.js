"use strict";

var canvas;
var gl;
var alpha = 1;

var red = vec4(1.0, 0.0, 0.0, alpha); // red
var light_red = vec4(0.8, 0.0, 0.0, 0.5); // light red
var light_green = vec4(0.0, 0.8, 0.0, 0.5); //light green
var light_blue = vec4(0.0, 0.0, 0.8, 0.5); //light blue
var black = vec4(0.0, 0.0, 0.0, alpha); // black
var white = vec4(1.0, 1.0, 1.0, alpha); // white
var gray = vec4(0.3, 0.3, 0.3, 0.5); // gray
var nPhi = 50;

var rCone = 0.25;
var hCone = 0.5;
var cone;
//var wf_cone;

var rCylinder = 0.25;
var hCylinder = 0.5
var cylinder;
//var wf_cylinder;

var latitudeBands = 30;
var longitudeBands = 30;
var radius = 0.25;
var sphere;
//var wf_sphere;

var objArray = [];

var axes;

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
var usrObj;// wf_usrObj;

var program;
var vPosition;
var vColor;
var vNormal;
var uMV;
var uP;
var uNormal;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;
var  fovy = 12.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var near = 3;
var far = -10;
var MVInit;
var PInit;
var normalMatrix;


var lightPosition = vec4(10, 10, 10, 0.0 );
var lightPosition2 = vec4(0, 0, 10, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientProduct,diffuseProduct,specularProduct;

function init(){

    canvas = document.getElementById("gl-canvas");
    
  //  document.getElementById("cpInput").color.fromString("ff0000");
    document.getElementById("Controls").value = 0;
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
	
	aspect =  canvas.width/canvas.height;
    
    // clear the background
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles   
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  //  gl.enable(gl.POLYGON_OFFSET_FILL);
   // gl.polygonOffset(1.0, 2.0);
    
    //  Load shaders and initialize attribute buffers    
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    
    // set the shader to use
    gl.useProgram(program);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");
    vNormal = gl.getAttribLocation(program, "vNormal");
    uMV = gl.getUniformLocation(program, "modelViewMatrix");
    uP = gl.getUniformLocation(program, "projectionMatrix");
    uNormal = gl.getUniformLocation( program, "normalMatrix" );
    
    var eye = vec3(0.25, 0.5, 10);
    
    MVInit = lookAt(eye, at, up);
 //   PInit = ortho(left, right, bottom, ytop, near, far);
	PInit = perspective(fovy, aspect, near, far);
        
 /*   normalMatrix = [
        vec3(MVInit[0][0], MVInit[0][1], MVInit[0][2]),
        vec3(MVInit[1][0], MVInit[1][1], MVInit[1][2]),
        vec3(MVInit[2][0], MVInit[2][1], MVInit[2][2])
    ];  */  
    
    var modelView = MVInit;
    modelView = mult(modelView, translate(-0.5, 0.5, -0.25));
    modelView = mult(modelView, rotate(-80, [1, 0, 0]));
    modelView = mult(modelView, rotate(30, [0, 1, 0]));
    modelView = mult(modelView, rotate(20, [0, 0, 1]));
    modelView = mult(modelView, scalem(0.5, 0.5, 0.5));
    
    cone = createCone(rCone, hCone, light_red, modelView);
    cone.primtype = gl.TRIANGLES;
    
  //  wf_cone = createCone(rCone, hCone, black, modelView);
    objArray.push(cone);
  //  objArray.push(wf_cone);
    
    modelView = MVInit;
    modelView = mult(modelView, translate(0.5, 0.5, -0.25));
    modelView = mult(modelView, scalem(0.5, 0.5, 0.5));
    
    sphere = createSphere(light_blue, modelView);
    sphere.primtype = gl.TRIANGLES;
    
  //  wf_sphere = createSphere(black, modelView);
    objArray.push(sphere);
  //  objArray.push(wf_sphere);
    
    
    modelView = MVInit;
    modelView = mult(modelView, translate(-0.5, -0.5, -0.25));
    modelView = mult(modelView, rotate(10, [1, 0, 0]));
    modelView = mult(modelView, rotate(-30, [0, 1, 0]));
    modelView = mult(modelView, rotate(10, [0, 0, 1]));
    modelView = mult(modelView, scalem(0.8, 0.5, 0.5));
    
    cylinder = createCylinder(rCylinder, hCylinder, light_green, modelView);
    cylinder.primtype = gl.TRIANGLES;
    
  //  wf_cylinder = createCylinder(rCylinder, hCylinder, black, modelView);
    objArray.push(cylinder);
  //  objArray.push(wf_cylinder);
    
    modelView = MVInit;
    axes = createAxes(gray, MVInit);
    
     gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
	gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition2"),flatten(lightPosition2) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
	gl.uniform4fv( gl.getUniformLocation(program,
       "eyePosition"),flatten(vec4(eye,1)) );
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
    var normals = [];
    var indexData = [];
    
   // var pt = [], nt = [];
    var Phi = 0, dPhi = 2 * Math.PI / (nPhi - 1), Nx = r1 - r2, Ny = h, N = Math.sqrt(Nx * Nx + Ny * Ny);
    Nx /= N;
    Ny /= N;
    for (var i = 0; i < nPhi; i++) {
        var cosPhi = Math.cos(Phi);
        var sinPhi = Math.sin(Phi);
        var cosPhi2 = Math.cos(Phi + dPhi / 2);
        var sinPhi2 = Math.sin(Phi + dPhi / 2);
      //  pt.push(-h / 2, cosPhi * r1, sinPhi * r1); // points
        vertices.push(vec4(-h / 2, cosPhi * r1, sinPhi * r1, 1));
        colors.push(color);
        
        //   nt.push ( Nx, Ny*cosPhi, Ny*sinPhi );         // normals
        normals.push(normalize(vec4(Nx, Ny*cosPhi, Ny*sinPhi,0)));
      //  pt.push(h / 2, cosPhi2 * r2, sinPhi2 * r2); // points
        vertices.push(vec4(h / 2, cosPhi * r2, sinPhi * r2, 1));
        colors.push(color);
        //   nt.push ( Nx, Ny*cosPhi2, Ny*sinPhi2 );       // normals
        normals.push(normalize(vec4(Nx, Ny*cosPhi2, Ny*sinPhi2,0)));
        Phi += dPhi;
    }
    
    if (r1 != 0) {
        vertices.push(vec4(-h / 2, 0, 0, 1));
        colors.push(color);
        normals.push(vec4(-1, 0, 0, 1));
    }
    
    if (r2 != 0) {
        vertices.push(vec4(h / 2, 0, 0, 1));
        colors.push(color);
        normals.push(vec4(1, 0, 0, 1));
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
    
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var cone = {
        modelView: modelView,
        buffer: vertexBuffer,
        normalBuffer: normalBuffer,
        colorBuffer: colorBuffer,
        indices: indexBuffer,
        vertSize: 4,
        nVerts: vertices.length,
        normalSize: 4,
        nNormals: normals.length,
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
    var normals = [];
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
            normals.push(normalize(vec4(x,y,z,0)));
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
    
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    var sphere = {
        shape: "sphere",
        modelView: modelView,
        buffer: vertexBuffer,
        normalBuffer: normalBuffer,
        colorBuffer: colorBuffer,
        indices: indexBuffer,
        vertSize: 4,
        nVerts: vertices.length,
        normalSize: 4,
        nNormals: normals.length,
        colorSize: 4,
        nColors: colors.length,
        nIndices: indexData.length,
        primtype: gl.LINE_LOOP
    };
    return sphere;
}

function createAxes(color, modelView){
    var colors = [];
    
    var vertices = [vec4(-1, 0, 0, 1), vec4(1, 0, 0, 1), vec4(0, -1, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, -2, 1), vec4(0, 0, 2, 1),
	vec4(0.97, -0.02, 0, 1),vec4(0.97, 0.02, 0, 1),
	vec4( -0.02,0.97, 0, 1),vec4(0.02, 0.97, 0, 1),
	vec4( -0.02,0,1.8,1),vec4(0.02, 0, 1.8, 1)];
    var indexData = [0, 1, 2, 3, 4, 5,6,1,7,1,8,3,9,3,10,5,11,5];
    
    
    for (var i = 0; i <= vertices.length; i++) {
        colors.push(color);
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
    
    var axes = {
        shape: "axes",
        modelView: modelView,
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: indexBuffer,
        vertSize: 4,
        nVerts: vertices.length,
        colorSize: 4,
        nColors: colors.length,
        nIndices: indexData.length,
        primtype: gl.LINES
    };
    return axes;
}


function draw(obj){

   
    // connect up the shader parameters: vertex position and projection/model matrices
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(vPosition, obj.vertSize, gl.FLOAT, false, 0, 0);
	
    gl.enableVertexAttribArray(vNormal);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.vertexAttribPointer(vNormal, obj.normalSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
    
    gl.uniformMatrix4fv(uMV, false, flatten(obj.modelView));
    gl.uniformMatrix4fv(uP, false, flatten(PInit));
    
    var modelViewMatrix = obj.modelView;
   normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
	/*
	normalMatrix = [
        vec3(MVInit[0][0], MVInit[0][1], MVInit[0][2]),
        vec3(MVInit[1][0], MVInit[1][1], MVInit[1][2]),
        vec3(MVInit[2][0], MVInit[2][1], MVInit[2][2])
    ];*/
  //  gl.uniformMatrix3fv(uNormal, false, flatten(normalMatrix) );
        
		
   gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
	gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition2"),flatten(lightPosition2) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
	   
	   
    // draw the object
    if (obj.primtype == gl.LINES) {
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
    else {
        for (var i = 0; i < obj.nIndices - 3; i = i + 3) 
            gl.drawElements(obj.primtype, 3, gl.UNSIGNED_SHORT, 2 * i);
    }
}

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
   // draw(axes);
    
    for (var i = 0; i < objArray.length; i++) {
        draw(objArray[i]);
    }
    
    window.requestAnimFrame(render);
    
}

function addObj(){
    var modelView = MVInit;
    
    modelView = mult(modelView, translate(inpPx, inpPy, inpPz));
    modelView = mult(modelView, rotate(inpRx, [1, 0, 0]));
    modelView = mult(modelView, rotate(inpRy, [0, 1, 0]));
    modelView = mult(modelView, rotate(inpRz, [0, 0, 1]));
    modelView = mult(modelView, scalem(inpSx, inpSy, inpSz));
    
    switch (Number(inpShape)) {
        case 0:
            usrObj = createSphere(inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;
            
        //    wf_usrObj = createSphere(black, modelView);
            
            break;
            
        case 1:
            usrObj = createCone(rCone, hCone, inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;
            
       //     wf_usrObj = createCone(rCone, hCone, black, modelView);
            
            break;
            
        case 2:
            usrObj = createCylinder(rCylinder, hCylinder, inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;
            
      //      wf_usrObj = createCylinder(rCylinder, hCylinder, black, modelView);
            
            break;
    }
    
    objArray.push(usrObj);
  //  objArray.push(wf_usrObj);
}

function removeLastObj(){
    objArray.pop();
//    objArray.pop();
}

function removeAllObj(){
    objArray = [];
}

function saveToFile(){

    var res = "";
    for (var k = 0; k < objArray.length; k++) {
        var u = objArray[k].modelView;
        var m_str = objArray[k].shape + "\r\n[ \r\n";
        
        for (var i = 0; i < u.length; i++) {
            m_str = m_str.concat(u[i].join(" "), "\r\n");
        }
        m_str = m_str.concat("]\r\n");
        res += m_str + "\r\n";
    }
    
    
    
    var blob = new Blob([res], {
        type: "text/plain;charset=utf-8"
    }); // the blob
    saveAs(blob, "debug.txt");
}
