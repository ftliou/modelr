var EventEmitter = require('events').EventEmitter;
var fac = require('./model-factory');

var defaultCfg = {
	"thick":0.05,
	"scale":4,
	"materials":{
		"wallOuter":"#412516",
		"wallInner":{"color": "#b6a527","emissive": "#b6a527"} ,
		"ground":"#9b1e1e",
		"base":{"color": "#ff0000", "transparent": true, "opacity": 0.1},
		"stairs":"#9b1e1e",
		"window":{"color": "#ffffff", "transparent": true, "opacity": 0.6}
	}
};

var scene, camera, renderer;
var materialOuter, materialInner, materialGround, materialStairs;
var ambientLight, spotLight, dirLight;
var windowWidth, windowHeight;
var controls;
var projector;
var buildingData;

var Modelr = function() {
    var me = this;
    EventEmitter.call(this); // inherits from EventEmitter


    // Initialize controls
	var camControls = new function() {
		this.view = "default";
	};

	var materialControls = new function() {
		this.wireframe = false;
		this.outerColor = "#412516";
		this.innerColor = "#afa242";
		this.groundColor = "#ff0000";
		this.stairsColor = "#ff0000";
	};

	var spotControls = new function() {
		this.color = "#ffff00";
		this.intensity = 10;
		this.distance = 190;
        this.angle = 200;
        this.exponent = 215;
        this.castShadow = true;
		this.x = 100;
		this.y = 8;
		this.z = -15;
		this.visible = true;
	};

	var dirControls = new function() {
		this.color = "#ff5808";
        this.intensity = 0.5;
        this.castShadow = true;
		this.x = -40;
		this.y = 60;
		this.z = -10;
		this.visible = true;
	};

	var lightControls = new function() {
		this.ambientColor = "#404040";
	};

	// link controls with threejs scene changes
	var initCGui = function() {
		var gui = new dat.GUI({ autoPlace: false });

		$('#gui').append(gui.domElement);

		gui.add(camControls, "view", ["default","top","front","back","left","right"]).onChange(function(val) {
			lookAt(val);
		});

		var materialGui = gui.addFolder('material');
		materialGui.add(materialControls, "wireframe").onChange(function(val) {
			materialInner.wireframe = materialOuter.wireframe = val;
		});
		materialGui.addColor(materialControls, "outerColor").onChange(function(val) {
			materialOuter.color = new THREE.Color( val );
			materialOuter.needsUpdate = true;
		});

		materialGui.addColor(materialControls, "innerColor").onChange(function(val) {
			materialInner.color = new THREE.Color( val );
			materialInner.emissive = new THREE.Color( val );
			materialInner.needsUpdate = true;
		});

		materialGui.addColor(materialControls, "groundColor").onChange(function(val) {
			materialGround.color = new THREE.Color( val );
			//materialGround.emissive = new THREE.Color( val );
			materialGround.needsUpdate = true;
		});

		materialGui.addColor(materialControls, "stairsColor").onChange(function(val) {
			materialStairs.color = new THREE.Color( val );
			//materialStairs.emissive = new THREE.Color( val );
			materialStairs.needsUpdate = true;
		});

		var lightGui = gui.addFolder('light');

		lightGui.addColor(lightControls, 'ambientColor').onChange(function(val) {
			ambientLight.color = new THREE.Color( val );
		});

		var spotGui = lightGui.addFolder('Spot Light');

		spotGui.add(spotControls, 'visible').onChange(function(val) {
			spotLight.visible = val; 
		});
		spotGui.addColor(spotControls, 'color').onChange(function(val) {
			spotLight.color = new THREE.Color( val );
		});
		spotGui.add(spotControls, 'intensity', 0, 10).onChange(function(val) {
			spotLight.intensity = val;
		});
		spotGui.add(spotControls, 'distance', 0, 300).onChange(function(val) {
			spotLight.distance = val;
		});
		spotGui.add(spotControls, 'exponent', 0, 300).onChange(function(val) {
			spotLight.exponent = val;
		});
		spotGui.add(spotControls, 'angle', 0, 300).onChange(function(val) {
			spotLight.angle = val;
		});
		spotGui.add(spotControls, 'castShadow').onChange(function(val) {
			spotLight.castShadow = val;
		});
		spotGui.add(spotControls, 'x', -100, 100).onChange(function(val) {
			spotLight.position.x = val;
		});
		spotGui.add(spotControls, 'y', -100, 100).onChange(function(val) {
			spotLight.position.y = val;
		});
		spotGui.add(spotControls, 'z', -100, 100).onChange(function(val) {
			spotLight.position.z = val;
		});

		var dirGui = lightGui.addFolder('Directional Light');

		dirGui.add(dirControls, 'visible').onChange(function(val) {
			dirLight.visible = val; 
		});
		dirGui.addColor(dirControls, 'color').onChange(function(val) {
			dirLight.color = new THREE.Color( val );
		});
		dirGui.add(dirControls, 'intensity', 0, 5).onChange(function(val) {
			dirLight.intensity = val;
		});
		dirGui.add(dirControls, 'castShadow').onChange(function(val) {
			dirLight.castShadow = val;
		});
		dirGui.add(dirControls, 'x', -100, 100).onChange(function(val) {
			dirLight.position.x = val;
		});
		dirGui.add(dirControls, 'y', -100, 100).onChange(function(val) {
			dirLight.position.y = val;
		});
		dirGui.add(dirControls, 'z', -100, 100).onChange(function(val) {
			dirLight.position.z = val;
		});
	};
	
	var lookAt = function(type) {
		switch(type) {
			case 'top':
				updateCamera(new THREE.Vector3(20,70,-5), new THREE.Vector3(20,0,-5));
				break
			case 'front':
				updateCamera(new THREE.Vector3(50,15,45), new THREE.Vector3(50,15,0));
				break
			case 'back':
				updateCamera(new THREE.Vector3(50,15,-85), new THREE.Vector3(50,15,0));
				break
			case 'left':
				updateCamera(new THREE.Vector3(-50,15,-15), new THREE.Vector3(0,15,-15));
				break
			case 'right':
				updateCamera(new THREE.Vector3(150,15,-15), new THREE.Vector3(10,15,-15));
				break
			default:
				updateCamera(new THREE.Vector3(-5,60,55), new THREE.Vector3(30,20,0));
		};
	};

	var updateCamera = function(pos, look) {
		camera.up.set(0,1,0);
		camera.position.set(pos.x, pos.y, pos.z);
		controls.target = look;
	};

	var updateSize = function() {
		if ( windowWidth != window.innerWidth || windowHeight != window.innerHeight ) {
			windowWidth  = window.innerWidth;
			windowHeight = window.innerHeight;
			camera.aspect = windowWidth/windowHeight;
			camera.updateProjectionMatrix();
			renderer.setSize ( windowWidth, windowHeight );
		}
	};

	var render = function() {
		updateSize();
		requestAnimationFrame(render);
		if (controls) {
			controls.update();
		}
		renderer.render(scene, camera);
	};

	// return mesh attached to the building at given position.
	var getMeshAt = function(x, y) {
        var mesh = null;
		var vector = new THREE.Vector3( ( x / windowWidth ) * 2 - 1, - ( y / windowHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
		var intersects = ray.intersectObjects( scene.getObjectByName("building").children );

		if ( intersects.length > 0 && intersects[0].object instanceof THREE.Mesh ) {
			mesh = intersects[0].object;
		}
		return mesh;
	};

	var init = function () {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		projector = new THREE.Projector();
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 45, windowWidth/windowHeight, 0.1, 500 );
		renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
		renderer.setClearColor(0xcfc9b9/*0xafa242*/);
		renderer.setSize(windowWidth, windowHeight);


	    dirLight = new THREE.DirectionalLight(dirControls.color);
	    dirLight.position.set(dirControls.x, dirControls.y, dirControls.z);
	    dirLight.visible = dirControls.visible;
	    dirLight.intensity = dirControls.intensity;
	    dirLight.castShadow = dirControls.castShadow;
	    dirLight.shadowCameraNear = 2;
	    dirLight.shadowCameraFar = 200;
	    dirLight.shadowCameraLeft = -50;
	    dirLight.shadowCameraRight = 50;
	    dirLight.shadowCameraTop = 50;
	    dirLight.shadowCameraBottom = -50;
	    dirLight.shadowMapHeight = 1024;
	    dirLight.shadowMapWidth = 1024;

	    scene.add(dirLight);

		ambientLight = new THREE.AmbientLight( lightControls.ambientColor );
		scene.add(ambientLight);
		
		spotLight = new THREE.SpotLight( spotControls.color);
	    spotLight.position.set(spotControls.x, spotControls.y, spotControls.z);
	    spotLight.visible = spotControls.visible;
	    spotLight.intensity = spotControls.intensity;
	    spotLight.distance = spotControls.distance ;
	    spotLight.exponent = spotControls.exponent;
	    spotLight.angle = spotControls.angle;
	    spotLight.castShadow = spotControls.castShadow;
	    spotLight.shadowCameraNear = 2;
	    spotLight.shadowCameraFar = 200;
	    //spotLight.shadowCameraFov = -50;
	    spotLight.shadowMapHeight = 1024;
	    spotLight.shadowMapWidth = 1024;

		scene.add(spotLight);

		$('#canvas').append(renderer.domElement);
		
		controls = new THREE.TrackballControls( camera, renderer.domElement);
		lookAt();


		$( document ).click(function( event ){
            var clicked = buildingData && getMeshAt(event.clientX, event.clientY);
            var selectedPiece = "";
			
			if (clicked) {
				spotLight.target = clicked;
				selectedPiece = buildingData[{wall:"walls",cwall:"walls",floor:"floors",stairs:"stairs",slope:"slopes"}[clicked.type]][clicked.name];
				
				// piece selected, broadcast event to parent
				me.emit('piece', {type:clicked.type, data:selectedPiece});
			}
        });

		render();
		initCGui();
	};

	init();
};


// Loads building data and re-render scene
Modelr.prototype.load = function(data) {

	buildingData = _.merge({config: defaultCfg}, data);

	// TODO: Fix material inconsistency when switching between models
    var materialsCfg = buildingData.config.materials;
    var materials = {};
    _.each(materialsCfg, function(cfg, key) {
    	if (_.isString(cfg)) {
	        materials[key] = new THREE.MeshLambertMaterial({
	        	color: new THREE.Color( cfg )
	      	});
    	}
    	else {
        	materials[key] = new THREE.MeshLambertMaterial(cfg);
    	}
    });

    materialOuter = materials.wallOuter;
    materialInner = materials.wallInner;
    materialGround = materials.ground;
    materialStairs = materials.stairs;


    var exisitingGrid = scene.getObjectByName('grid');
    if (exisitingGrid) {
    	scene.remove(exisitingGrid);
    }
	var grid = new THREE.GridHelper( 100, buildingData.config.scale );	

	grid.position.x = 60;
	grid.position.z = -36;

	grid.setColors(0xaaaaaa, 0xaaaaaa);
	grid.visible = true;
	grid.name = "grid";
	scene.add( grid );


    var exisitingBuilding = scene.getObjectByName('building');
    if (exisitingBuilding) {
    	scene.remove(exisitingBuilding);
    }
    scene.add(fac.createBuilding(buildingData, materials));

};

_.extend(Modelr.prototype,EventEmitter.prototype);

module.exports = Modelr; 