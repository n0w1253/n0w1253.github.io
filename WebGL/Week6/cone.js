"use strict";

var canvas;
var gl;



var vertices = [];
var indexData = [];

var points = [];
var nPhi = 100;
var r1 = 1;
var r2 = 0;
var h = 1;

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

var colors = [];

function init(){

    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    createCone();
    drawShape();
};

function createCone () {
   var pt = [], nt = [];
   var Phi = 0, dPhi = 2*Math.PI / (nPhi-1),
     Nx = r1 - r2, Ny = h, N = Math.sqrt(Nx*Nx + Ny*Ny);
   Nx /= N; Ny /= N;
   for (var i = 0; i < nPhi; i++ ){
      var cosPhi = Math.cos( Phi );
      var sinPhi = Math.sin( Phi );
      var cosPhi2 = Math.cos( Phi + dPhi/2 );
      var sinPhi2 = Math.sin( Phi + dPhi/2 );
      pt.push ( -h/2, cosPhi * r1, sinPhi * r1 );   // points
       vertices.push(vec4(-h/2,cosPhi * r1,sinPhi * r1,1));
	   colors.push(vertexColors[Math.floor(Math.random() * 6 )] );
   //   nt.push ( Nx, Ny*cosPhi, Ny*sinPhi );         // normals
      pt.push ( h/2, cosPhi2 * r2, sinPhi2 * r2 );  // points
      vertices.push(vec4(h/2,cosPhi * r2,sinPhi * r2,1));
	  colors.push(vertexColors[Math.floor(Math.random() * 6 )] );
   //   nt.push ( Nx, Ny*cosPhi2, Ny*sinPhi2 );       // normals
      Phi   += dPhi;
   }
   
   if (r1 != 0) {
   	  vertices.push(vec4(-h/2,0,0,1));
	  colors.push(vertexColors[Math.floor(Math.random() * 6 )] );
   }
   
   if (r2 != 0) {
   	  vertices.push(vec4(h/2,0,0,1));
	  colors.push(vertexColors[Math.floor(Math.random() * 6 )] );
   }
  /* var posLoc = gl.getAttribLocation(prog, "aPos");
   gl.enableVertexAttribArray( posLoc );
   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pt), gl.STATIC_DRAW);
   gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

   var normLoc = gl.getAttribLocation(prog, "aNorm");
   gl.enableVertexAttribArray( normLoc );
   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nt), gl.STATIC_DRAW);
   gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);*/
	

    for (var i = 0; i < nPhi-1; i++ ){
            var first = 2*i;
            var second = 2*i+1;
			var third = ( 2*i+2 ) % 200;
			var fourth = ( 2*i+3 ) % 200;
            indexData.push(first);
            indexData.push(second);
            indexData.push(third);

            indexData.push(second);
            indexData.push(third);
            indexData.push(fourth);
		
        }
   
   if (r1 != 0) {
   
   	  for (var i = 0; i < nPhi; i++ ){
            var first = 2*i;
            var second = ( 2*i+2 ) % 200;
			 indexData.push(vertices.length-2);
            indexData.push(first);
            indexData.push(second);
            
			
        }
   }
  if (r2 != 0) {
   	
   	  for (var i = 0; i < nPhi; i++ ){
            var first = 2*i +1;
            var second = ( 2*i+3 ) % 200;
			 indexData.push(vertices.length-1);
            indexData.push(first);
            indexData.push(second);
           
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
    

console.log(vertices.length+ " "+indexData.length);
    render();
}


function render(){


    gl.clear(gl.COLOR_BUFFER_BIT);

//    for( var i=0; i<indexData.length-3; i = i+3)
//        gl.drawElements( gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT,2*i );
//  gl.drawElements(gl.LINE_LOOP,indexData.length, gl.UNSIGNED_SHORT,0);
    gl.drawElements(gl.TRIANGLES,indexData.length, gl.UNSIGNED_SHORT,0);

window.requestAnimFrame(render);


}
