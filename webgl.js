var camera, canvas, spotLight;
var varfov = 300;
var camX = 0,camY = 0,camZ = 10;
var cammode = 1;
var lightX = 0, lightY = 15, lightZ = 5;
var mode = 0;
var strikeAngle = 90;
var strikerLine;
var moveables = [];
var pockets = [];
var sLAdjustx = 0;
var sLAdjusty = -1.38;
var sLAdjustz = 0.01;
var moveVector;
var collisionVectors = [];
var scene;
var lookX, lookY, lookZ;
var focus = 1;

var leftBoardLine = -2.23;
var rightBoardLine = 2.31;
var topBoardLine = 2.29;
var lowBoardLine = -2.24;

var powerBar, powerBarSlider;
var power = 0.05;


var Striker;
var Queen;

var score = 100;
var queencover = false, queenpocket = false, queencheck = false;

function Cuboid( x, y, z, l, b, h, Color, scene, name){
	var geometry = new THREE.CubeGeometry( l, b, h );
	var material = new THREE.MeshBasicMaterial( { color: Color } );
	var Base = new THREE.Mesh( geometry, material );
	Base.name = name;
	Base.position.set(x, y, z);
	scene.add( Base );
	return Base;
}

function Cylinder(x, y, z, radiusTop, height, openEnded, thetaStart, thetaLength, Color, scene, name){
	var geometry = new THREE.CylinderGeometry( radiusTop, radiusTop, height, 100, 1, openEnded, thetaStart, thetaLength );

	geometry.applyMatrix( new THREE.Matrix4().makeTranslation(x, y, z) );
	var material = new THREE.MeshBasicMaterial( { color: Color } );
	var Coin = new THREE.Mesh( geometry, material );
	Coin.castShadow = true;
	Coin.name = name;
	scene.add( Coin );
	return Coin;
}

function HollowCylinder(x, y, z, radiusTop, height, openEnded, thetaStart, thetaLength, Color, scene, name){
	var geometry = new THREE.CylinderGeometry( radiusTop, radiusTop, height, 100, 1, openEnded, thetaStart, thetaLength );
	geometry.rotateX(Math.PI/2);
	geometry.translate(x, y, z);
	var material = new THREE.LineBasicMaterial( { color: Color } );
	var Base = new THREE.Line( geometry, material );
	Base.name = name;
	scene.add( Base );
}

function NewLine(x1, y1, z1, x2, y2, z2, Color, scene, name){
	var material = new THREE.LineBasicMaterial({ color: Color });
	var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
    geometry.vertices.push(new THREE.Vector3(x2, y2, z2));
    var line = new THREE.Line(geometry, material);
    line.name = name;
    scene.add(line);
    return line;
}

function TextBar(text, x, y, z, size, h, Color, scene){
	var material = new THREE.MeshPhongMaterial({ color: Color });
	var geometry = new THREE.TextGeometry( text, { font: "helvetiker", size: size, height: h });
	var Text = new THREE.Mesh( geometry, material );
	Text.rotateX(Math.PI/2);
	Text.rotateZ(Math.PI);
	Text.translateX(x);
    Text.translateY(y);
    Text.translateZ(z);
	scene.add(Text);
	return Text;
}

function moveLeft(object, disp = -0.02){
	object.translateX(disp);
	if(object.position.x < -1.26)
		object.position.x = -1.26;
	return object;
}

function moveRight(object, disp = 0.02){
	object.translateX(disp);
	if(object.position.x > 1.3)
		object.position.x = 1.3;
	return object;
}

