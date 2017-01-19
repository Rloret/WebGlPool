
var gl, program;
var myTorus;
var myphi = 0, zeta = 30, radius = 15, fovy = Math.PI/10;
var selectedPrimitive = exampleCone;
var aguaActiva=true;
var textures = [];
var lightx =0;
var lighty=0;
var lightz=0;
var time = 0.0;
var temporizador;


var suelo = [[1,1,1,1,1,1,1,1,1,1],
			 [1,2,1,1,1,1,1,1,2,1],
			 [1,1,1,0,0,0,0,1,1,1],
			 [1,2,1,0,0,0,0,1,2,1],
			 [1,1,1,0,0,0,0,1,1,1],
			 [1,2,1,0,0,0,0,1,2,1],
			 [1,1,1,0,0,0,0,1,1,1],
			 [1,2,1,0,0,0,0,1,2,1],
			 [1,1,1,0,0,0,0,1,1,1],
			 [1,2,1,1,1,1,1,1,2,1],
		     [1,1,1,1,1,1,1,1,1,1]
			];
			
var lado =1;
var anchoPiscina =4*lado;
var largoPiscina= 7*lado;
var altoPiscina=2*lado;
var altocolumna =8*lado;
var margenX =-5.5;
var margenZ =-5;

var modelMatrix = mat4.create();
var modelViewMatrix = mat4.create();
var normalMatrix = mat3.create();
var projectionMatrix  = mat4.create();

function getWebGLContext() {
    
  var canvas = document.getElementById("myCanvas");
    
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    
  for (var i = 0; i < names.length; ++i) {
    try {
      return canvas.getContext(names[i]);
    }
    catch(e) {
    }
  }
    
  return null;

}

