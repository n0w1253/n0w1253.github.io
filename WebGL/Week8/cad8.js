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
var usrObj;
var program;
var programAxes;
var vPosition;
var vPositionAxes;
var vColorAxes;
var vNormal;
var uMV;
var uP;
var uMVAxes;
var uPAxes;


var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;
var fovy = 12.0; // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0; // Viewport aspect ratio
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var near = 3;
var far = -10;
var MVInit;
var PInit;

var dr = 2 * Math.PI / 180.0;
var useLight1 = true;
var useLight2 = true;
var light1X = 10;
var light1Y = 10;
var light1Z = 10;
var lightPosition = vec4(light1X, light1Y, light1Z, 0.0);
var lightDistance = length(lightPosition);
var theta = Math.atan2(lightPosition[1], lightPosition[0]);
var lightDistanceXY = length([lightPosition[0], lightPosition[1]]);

var light2X = 10;
var light2Y = 0;
var light2Z = 10;
var lightPosition2 = vec4(light2X, light2Y, light2Z, 0.0);
var light2Distance = length(lightPosition2);
var theta2 = Math.atan2(lightPosition2[1], lightPosition2[2]);
var light2DistanceYZ = length([lightPosition2[1], lightPosition2[2]]);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var ambientProduct, diffuseProduct, specularProduct;