function main(){
	window.alert("You play white");
	canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});

	scene = new THREE.Scene();
  	spotLight= new THREE.SpotLight( 0xffffff );

  	// BOARD
  	var planeGeometry = new THREE.PlaneGeometry(5, 5);
	var planeMaterial = new THREE.MeshPhongMaterial( {
		ambient: 0x555555,
		color: 0xdddddd,
		specular: 0x009900,
		map: THREE.ImageUtils.loadTexture('board.jpg'),
		shininess: 30 
	});
	var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
	planeMesh.castShadow = true;
	planeMesh.receiveShadow = true;
	planeMaterial.map.wrapS = THREE.RepeatWrapping;
	planeMaterial.map.wrapT = THREE.RepeatWrapping;
	planeMaterial.map.repeat.set(200, 200);
	planeMesh.position.set(0.01,0.0095,0);
	planeMaterial.map.repeat.x = planeMaterial.map.repeat.y = 1;
	planeMesh.rotateX(Math.PI/2);
	scene.add(planeMesh);

	var pocket1 = Cylinder(2.16, 0.04, -2.09, 0.14, 0.08, false, 0, Math.PI/2, 0x00ff00, scene, "holetopleft");
	var pocket2 = Cylinder(2.14, 0.04, 2.12, 0.14, 0.08, false, 0, Math.PI/2, 0x00ff00, scene, "holebottomleft");
	var pocket3 = Cylinder(-2.07, 0.04, -2.09, 0.14, 0.08, false, 0, Math.PI/2, 0x00ff00, scene, "holetopright");
	var pocket4 = Cylinder(-2.08, 0.04, 2.11, 0.14, 0.08, false, 0, Math.PI/2, 0x00ff00, scene, "holebottomright");

	pockets.push(pocket1);
	pockets.push(pocket2);
	pockets.push(pocket3);
	pockets.push(pocket4);

	// RED AND WHITE AND QUEEN
	Queen = Cylinder(0.04, 0, -0.027+0.04, 0.10, 0.08, false, 0, Math.PI/2, 0xff0000, scene, 'queen');

	var whitePiece1 = Cylinder(0.45, 0, -0.027+0.04, 0.10, 0.08, false, 0, Math.PI/2, 0xf1f1f1, scene, 'wp');
	var whitePiece2 = Cylinder(-0.37, 0, -0.027+0.04, 0.10, 0.08, false, 0, Math.PI/2, 0xf1f1f1, scene, 'wp');
	var whitePiece3 = Cylinder(0.04, 0, -0.4, 0.10, 0.08, false, 0, Math.PI/2, 0xf1f1f1, scene, 'wp');
	var whitePiece4 = Cylinder(0.04, 0, 0.42, 0.10, 0.08, false, 0, Math.PI/2, 0xf1f1f1, scene, 'wp');


	var blackPiece1 = Cylinder(0.33, 0, -0.29, 0.10, 0.08, false, 0, Math.PI/2, 0x000000, scene, 'bp');
	var blackPiece2 = Cylinder(-0.26, 0, -0.29, 0.10, 0.08, false, 0, Math.PI/2, 0x000000, scene, 'bp');
	var blackPiece3 = Cylinder(-0.26, 0, 0.31, 0.10, 0.08, false, 0, Math.PI/2, 0x000000, scene, 'bp');
	var blackPiece4 = Cylinder(0.33, 0, 0.31, 0.10, 0.08, false, 0, Math.PI/2, 0x000000, scene, 'bp');

	// STRIKER
	Striker = Cylinder(0, 0, 1.43, 0.18, 0.08, false, 0, Math.PI/2, 0x1A74AF, scene, 'striker');

	moveables.push(Striker);
	moveables.push(Queen);
	moveables.push(blackPiece1);
	moveables.push(blackPiece2);
	moveables.push(blackPiece3);
	moveables.push(blackPiece4);

	moveables.push(whitePiece1);
	moveables.push(whitePiece2);
	moveables.push(whitePiece3);
	moveables.push(whitePiece4);

	for(var i = 0; i<moveables.length; i++){
		collisionVectors.push(new THREE.Vector3(0, 0, 0));
	}

	// INPUT
	window.onkeydown = function(event){
    	keyUpDown(event.keyCode, 0.1);
  	};
  	window.onkeyup = function(event){
    	keyUpDown(event.keyCode, 0);


    	switch(event.keyCode){

    		case 13:
	    		if(mode == 3)
	    			return;

	    		mode = (mode + 1) % 4;
	    		if(mode == 1){
					strikerLine = NewLine(Striker.geometry.vertices[0].x + Striker.position.x, Striker.position.y, Striker.geometry.vertices[0].z + Striker.position.z - Striker.geometry.radiusTop, 
						1.31, Striker.position.y, Striker.position.z - 4, 0x00ff00, scene, 'strikerline');
	    			calcStrikerLinePoint(Striker);

	    		}

	    		else if(mode == 0){
	    			strikerLine.visible = false;
	    		}

	    		else if(mode == 3){
	    			scene.remove(powerBarSlider);
	    			scene.remove(powerBar);

	    			moveVector = new THREE.Vector3(strikerLine.geometry.vertices[1].x - strikerLine.geometry.vertices[0].x,
	    				strikerLine.geometry.vertices[1].y - strikerLine.geometry.vertices[0].y,
	    				strikerLine.geometry.vertices[1].z - strikerLine.geometry.vertices[0].z
	    				)
					moveVector = moveVector.multiplyScalar(power, power, power);
					collisionVectors[0] = moveVector;
	    			update();
	    		}

	    		else if(mode == 2){
	    			var tempx = power/0.014285714;
	    			var tempx = 2.45 - tempx;
	    			powerBar = Cuboid(3, 0, 0, 0.35, 0.05, 4.9, 0x02ECC7, scene, "powerbar");
	    			powerBarSlider = Cuboid(3, 0, tempx, 0.4, 0.1, 0.1, 0xff0000, scene, "powerslider");
	    		}
	  			break;

    		case 49: //num 1
        		cammode = 1;  //Top View
        		break;
      		case 50: //num 2
        		cammode = 2;  //Player Cam
        		break;
        	case 51:
        		if(cammode == 3){
    				focus = (focus + 1) % 9;
    				if(focus == 0)
        					focus += 1;
        			while(moveables[focus].visible == false){
        				focus = (focus + 1) % 9;
        				if(focus == 0)
        					focus += 1;
        			}

        		}
        		cammode = 3;
        		break;
        }
  	};

  	var keyUpDown=function(keycode, sensibility) {
    	switch(keycode) {

      		

        	case 37:
        		if(mode == 0){
        			Striker = moveRight(Striker);
        		}
        		else if(mode == 1){
        			strikeAngle += 0.5;
        			if(strikeAngle > 180.0)
        				strikeAngle = 180.0;
        			calcStrikerLinePoint(Striker);

        		}
        		break;

        	case 39:
        		if(mode == 0){
        			Striker = moveLeft(Striker);
        		}
        		else if(mode == 1)
        		{
        			strikeAngle -= 0.5;
        			if(strikeAngle < 0.0)
        				strikeAngle = 0.0;
        			calcStrikerLinePoint(Striker);
        		}
        		break;

        	case 38:
        		if(mode == 2){
        			if(power < 0.07){
        				powerBarSlider.translateZ(-0.02);
        				power = (2.45 - powerBarSlider.position.z)*0.014285714;
        			}
        		}
        		break;

        	case 40:
        		if(mode == 2){
        			if(power > 0){
        				powerBarSlider.translateZ(0.02);
        				power = (2.45 - powerBarSlider.position.z)*0.014285714;
        			}
        		}
        		break;

    	} //end switch keycode
  	};	

  	var currentTime1, lastUpdateTime1 = Date.now();
  	var currentTime2, lastUpdateTime2 = Date.now();
  	var currentTime3, lastUpdateTime3 = Date.now();

	var render = function () {
		renderer.shadowMapEnabled = true;
		getCamera();
		scene.add(camera);

		getSpotlight();
		scene.add(spotLight);

		renderer.render(scene, camera);

		currentTime1 = Date.now();
		currentTime2 = Date.now();
		currentTime3 = Date.now();
		if(currentTime1 - lastUpdateTime1 > 10 && mode == 3){
			update();
			checkCollision();
			lastUpdateTime1 = currentTime1;
		}

		if(currentTime2 - lastUpdateTime2 > 30 && mode == 3){
			for(var i = 0; i < collisionVectors.length; i++){
				collisionVectors[i] = collisionVectors[i].multiplyScalar(0.99, 0.99, 0.99);
			}
			lastUpdateTime2 = currentTime2;
		}

		if(currentTime3 - lastUpdateTime3 > 5000){
			score -= 1;
			lastUpdateTime3 = currentTime3;

		}
		document.getElementById('score').innerHTML = "Score: " + score;
		requestAnimationFrame( render );
	};

	render();
}

