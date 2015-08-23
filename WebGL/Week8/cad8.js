"use strict";

var canvas;
var gl;
var alpha = 1;

var light_blue = vec4(0.0, 0.0, 0.8, 0.5); //light blue

var latitudeBands = 50;
var longitudeBands = 50;
var radius = 1;
var sphere;

var objArray = [];

var inpTexture = 0;
var inpRx = 0;
var inpRy = 0;
var inpRz = 0;

var program;
var vPosition;
var vNormal;

var uMV;
var uP;


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

var light1X = 10;
var light1Y = 10;
var light1Z = 10;
var lightPosition = vec4(light1X, light1Y, light1Z, 0.0);
var lightDistance = length(lightPosition);
var theta = Math.atan2(lightPosition[1], lightPosition[0]);
var lightDistanceXY = length([lightPosition[0], lightPosition[1]]);

var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 10.0;

var ambientProduct, diffuseProduct, specularProduct;

var texSize = 256;

var texture0, texture1,texture2;
var texture;

var image1 = new Array()
for (var i = 0; i < texSize; i++) 
    image1[i] = new Array();
for (var i = 0; i < texSize; i++) 
    for (var j = 0; j < texSize; j++) 
        image1[i][j] = new Float32Array(4);
for (var i = 0; i < texSize; i++) 
    for (var j = 0; j < texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
        image1[i][j] = [c, c, c, 1];
    }

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++) 
    for (var j = 0; j < texSize; j++) 
        for (var k = 0; k < 4; k++) 
            image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];


var image, imageMoon;

function init(){

    canvas = document.getElementById("gl-canvas");
    
    document.getElementById("Controls").value = 0;
    
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // enable depth testing   
    gl.enable(gl.DEPTH_TEST);

    
    //  Load shaders and initialize attribute buffers    
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    vNormal = gl.getAttribLocation(program, "vNormal");
    uMV = gl.getUniformLocation(program, "modelViewMatrix");
    uP = gl.getUniformLocation(program, "projectionMatrix");
       
    var eye = vec3(0.25, 0.5, 10);
    
    MVInit = lookAt(eye, at, up);
    PInit = perspective(fovy, aspect, near, far);
    
    var modelView = MVInit;
    
    sphere = createSphere(light_blue, modelView);
    sphere.primtype = gl.TRIANGLES;
    
    objArray.push(sphere);
       
    gl.useProgram(program);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    gl.uniform4fv(gl.getUniformLocation(program, "eyePosition"), flatten(vec4(eye, 1)));
       
    image = document.getElementById("texImage");
	imageMoon = document.getElementById("texImageMoon");
    
    createTextures();
    render();
    
};

function createTextures(){
	gl.activeTexture(gl.TEXTURE0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    texture0 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,  texSize, texSize,0,gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    
    texture1 = createTexture(image);		
	texture2 = createTexture(imageMoon);
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);     
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function createTexture(img){
	var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); 
    gl.generateMipmap(gl.TEXTURE_2D);
	return t;
}

function createSphere(color, modelView){
    var colors = [];
    
    var vertices = [];
    var normals = [];
    var indexData = [];
    var c_idx = 0;
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber *  Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            
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
    switch (Number(inpTexture)) {
        case 0:
            texture = texture0;  			       
            break;
            
        case 1:
            texture = texture1;
            break; 
			
	    case 2:
            texture = texture2;
            break;           
            
    }
    
	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    var modelView = MVInit;
    
    modelView = mult(modelView, rotate(inpRx, [1, 0, 0]));
    modelView = mult(modelView, rotate(inpRy, [0, 1, 0]));
    modelView = mult(modelView, rotate(inpRz, [0, 0, 1]));
  
	gl.bindTexture(gl.TEXTURE_2D, texture);
   	
    for (var i = 0; i < objArray.length; i++) {
        objArray[i].modelView = modelView;
        draw(objArray[i]);
    }
    
    
    window.requestAnimFrame(render);
    
}