function initShaders() { 
    
    
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
  
  gl.useProgram(program);
  
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
  
  program.modelViewMatrixIndex  = gl.getUniformLocation( program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation( program, "projectionMatrix");
  
  // normales
  program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
  program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);
  
  // coordenadas de textura
  program.vertexTexcoordsAttribute = gl.getAttribLocation ( program, "VertexTexcoords");
  gl.enableVertexAttribArray(program.vertexTexcoordsAttribute);
  program.repetition               = gl.getUniformLocation( program, "repetition");
  program.textureIndex = gl.getUniformLocation(program, 'myTexture');
  gl.uniform1f(program.repetition,1);
  // material
  program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
  program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
  program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
  program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");
  
  // fuente de luz
  program.LaIndex               = gl.getUniformLocation( program, "Light.La");
  program.LdIndex               = gl.getUniformLocation( program, "Light.Ld");
  program.LsIndex               = gl.getUniformLocation( program, "Light.Ls");
  program.PositionIndex         = gl.getUniformLocation( program, "Light.Position");
  
  program.transpaIndex          = gl.getUniformLocation( program, "alpha");
  gl.uniform1f(program.transpaIndex, 1.0);
  
  program.semaforoIndex = gl.getUniformLocation(program, 'semaforo');
  gl.uniform1f(program.semaforoIndex,1.0);
  
  program.KIndex                = gl.getUniformLocation( program, "K");
  program.VelocityIndex         = gl.getUniformLocation( program, "Velocity");
  program.AmpIndex              = gl.getUniformLocation( program, "Amp");
  program.TiempoIndex           = gl.getUniformLocation( program, "Time");
  
  gl.uniform1f (program.KIndex,        50.0);
  gl.uniform1f (program.VelocityIndex,  1.0);
  gl.uniform1f (program.AmpIndex,       0.07);
  gl.uniform1f (program.TiempoIndex,    0.0);
  
}
function updateTime(){
  
  time += 0.01;
  gl.uniform1f (program.TiempoIndex, time);

  requestAnimationFrame(drawScene);

}
function initRendering() { 

  gl.clearColor(0.15,0.15,0.15,1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  setShaderLight();

}

function initBuffers(model) {
    
  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

}

function initPrimitives() {

  initBuffers(examplePlane);
  initBuffers(exampleCube);
  initBuffers(exampleCone);
  initBuffers(exampleCylinder);
  initBuffers(exampleSphere);
  initBuffers(exampleBox);
  initBuffers(examplePlaneAgua30);
  
  myTorus = makeTorus(0.5, 1, 100, 100);
  initBuffers(myTorus);
  

}


function setShaderProjectionMatrix(projectionMatrix) {
  
  gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
  
}

function setShaderModelViewMatrix(modelViewMatrix) {
  
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
}

function setShaderNormalMatrix(normalMatrix) {
  
  gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
  
}

function getNormalMatrix(modelViewMatrix) {
  
  var normalMatrix = mat3.create();
  
  mat3.fromMat4  (normalMatrix, modelViewMatrix);
  mat3.invert    (normalMatrix, normalMatrix);
  mat3.transpose (normalMatrix, normalMatrix);
  
  return normalMatrix;
  
}

function getProjectionMatrix() {
  
  var projectionMatrix  = mat4.create();
  
  mat4.perspective(projectionMatrix, fovy, 1.0, 0.1, 100.0);
  
  return projectionMatrix;
  
}

function getCameraMatrix() {
  
  var _phi  = myphi* Math.PI / 180.0;
  var _zeta = zeta * Math.PI / 180.0;
  
  var x = 0, y = 0, z = 0;
  z = radius * Math.cos(_zeta) * Math.cos(_phi);
  x = radius * Math.cos(_zeta) * Math.sin(_phi);
  y = radius * Math.sin(_zeta);
  
  var cameraMatrix = mat4.create();
  mat4.lookAt(cameraMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
  
  return cameraMatrix;
  
}

function setShaderMaterial(material) {

  gl.uniform3fv(program.KaIndex,    material.mat_ambient);
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
  gl.uniform3fv(program.KsIndex,    material.mat_specular);
  gl.uniform1f (program.alphaIndex, material.alpha);
  
}

function setShaderLight() {

  gl.uniform3f(program.LaIndex,       1.0,1.0,1.0);
  gl.uniform3f(program.LdIndex,       1.0,1.0,1.0);
  gl.uniform3f(program.LsIndex,       1.0,1.0,1.0);
  gl.uniform3f(program.PositionIndex,1000.0,40.0,1.0)
  
  
}

function drawSolid(model) { 
    
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute,  3, gl.FLOAT, false, 8*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,    3, gl.FLOAT, false, 8*4, 3*4);
  gl.vertexAttribPointer (program.vertexTexcoordsAttribute, 2, gl.FLOAT, false, 8*4, 6*4);
  
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}


function isPowerOfTwo(x) {

  return (x & (x - 1)) == 0;

}

function nextHighestPowerOfTwo(x) {

  --x;
  
  for (var i = 1; i < 32; i <<= 1) {
    x = x | x >> i;
  }
  
  return x + 1;

}

function setModeloVistaYNormal(modelMatrix){
	
	var modelViewMatrix = mat4.create();
	mat4.multiply     (modelViewMatrix, getCameraMatrix(), modelMatrix);
	setShaderModelViewMatrix(modelViewMatrix);
	setNormalMatrix(modelViewMatrix)
	
}

function setNormalMatrix(modelViewMatrix){
	
	var normalMatrix = mat3.create();
	normalMatrix = getNormalMatrix(modelViewMatrix);
	setShaderNormalMatrix(normalMatrix);
	
}

function setProjectionMatrix(){
	
	var projectionMatrix  = mat4.create();
	projectionMatrix = getProjectionMatrix();
	setShaderProjectionMatrix(projectionMatrix);
	
}
function drawFloor(posX,posY,posZ,mat){
	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate    (modelMatrix, modelMatrix, [posX, posY-0.01, posZ]);
	mat4.scale     (modelMatrix, modelMatrix, [lado, lado, lado]);
				
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();	  
	
	setShaderMaterial(mat);
	drawSolid(examplePlane);
	
}

function drawColumn(posX,posY,posZ,mat){
	
	drawBottomBaseCubeColumn(posX,posY,posZ,mat);	
	drawTopBaseCubeColumn(posX,(posY*altocolumna)+lado,posZ,mat);
	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate (modelMatrix, modelMatrix, [posX, posY+lado/6,posZ]);
	mat4.scale     (modelMatrix, modelMatrix, [lado/2, altocolumna, lado/2]);
	mat4.rotate(modelMatrix, modelMatrix,-Math.PI/2,[1, 0, 0]);
				
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();	
	
	setShaderMaterial(mat);
	gl.uniform1f(program.repetition, 3.0);
	drawSolid(exampleCylinder);
	gl.uniform1f(program.repetition, 1.0);
}

function drawBottomBaseCubeColumn(posX,posY,posZ,mat){
	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate (modelMatrix, modelMatrix, [posX, posY+lado/6,posZ]);
	mat4.scale     (modelMatrix, modelMatrix, [lado*1.5, lado/3, lado*1.5]);
				
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();	
	
	setShaderMaterial(mat);
	drawSolid(exampleCube);
	

	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate (modelMatrix, modelMatrix, [posX, posY+lado/3,posZ]);
	mat4.scale     (modelMatrix, modelMatrix, [lado/1.4, (lado*2)/3, lado/1.4]);
	mat4.rotate(modelMatrix, modelMatrix,-Math.PI/2,[1, 0, 0]);
				
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();	
	
	setShaderMaterial(mat);
	drawSolid(exampleCone);
	
}


function drawTopBaseCubeColumn(posX,posY,posZ,mat){
	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate (modelMatrix, modelMatrix, [posX, posY+lado/6,posZ]);
	mat4.scale     (modelMatrix, modelMatrix, [lado*1.5, lado/3, lado*1.5]);
				
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();	
	
	setShaderMaterial(mat);
	drawSolid(exampleCube);
	

	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate (modelMatrix, modelMatrix, [posX, posY,posZ]);
	mat4.scale     (modelMatrix, modelMatrix, [lado/1.4, (lado*2)/3, lado/1.4]);
	mat4.rotate(modelMatrix, modelMatrix,Math.PI/2,[1, 0, 0]);
				
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();	
	
	setShaderMaterial(mat);
	drawSolid(exampleCone);
	
}
function drawPool(mat){
	
	var modelMatrix = mat4.create();
	mat4.identity  (modelMatrix);
	mat4.translate (modelMatrix, modelMatrix, [-lado/2, -0.01,-lado/2]);
	mat4.scale     (modelMatrix, modelMatrix, [largoPiscina, altoPiscina, anchoPiscina]);
	mat4.rotate(modelMatrix, modelMatrix,-Math.PI/2,[1, 0, 0]);
				
	setModeloVistaYNormal(modelMatrix);
	setModeloVistaYNormal(modelMatrix);
	setProjectionMatrix();
	
	setShaderMaterial(mat);
	drawSolid(exampleBox);
	
	
	
	gl.uniform1f(program.repetition, 1.0);
	setShaderTexture(3);
	drawStairs(Brass);
	
	if(aguaActiva){
		setShaderTexture(4)
		gl.depthMask (false);              
		gl.enable    (gl.BLEND);           
		gl.uniform1f(program.transpaIndex,0.3);
	    gl.uniform1f(program.semaforoIndex,0.0);
		var modelMatrix = mat4.create();
		mat4.identity  (modelMatrix);
		mat4.translate (modelMatrix, modelMatrix, [-lado*4, lado-0.01,-lado*2.5]);
		mat4.scale     (modelMatrix, modelMatrix, [largoPiscina, 1, anchoPiscina]);
		mat4.rotate(modelMatrix, modelMatrix,Math.PI/2,[1, 0, 0]);
				
		setModeloVistaYNormal(modelMatrix);
		setModeloVistaYNormal(modelMatrix);
		setProjectionMatrix();
	
		setShaderMaterial(Turquoise);
		drawSolid(examplePlaneAgua30);
		gl.uniform1f(program.semaforoIndex,1.0);
		gl.depthMask(true);              
		gl.disable(gl.BLEND);            
	
	}
}

function drawStairs(mat){
	
	for (var i=0;i<2;i++){
		var modelMatrix = mat4.create();
		mat4.identity  (modelMatrix);
		mat4.translate (modelMatrix, modelMatrix, [margenX+2-(2*lado/5)+0.01, lado/2,-i-0.25+lado/5]);
		mat4.scale     (modelMatrix, modelMatrix, [lado/5, altoPiscina+lado, lado/5]);
	
		setModeloVistaYNormal(modelMatrix);
		setModeloVistaYNormal(modelMatrix);
		setProjectionMatrix();
		setShaderMaterial(mat);

		drawSolid(exampleCube);
	}
	for (var i=0;i<2;i++){

		var modelMatrix = mat4.create();
		mat4.identity  (modelMatrix);
		mat4.translate (modelMatrix, modelMatrix, [margenX+2-lado+lado*0.25+0.01, lado*2-lado/10,-i-0.25+lado/5]);
		mat4.scale     (modelMatrix, modelMatrix, [lado/2, lado/5, lado/5]);
		
		setModeloVistaYNormal(modelMatrix);
		setModeloVistaYNormal(modelMatrix);
		setProjectionMatrix();
		setShaderMaterial(mat);		
		drawSolid(exampleCube);
	}
	for (var i=0;i<2;i++){
		var modelMatrix = mat4.create();
		mat4.identity  (modelMatrix);
		mat4.translate (modelMatrix, modelMatrix, [margenX+2-lado+lado/10+0.01, lado*2-lado/2-lado/10,-i-0.25+lado/5]);
		mat4.scale     (modelMatrix, modelMatrix, [lado/5, lado-lado/5, lado/5]);

		setModeloVistaYNormal(modelMatrix);
		setModeloVistaYNormal(modelMatrix);
		setProjectionMatrix();
		setShaderMaterial(mat);		
		drawSolid(exampleCube);
	}
	for (var i=0;i<2;i++){
		var modelMatrix = mat4.create();
		mat4.identity  (modelMatrix);
		mat4.translate (modelMatrix, modelMatrix, [margenX+2-lado+lado/10+0.01, lado,-i-0.25+lado/5]);
		mat4.scale     (modelMatrix, modelMatrix, [lado/5, lado/5, lado/5]);
		mat4.rotate(modelMatrix, modelMatrix,-Math.PI/2,[1, 0, 0]);
		
		setModeloVistaYNormal(modelMatrix);
		setModeloVistaYNormal(modelMatrix);
		setProjectionMatrix();
		setShaderMaterial(mat);		
		drawSolid(exampleCone);
	}
	drawSteps(mat);



}
function drawSteps(mat){
	
	for (var i=0;i<4;i++){
		var modelMatrix = mat4.create();
		mat4.identity  (modelMatrix);
		mat4.translate (modelMatrix, modelMatrix, [margenX+2-(2*lado/5)+0.01,(altoPiscina-i)/(altoPiscina)-lado/5,-0.75+lado/5]);
		mat4.scale     (modelMatrix, modelMatrix, [lado/5, lado/8, lado-lado/5]);
	
		setModeloVistaYNormal(modelMatrix);
		setModeloVistaYNormal(modelMatrix);
		setProjectionMatrix();
		setShaderMaterial(mat);
		drawSolid(exampleCube);
	}
}
function drawScene() {
    
      // dibujamos la escena solo si todas las texturas tienen ya una imagen cargada
    for (var i = 0; i < textures.length; i++) {
      //  console.log(textureUnit, i, textures[i].loaded);
      if (! textures[i].loaded) {
        // console.log("salgo");
        return;
        
      }
    }
	
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(program.semaforo,1.0);
  for (var i=0; i<11;i++){
		for (var j=0; j< 10;j++){
		 if(suelo[i][j]== 1){
			 setShaderTexture(1);
			 drawFloor(margenX+lado*i, 1, margenZ +lado*j,Obsidian);
		 } 
		 else if(suelo[i][j]== 2){

			 setShaderTexture(0);
			drawColumn(margenX+lado*i, 1, margenZ +lado*j,Perl);}
		}
  }
  gl.uniform1f(program.repetition, 4.0);
  setShaderTexture(2);
  drawPool(Chrome);

}



function initHandlers() {
    
  var mouseDown = false;
  var lastMouseX;
  var lastMouseY;

  var canvas = document.getElementById("myCanvas");

  canvas.addEventListener("mousedown",
    function(event) {
      mouseDown  = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    },
    false);

  canvas.addEventListener("mouseup",
    function() {
      mouseDown = false;
    },
    false);

  canvas.addEventListener("mousemove",
    function (event) {
      if (!mouseDown) {
        return;
      }
      var newX = event.clientX;
      var newY = event.clientY;
      if (event.shiftKey == 1) {
        if (event.altKey == 1) {
          // fovy
          fovy -= (newY - lastMouseY) / 100.0;
          if (fovy < 0.001) {
            fovy = 0.1;
          }
        } else {
          // radius
          radius -= (newY - lastMouseY) / 10.0;
          if (radius < 0.01) {
            radius = 0.01;
          }
        }
      } else {
        // position
        myphi -= (newX - lastMouseX);
        zeta  += (newY - lastMouseY);
        if (zeta < -80) {
          zeta = -80.0;
        }
        if (zeta > 80) {
          zeta = 80;
        }
      }
      lastMouseX = newX
      lastMouseY = newY;
	  
	  requestAnimationFrame(drawScene);

    },
    false);

 var botones = document.getElementsByTagName("button");
  
  botones[0].addEventListener("click",
    function(){
	  if(aguaActiva) {
		  aguaActiva=false;
		  clearInterval(temporizador);
		  }
	  else{
		  aguaActiva=true;
		  temporizador = setInterval(updateTime, 40);
		  }

      selectedPrimitive = examplePlane;
      requestAnimationFrame(drawScene);
    },
    false);


  var colors = document.getElementsByTagName("input");
  
  colors[0].addEventListener("change",
    function(){
      setColor(program.LaIndex, colors[0].value);
      requestAnimationFrame(drawScene);

    },
    false);

  colors[1].addEventListener("change",
    function(){
      setColor(program.LdIndex, colors[1].value);
      requestAnimationFrame(drawScene);

    },
    false);

  colors[2].addEventListener("change",
    function(){
     setColor(program.LsIndex, colors[2].value);
	requestAnimationFrame(drawScene);

    },
    false);
	

}        

function setColor (index, value) {

  var myColor = value.substr(1); // para eliminar el # del #FCA34D
      
  var r = myColor.charAt(0) + '' + myColor.charAt(1);
  var g = myColor.charAt(2) + '' + myColor.charAt(3);
  var b = myColor.charAt(4) + '' + myColor.charAt(5);

  r = parseInt(r, 16) / 255.0;
  g = parseInt(g, 16) / 255.0;
  b = parseInt(b, 16) / 255.0;
  
  gl.uniform3f(index, r, g, b);
  
}

function initWebGL() {
    
  gl = getWebGLContext();
    
  if (!gl) {
    alert("WebGL no está disponible");
    return;
  }
   if(aguaActiva) temporizador = setInterval(updateTime, 40);
  initShaders();
  initPrimitives();
  initRendering();
  initHandlers();
  initTextures();
 // requestAnimationFrame(drawScene);
  
}


function changeTextureImage(image, textureUnit) {

    // la hacemos de tamaño potencia de dos
    if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {

      // Scale up the texture to the next highest power of two dimensions.
      var canvas    = document.createElement("canvas");
      canvas.width  = nextHighestPowerOfTwo(image.width);
      canvas.height = nextHighestPowerOfTwo(image.height);

      var ctx       = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image = canvas;
      
    }
    
    // se activa la unidad de textura indicada y se le asigna el objeto textura
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, textures[textureUnit]);

    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    
    // datos de la textura
    gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // parámetros de filtrado
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // parámetros de repetición (ccordenadas de textura mayores a uno)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    
    // creación del mipmap
    gl.generateMipmap(gl.TEXTURE_2D);

    textures[textureUnit].loaded = true;

    requestAnimationFrame(drawScene);

}