function calcStrikerLinePoint(striker){

	strikerLine.geometry.vertices[1].x = striker.position.x - (rightBoardLine - leftBoardLine)*Math.cos(degToRad(strikeAngle));
	strikerLine.geometry.vertices[1].z = strikerLine.geometry.vertices[0].z - (topBoardLine - lowBoardLine)*Math.sin(degToRad(strikeAngle));

	strikerLine.geometry.verticesNeedUpdate = true;

}

function resetQueen(){
	Queen.position.set(0, 0, 0);
	Queen.visible = true;
}

function resetStriker(){
	scene.remove(strikerLine);
	Striker.position.set(0, 0, 0);
}

function checkCollision(){
	if(mode == 3){
		for(var i = 0; i<moveables.length - 1; i++){
			if(moveables[i].visible == false)
				continue;
			for(var j = 1; j<moveables.length; j++){

				if(moveables[j].visible == false)
					continue;

				if(i == j)
					continue;

				var a = new THREE.Vector3(moveables[i].geometry.vertices[0].x + moveables[i].position.x, 0, 
					moveables[i].geometry.vertices[0].z + moveables[i].position.z - moveables[i].geometry.radiusTop);
				var b = new THREE.Vector3(moveables[j].geometry.vertices[0].x + moveables[j].position.x, 0,
					moveables[j].geometry.vertices[0].z + moveables[j].position.z - moveables[j].geometry.radiusTop);

				var dist = distance(a, b);

				if(dist < moveables[i].geometry.radiusTop + moveables[j].geometry.radiusTop){

					var collision = a.sub(b);

					if(dist == 0){
						collision = new THREE.Vector3(1, 0, 0);
						dist = 1;
					}

					var s = 0.03;

					collision = collision.multiplyScalar(s, s, s);

					dist *= s;

					moveables[i].position.x += collision.x;
					moveables[i].position.y += collision.y;
					moveables[i].position.z += collision.z;

					moveables[j].position.x -= collision.x;
					moveables[j].position.y -= collision.y;
					moveables[j].position.z -= collision.z;

					collision = collision.multiplyScalar(1/(dist), 1/(dist), 1/(dist));

					var aci = collisionVectors[i].dot(collision);
					var bci = collisionVectors[j].dot(collision);

					var acf = (bci - aci);
					var bcf = (aci - bci);

					collisionVectors[i] = collisionVectors[i].add(collision.multiplyScalar(acf, acf, acf));
					collisionVectors[j] = collisionVectors[j].add(collision.multiplyScalar(bcf, bcf, bcf));

					var audio = new Audio('collide.wav');
					audio.play();

				}
			}
		}

		for(var i = 0; i<pockets.length; i++){
			for(var j = 1; j<moveables.length; j++){
				if(moveables[j].visible == false)
					continue;

				// console.log(pockets[0].position.z);

				var a = new THREE.Vector3(pockets[i].geometry.vertices[0].x + pockets[i].position.x, 0, 
					pockets[i].geometry.vertices[0].z + pockets[i].position.z - pockets[i].geometry.radiusTop);
				var b = new THREE.Vector3(moveables[j].geometry.vertices[0].x + moveables[j].position.x, 0,
					moveables[j].geometry.vertices[0].z + moveables[j].position.z - moveables[j].geometry.radiusTop);

				var dist = distance(a, b);
				if(dist + moveables[j].geometry.radiusTop < pockets[i].geometry.radiusTop + 0.1){
					moveables[j].visible = false;
					if(moveables[j].name == "wp"){
						if(queenpocket == true){
							queencover = true;
							score += 20;
						}
						score += 5;
					}
					else if(moveables[j].name == "queen"){
						queenpocket = true;
					}
					else
						score -= 20;

					var audio = new Audio('hole.wav');
					audio.play();
				}
			}
		}

		for(var i = 0; i<moveables.length; i++){
			if(moveables[i].visible == false)
				continue;
			var a = new THREE.Vector3(moveables[i].geometry.vertices[0].x + moveables[i].position.x, 0, 
				moveables[i].geometry.vertices[0].z + moveables[i].position.z - moveables[i].geometry.radiusTop);

			var radius = moveables[i].geometry.radiusTop;

			if(a.z - radius < -topBoardLine){
				if(collisionVectors[i].z < 0){
					if(i == 0){
						var audio = new Audio('swall.wav');
						audio.play();
					}
					else{
						var audio = new Audio('cwall.wav');
						audio.play();
					}
					collisionVectors[i].z = -collisionVectors[i].z;
				}
			}

			if(a.z + radius > -lowBoardLine){
				if(collisionVectors[i].z > 0){
					if(i == 0){
						var audio = new Audio('swall.wav');
						audio.play();
					}
					else{
						var audio = new Audio('cwall.wav');
						audio.play();
					}

					collisionVectors[i].z = -collisionVectors[i].z;
				}
			}

			if(a.x + radius > -leftBoardLine){
				if(collisionVectors[i].x > 0){
					if(i == 0){
						var audio = new Audio('swall.wav');
						audio.play();
					}
					else{
						var audio = new Audio('cwall.wav');
						audio.play();
					}

					collisionVectors[i].x = -collisionVectors[i].x;
				}
			}

			if(a.x - radius< -rightBoardLine){
				if(collisionVectors[i].x < 0){
					if(i == 0){
						var audio = new Audio('swall.wav');
						audio.play();
					}
					else{
						var audio = new Audio('cwall.wav');
						audio.play();
					}

					collisionVectors[i].x = -collisionVectors[i].x;
				}
			}
		}

	}
}