function init(){

    canvas = document.getElementById("gl-canvas");
    
    document.getElementById("Controls").value = 0;
    document.getElementById("tab1").click();
    document.getElementById("light1CB").checked = true;
    document.getElementById("light2CB").checked = true;
    document.getElementById("sliderObjL1Px").value = light1X;
    document.getElementById("sliderObjL1Py").value = light1Y;
    document.getElementById("sliderObjL1Pz").value = light1Z;
    
    document.getElementById("sliderObjL2Px").value = light2X;
    document.getElementById("sliderObjL2Py").value = light2Y;
    document.getElementById("sliderObjL2Pz").value = light2Z;
    
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    aspect = canvas.width / canvas.height;
    
    // clear the background
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // enable depth testing   
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
       
    //  Load shaders and initialize attribute buffers    
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    programAxes = initShaders(gl, "vertex-shader-axes", "fragment-shader-axes");
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    vNormal = gl.getAttribLocation(program, "vNormal");
    uMV = gl.getUniformLocation(program, "modelViewMatrix");
    uP = gl.getUniformLocation(program, "projectionMatrix");

    vPositionAxes = gl.getAttribLocation(programAxes, "vPosition");
    vColorAxes = gl.getAttribLocation(programAxes, "vColor");
    uMVAxes = gl.getUniformLocation(programAxes, "modelViewMatrix");
    uPAxes = gl.getUniformLocation(programAxes, "projectionMatrix");
    
    var eye = vec3(0.25, 0.5, 10);
    
    MVInit = lookAt(eye, at, up);
    PInit = perspective(fovy, aspect, near, far);
    
    var modelView = MVInit;
    modelView = mult(modelView, translate(-0.5, 0.5, -0.25));
    modelView = mult(modelView, rotate(-80, [1, 0, 0]));
    modelView = mult(modelView, rotate(30, [0, 1, 0]));
    modelView = mult(modelView, rotate(20, [0, 0, 1]));
    modelView = mult(modelView, scalem(0.5, 0.5, 0.5));
    
    cone = createCone(rCone, hCone, light_red, modelView);
    cone.primtype = gl.TRIANGLES;
    
    objArray.push(cone);
    
    modelView = MVInit;
    modelView = mult(modelView, translate(0.5, 0.5, -0.25));
    modelView = mult(modelView, scalem(0.5, 0.5, 0.5));
    
    sphere = createSphere(light_blue, modelView);
    sphere.primtype = gl.TRIANGLES;
        
    objArray.push(sphere);
       
    modelView = MVInit;
    modelView = mult(modelView, translate(-0.5, -0.5, -0.25));
    modelView = mult(modelView, rotate(10, [1, 0, 0]));
    modelView = mult(modelView, rotate(-30, [0, 1, 0]));
    modelView = mult(modelView, rotate(10, [0, 0, 1]));
    modelView = mult(modelView, scalem(0.8, 0.5, 0.5));
    
    cylinder = createCylinder(rCylinder, hCylinder, light_green, modelView);
    cylinder.primtype = gl.TRIANGLES;
       
    objArray.push(cylinder);
       
    modelView = MVInit;
    axes = createAxes(gray, MVInit);
    
    gl.useProgram(program);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"), flatten(lightPosition2));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    gl.uniform4fv(gl.getUniformLocation(program, "eyePosition"), flatten(vec4(eye, 1)));
    gl.uniform1i(gl.getUniformLocation(program, "uUseLight1"), useLight1);
    gl.uniform1i(gl.getUniformLocation(program, "uUseLight2"), useLight2);
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
    
    var Phi = 0, dPhi = 2 * Math.PI / (nPhi - 1), Nx = r1 - r2, Ny = h, N = Math.sqrt(Nx * Nx + Ny * Ny);
    Nx /= N;
    Ny /= N;
    for (var i = 0; i < nPhi; i++) {
        var cosPhi = Math.cos(Phi);
        var sinPhi = Math.sin(Phi);
        var cosPhi2 = Math.cos(Phi + dPhi / 2);
        var sinPhi2 = Math.sin(Phi + dPhi / 2);
        
        vertices.push(vec4(-h / 2, cosPhi * r1, sinPhi * r1, 1));
        colors.push(color);
        
        normals.push(normalize(vec4(Nx, Ny * cosPhi, Ny * sinPhi, 0)));
        vertices.push(vec4(h / 2, cosPhi * r2, sinPhi * r2, 1));
        colors.push(color);
        normals.push(normalize(vec4(Nx, Ny * cosPhi2, Ny * sinPhi2, 0)));
        Phi += dPhi;
    }
    
    var r1CtrIdx = 0;
    var r1EndIdx = 0;
    var r2CtrIdx = 0;
    var r2EndIdx = 0;
    if (r1 > 0.0001) {
        vertices.push(vec4(-h / 2, 0, 0, 1));
        colors.push(color);
        normals.push(vec4(-1, 0, 0, 1));
        r1CtrIdx = vertices.length - 1;
        
        for (var i = 0; i < nPhi; i++) {
            var first = 2 * i;
            var second = (2 * i + 2) % 200;
            vertices.push(vertices[second]);
            colors.push(color);
            normals.push(vec4(-1, 0, 0, 1));
            
            vertices.push(vertices[first]);
            colors.push(color);
            normals.push(vec4(-1, 0, 0, 1));
            
        }
        r1EndIdx = vertices.length - 1;
    }
    
    if (r2 > 0.0001) {
        vertices.push(vec4(h / 2, 0, 0, 1));
        colors.push(color);
        normals.push(vec4(1, 0, 0, 1));
        
        r2CtrIdx = vertices.length - 1;
        
        for (var i = 0; i < nPhi; i++) {
            var first = 2 * i + 1;
            var second = (2 * i + 3) % 200;
            vertices.push(vertices[first]);
            colors.push(color);
            normals.push(vec4(1, 0, 0, 1));
            
            vertices.push(vertices[second]);
            colors.push(color);
            normals.push(vec4(1, 0, 0, 1));
            
        }
        r2EndIdx = vertices.length - 1;
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
    
    if (r1 > 0.0001) {
    
        for (var i = r1CtrIdx + 1; i < r1EndIdx; i++) {
        
            indexData.push(r1CtrIdx);
            
            indexData.push(i);
            indexData.push(i + 1);
            
            
        }
    }
    if (r2 > 0.0001) {
    
        for (var i = r2CtrIdx + 1; i < r2EndIdx; i++) {
        
            indexData.push(r2CtrIdx);
            
            indexData.push(i);
            indexData.push(i + 1);
            
            
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
            
            vertices.push(vec4(radius * x, radius * y, radius * z, 1));
            normals.push(normalize(vec4(x, y, z, 0)));
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
    
    var vertices = [vec4(-1, 0, 0, 1), vec4(1, 0, 0, 1), vec4(0, -1, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, -2, 1), vec4(0, 0, 2, 1), vec4(0.97, -0.02, 0, 1), vec4(0.97, 0.02, 0, 1), vec4(-0.02, 0.97, 0, 1), vec4(0.02, 0.97, 0, 1), vec4(-0.02, 0, 1.8, 1), vec4(0.02, 0, 1.8, 1)];
    var indexData = [0, 1, 2, 3, 4, 5, 6, 1, 7, 1, 8, 3, 9, 3, 10, 5, 11, 5];
    
    
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
   
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"), flatten(lightPosition2));
    gl.uniform1i(gl.getUniformLocation(program, "uUseLight1"), useLight1);
    gl.uniform1i(gl.getUniformLocation(program, "uUseLight2"), useLight2);
    
    // draw the object
    if (obj.primtype == gl.LINES) {
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
    else {
        for (var i = 0; i < obj.nIndices - 3; i = i + 3) 
            gl.drawElements(obj.primtype, 3, gl.UNSIGNED_SHORT, 2 * i);
    }
}

function drawAxes(obj){

    // connect up the shader parameters: vertex position and projection/model matrices
    gl.enableVertexAttribArray(vPositionAxes);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    gl.vertexAttribPointer(vPositionAxes, obj.vertSize, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(vColorAxes);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
    gl.vertexAttribPointer(vColorAxes, obj.colorSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
    
    gl.uniformMatrix4fv(uMVAxes, false, flatten(obj.modelView));
    gl.uniformMatrix4fv(uPAxes, false, flatten(PInit));
    
    // draw the object    
    gl.drawElements(gl.LINES, obj.nIndices, gl.UNSIGNED_SHORT, 0);
}

function render(){

    theta += dr;    
    lightPosition = vec4(lightDistanceXY * Math.cos(theta), lightDistanceXY * Math.sin(theta), lightPosition[2], 0);
    
    theta2 += dr;
    lightPosition2 = vec4(lightPosition2[0], light2DistanceYZ * Math.sin(theta2), light2DistanceYZ * Math.cos(theta2), 0);
       
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.useProgram(programAxes);
    drawAxes(axes);
    
    gl.useProgram(program);
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
            break;
            
        case 1:
            usrObj = createCone(rCone, hCone, inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;           
            break;
            
        case 2:
            usrObj = createCylinder(rCylinder, hCylinder, inpColor, modelView);
            usrObj.primtype = gl.TRIANGLES;            
            break;
    }
    
    objArray.push(usrObj);
}

function removeLastObj(){
    objArray.pop();
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
