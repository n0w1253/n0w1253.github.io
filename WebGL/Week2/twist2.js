"use strict";

var canvas;
var gl;

var t_vertices = [vec2(-0.433, -0.25), vec2(0, 0.5), vec2(0.433, -0.25)];

var s_vertices = [vec2(-0.5, -0.5), vec2(-0.5, 0.5), vec2(0.5, 0.5), vec2(0.5, -0.5)];

var st_vertices = [vec2(-0.23775,-0.0725),vec2(-0.4755,0.1545),vec2(-0.147,0.20225),vec2(0,0.5), vec2(0.147,0.20225),
    vec2(0.4755,0.1545),vec2(0.23775,-0.0725),vec2(0.2939,-0.4045),vec2(0, -0.25), vec2(-0.2939,-0.4045) ];

var vertices;

var points = [];

var NumTimesToSubdivide = 5;

var theta = -10;
var thetaLoc;

var shapeType = 0;

function init(){

    document.getElementById("sliderObj").value = NumTimesToSubdivide;
    document.getElementById("sliderObj2").value = theta;
    document.getElementById("Controls").selectedIndex = shapeType;
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    drawGasket();
};

function drawGasket(){

    switch(Number(shapeType)) {
        case 0:
            vertices = t_vertices;
            break;

        case 1:
            vertices = s_vertices;
            break;

        case 2:
            vertices = st_vertices;
            break;
    }

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
    //   gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(4, 7) * 3 * 2 , gl.STREAM_DRAW);
    //    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer   
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
       
    thetaLoc = gl.getUniformLocation(program, "theta");
    render();
}

function triangle(a, b, c){
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count){

    // check for end of recursion
    
    if (count === 0) {
        triangle(a, b, c);
    }
    else {   
        //bisect the sides
        
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);
        
        --count;
        
        // three new triangles
        
        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(ab, bc, ac, count);
    }
}

function render(){
    points = [];

    var i;

    for (i = 0; i < vertices.length - 1; i++) {
               divideTriangle(vec2(0, 0), vertices[i],vertices[i+1], Number(NumTimesToSubdivide));
    }
    divideTriangle(vec2(0, 0), vertices[vertices.length - 1],vertices[0], Number(NumTimesToSubdivide));


    //  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STREAM_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var index = 0;
    
    while (index < points.length) {
        gl.uniform1f(thetaLoc, theta);		
        gl.drawArrays(gl.TRIANGLES, index, 3);
     //   gl.drawArrays(gl.LINE_LOOP, index, 3);
        index = index + 3;
    }       
}