function update(){

	if(mode == 3){

		for(var i = 0; i < moveables.length; i++){
			moveables[i].position.x += collisionVectors[i].x;
			moveables[i].position.y += collisionVectors[i].y;
			moveables[i].position.z += collisionVectors[i].z;
		}


		for(var i = 0; i < moveables.length; i++){
			if(Math.abs(collisionVectors[i].x) > 0.001 || Math.abs(collisionVectors[i].y) > 0.001 || Math.abs(collisionVectors[i].z) > 0.001)
				return;
		}

		if(queencheck == true){
			if(queencover == false){
				resetQueen();
				queenpocket = false;
			}
			else{
				queencover = true;
				queenpocket = false;
			}
			queencheck = false;
		}

		if(queenpocket == true && queencover == false)
			queencheck = true;
		mode = (mode+1) % 4;
		resetStriker();
	}

}

function getCamera(){
  switch(cammode){
    case 1:
      varfov = 0;
      camX = 0; camY = -8; camZ = 0;
      lookX = 0; lookY = 0; lookZ = 0;
      lightX = 0; lightY = -205; lightZ = 525;
      break;
    case 2:
      varfov = 0;
      camX = 0; camY = -4; camZ = 7;
      lookX = 0; lookY = 0; lookZ = -1;
      lightX = 0; lightY = -205; lightZ = 525;
      break;
    case 3:
    	varfov = 70;
    	camX = moveables[focus].geometry.vertices[0].x + moveables[focus].position.x;
    	camY = moveables[focus].geometry.vertices[0].y - 0.5;
    	camZ = moveables[focus].geometry.vertices[0].z + moveables[focus].position.z;

    	lookX = Striker.geometry.vertices[0].x + Striker.position.x;
    	lookY = Striker.geometry.vertices[0].y-0.5;
    	lookZ = Striker.geometry.vertices[0].z + Striker.position.z;

   	  break;
  }

  //create the camera
  camera = new THREE.PerspectiveCamera(35 + varfov, window.innerWidth/window.innerHeight, 0.1, 100 );
  camera.position.set(camX, camY, camZ);

  if(cammode == 3)
  	camera.up.set(0, -1, 0);

  camera.lookAt(new THREE.Vector3(lookX, lookY, lookZ));
  if(cammode == 1)
  	camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI/2);
  if(cammode == 2)
  	camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);

}

function getSpotlight(){
  //the lights
  if (cammode == 1){
    spotLight.intensity = 3;
  }
  else if(cammode == 2){
    spotLight.intensity = 3;
  }
  spotLight.position.set( lightX, lightY, lightZ );
  spotLight.castShadow = true;
}

function degToRad(d){
	return d*Math.PI/180.0;
}

function distance(vec1, vec2){
	var x = (vec1.x - vec2.x) * (vec1.x - vec2.x);
	// var y = (vec1.y - vec2.y) * (vec1.y - vec2.y);
	var z = (vec1.z - vec2.z) * (vec1.z - vec2.z);

	return Math.sqrt(x + z);
}