function createTexture(urlInitialImage, textureUnit) {
    
    // creación de la textura
    textures[textureUnit]        = gl.createTexture();
    textures[textureUnit].loaded = false;

    var image = new Image();
    
    image.addEventListener("load",
			   function() {
			       changeTextureImage(image, textureUnit);
			   },
			   false);
    image.addEventListener("error",
			   function(err) {
			       console.log("MALA SUERTE: no esta disponible " + this.src);
			   },
			   
			   false);
    image.crossOrigin = 'anonymous'; // Esto evita que Chrome se queje de SecurityError al cargar la imagen de otro dominio
    image.src         = urlInitialImage;

}

function initTextures() {

    createTexture("http://cphoto.uji.es/vj1221/assets/textures/stone_9290068.JPG", 0);//columnas
//    createTexture("http://cphoto.uji.es/vj1221/assets/textures/noexisto", 1); // Prueba de que no dibuja si no carga alguna
    createTexture("http://cphoto.uji.es/vj1221/assets/textures/painted_wood_stained_4185.JPG", 1);//suelo
	createTexture("http://cphoto.uji.es/vj1221/assets/textures/plastic_flooring_2090268.JPG",2);//piscina
	createTexture("http://cphoto.uji.es/vj1221/assets/textures/plastic_grippy_flooring_4131542.JPG",3)//escaleras
	createTexture("http://i.imgur.com/DgWcmU9.jpg",4)//caustics

}
function setShaderTexture(textureIndex) {

    gl.uniform1i(program.textureIndex, textureIndex);

}
initWebGL();
