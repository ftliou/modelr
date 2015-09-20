/*
	A factory which produces THREE.Object3D objects based on given data and material config.
*/

var createBuilding = function(data, materials) {
	
	var building = new THREE.Object3D();
    if (data.walls) {
    	var curStart = [0,0,0];
    	var height = [1,1];
        _.each(data.walls, function(wall, i) {
        	if (wall.path) {
        		if (wall.position) {
        			curStart[0] = wall.position[0];
        			curStart[1] = wall.position[1];
        			
        			if (wall.position.length >= 3) {
        				curStart[2] = wall.position[2];	
        			}
        		}
        		if (!wall.height) {
        			wall.height = height;
        		}
				building.add(createWall(curStart, wall, data.config, [materials.wallOuter, materials.wallInner], i));
        		curStart[0] += wall.path[0];
        		curStart[1] += wall.path[1];
        		height = wall.height;
			}
			else if (wall.paths) {
				building.add(createCustomWall(wall, data.config, [materials.wallOuter, materials.wallInner], i));
			}
        });
    }

    if (data.floors) {
        _.each(data.floors, function(floor, i) {
        	if (floor.path && floor.path.length > 0) {
        		var material;
        		if (floor.material) {
        			material = [materials[floor.material], materials[floor.material]];
        		}
        		else {
        			material = [materials.wallOuter, materials.wallInner];	
        		}
				building.add(createFloor(floor, data.config,  material, i));
			}
        });
    }


    if (data.stairs) {
        _.each(data.stairs, function(stairs, i) {
        	if (stairs.path && stairs.path.length === 4) {
				building.add(createStairs(
					stairs.position, 
					stairs.path[0],
					stairs.path[1],
					stairs.path[2],
					stairs.path[3],
					stairs.steps,
					stairs.height, 
					data.config.scale,
					[materials.stairs, materials.stairs], 
					i
				));
			}
        });
    }


    if (data.slopes) {
        _.each(data.slopes, function(slope, i) {
        	if (slope.direction) {
				building.add(createSlope(
					slope.position, 
					slope.direction,
					slope.width,
					data.config.scale,
					[materials.stairs, materials.stairs], 
					i
				));
			}
        });
    }



    building.name = "building";
    return building;
};


var createCustomWall = function(wall, config, materials, id) {

	config = _.extend({
		scale:1,
		thick: 2
	}, config);

	var mesh;
	var shape = new THREE.Shape();

	var position = new THREE.Vector3().fromArray(wall.position);
	
	var yRotation = (wall.rotate * Math.PI/180);

	_.each(wall.paths, function(edge, i) {
		if (i === 0) {
			shape.moveTo(0,0);
		}
		else {
			shape.lineTo(edge[0],edge[1]);
		}
	});

	punchHoles(shape, wall.windows);
	mesh = createMeshFromShape(shape, -config.thick, materials);
	addWindows(mesh, wall.windows);

	mesh.position.set(position.x*config.scale, position.z*config.scale, -position.y*config.scale);
	mesh.rotation.y = yRotation;

	mesh.scale.x = config.scale;
	mesh.scale.y = config.scale;
	mesh.scale.z = config.scale;
	mesh.name = id;
	mesh.type = "cwall";


	mesh.castShadow = true;
	mesh.receiveShadow = true;
	for ( var i in mesh.geometry.faces ) {

		var face = mesh.geometry.faces[ i ];
		if (face.normal.z < 0 && Math.abs(1+face.normal.z)<=0.0001) {
			face.materialIndex = 1;
		}
	}
	return mesh;
};

var createWall = function(pos, wall, config, materials, id) {

	config = _.extend({
		scale:1,
		thick: 2
	}, config);

	var mesh;
	var shape = new THREE.Shape();
	
	var vector = new THREE.Vector2().fromArray(wall.path);
	var height = !_.isArray(wall.height) ? [wall.height, wall.height] : wall.height;
	var distance = vector.length();
	var yRotation = (vector.y == 0 && vector.x < 0 ? Math.PI : Math.atan(vector.y/vector.x));

	shape.moveTo(0,0);
	shape.lineTo(distance, 0);
	shape.lineTo(distance, height[1]);
	shape.lineTo(0, height[0]);
	shape.lineTo(0, 0);

	punchHoles(shape, wall.windows);
	mesh = createMeshFromShape(shape, -config.thick, materials);
	addWindows(mesh, wall.windows);

	mesh.position.set(pos[0]*config.scale, pos[2]*config.scale, -pos[1]*config.scale);
	mesh.rotation.y = yRotation;

	mesh.scale.x = config.scale;
	mesh.scale.y = config.scale;
	mesh.scale.z = config.scale;
	mesh.name = id;
	mesh.type = "wall";

	mesh.castShadow = true;
	mesh.receiveShadow = true;
	for ( var i in mesh.geometry.faces ) {

		var face = mesh.geometry.faces[ i ];
		if (face.normal.z < 0 && Math.abs(1+face.normal.z)<=0.0001) {
			face.materialIndex = 1;
		}
	}
	return mesh;
};

var punchHoles = function(shape, holesCfg) {
	var frameWidth = 0.02;
	if (holesCfg) {
		_.each(holesCfg, function(holeCfg, i) {

			if (!_.isArray(holeCfg.width)) {
				holeCfg.width = [holeCfg.width];
			}
			if (!_.isArray(holeCfg.height)) {
				holeCfg.height = [holeCfg.height];	
			}

			var totalWidth = 0;
			_.each(holeCfg.width, function(width) {
				var w = width-(frameWidth*2);
				var totalHeight = 0;
				_.each(holeCfg.height, function(height) {
					var h = height-(frameWidth*2);

					var hole = new THREE.Path();
					var pos = [holeCfg.position[0]+totalWidth+frameWidth, holeCfg.position[1]+totalHeight+frameWidth];
					hole.moveTo(pos[0], pos[1]);
					hole.lineTo(pos[0]+w, pos[1]);
					hole.lineTo(pos[0]+w, pos[1]+h);
					hole.lineTo(pos[0], pos[1]+h);
					hole.lineTo(pos[0], pos[1]);
					
					shape.holes.push(hole);

					totalHeight += height;
				});

				totalWidth += width;
			});
		});
	}
};

var addWindows = function(mesh, windowsCfg) {

	if (windowsCfg) {
		_.each(windowsCfg, function(winCfg, i) {
			var pos = winCfg.position;
			var totalWidth = 0;
			_.each(winCfg.width, function(width, i) {
				var totalHeight = 0;
				_.each(winCfg.height, function(height, j) {
					var winGeometry = new THREE.BoxGeometry( width, height, 0.05 );
					var winMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff, transparent: true, opacity: winCfg.open?0.6:0.4} );
					var winMesh = new THREE.Mesh( winGeometry, winMaterial );
					winMesh.position.x = width/2+pos[0]+totalWidth;
					winMesh.position.y = height/2+pos[1]+totalHeight;
					totalHeight += height;
					mesh.add( winMesh );
					winMesh.renderDepth = 1;
				});
				totalWidth += width;
			});
		});
	}
};

var createMeshFromShape = function(shape, thickness, materials) {

	if (!thickness) {
		return new THREE.Mesh(
			shape.makeGeometry(), 
			new THREE.MeshBasicMaterial({ color: 0x6b4444 })
		);
	}
	else {
		return new THREE.Mesh(
			new THREE.ExtrudeGeometry( 
				shape, 
				{
					amount:thickness,
					bevelThickness: thickness,
					bevelSize: thickness,
					bevelSegments: 1,
					bevelEnabled: false,
					curveSegments: 12, 
					steps: 1,
					extrudeMaterial:0
				}
			), 
			new THREE.MeshFaceMaterial(materials)
		);
	}
};

var createSlope = function(position, direction, width, scale, material, id) {

	scale = scale || 1;

	var shape = new THREE.Shape();

	shape.moveTo(0, 0);
	shape.lineTo(-direction[0], 0);
	shape.lineTo(0, direction[1]);	
	shape.lineTo(0,0);	

	var mesh = createMeshFromShape(shape, width, material);

	if (position) {
		mesh.position.x = (position[0]+direction[0])*scale;
		mesh.position.z = (position[1]-width)*scale;
		if (position.length > 2) {
			mesh.position.y = position[2]*scale;
		}
	}

	mesh.scale.x = scale;
	mesh.scale.y = scale;
	mesh.scale.z = scale;
	//mesh.rotation.x = -Math.PI/2;
	mesh.type = "slope";
	mesh.name = id;
	return mesh;
};

var createStairs = function(position, bottomLeft, bottomRight, topRight, topLeft, num, stepHeight, scale, material, id) {
	var result = new THREE.Mesh();
	var i;
	
	num = num || 1;
	stepHeight = stepHeight || 0.25;
	scale = scale || 1;

	var lowVector = new THREE.Vector2(bottomRight[0]-bottomLeft[0], bottomRight[1]-bottomLeft[1]);
	var rightVector = new THREE.Vector2(topRight[0]-bottomRight[0], topRight[1]-bottomRight[1]);
	var leftVector = new THREE.Vector2(topLeft[0]-bottomLeft[0], topLeft[1]-bottomLeft[1]);

	var curHeight = stepHeight;
	var from = [bottomLeft, bottomRight];
		
	for (i=1; i<=num; i++) {
		var shape = new THREE.Shape();
		var to = [
			[bottomLeft[0]+(leftVector.x*i/num), bottomLeft[1]+(leftVector.y*i/num)],
			[bottomRight[0]+(rightVector.x*i/num), bottomRight[1]+(rightVector.y*i/num)]
		];
		shape.moveTo(from[0][0], from[0][1]);
		shape.lineTo(from[1][0], from[1][1]);
		shape.lineTo(to[1][0], to[1][1]);	
		shape.lineTo(to[0][0], to[0][1]);	
		shape.lineTo(from[0][0], from[0][1]);

		var mesh = createMeshFromShape(shape, curHeight, material);
		result.add(mesh);
		from = to;
		curHeight += stepHeight;
	}

	if (position) {
		result.position.x = position[0]*scale;
		result.position.z = position[1]*scale;
		if (position.length > 2) {
			result.position.y = position[2]*scale;
		}
	}


	result.scale.x = scale;
	result.scale.y = scale;
	result.scale.z = scale;
	result.rotation.x = -Math.PI/2;
	result.type = "stairs";
	result.name = id;
	return result;
};


var createFloor = function(floor, config, materials, id) {

	config = _.extend({
		scale:1,
		thick: 2
	}, config);

	var mesh;
	var shape = new THREE.Shape();

	if (!floor.tilt) {
		floor.tilt = [1,0];
	}

	var from = new THREE.Vector2().fromArray(floor.path[0]);
	var angle = Math.atan(floor.tilt[1]/floor.tilt[0]);
	var tiltDir = floor.tiltDir || 1;
	var factor = Math.cos(angle);
	
	_.each(floor.path, function(edge, i) {
		if (i == 0) {
			shape.moveTo((edge[0]-from.x)/factor,(edge[1]-from.y));
		}
		else {
			shape.lineTo((edge[0]-from.x)/factor,(edge[1]-from.y));
		}
	});
		
	punchHoles(shape, floor.windows);
	mesh = createMeshFromShape(shape, floor.thick||config.thick, materials);
	addWindows(mesh, floor.windows);

	mesh.scale.x = config.scale;
	mesh.scale.y = config.scale;
	mesh.scale.z = config.scale;

	mesh.position.x = from.x*config.scale;
	mesh.position.y = (floor.elevate||0)*config.scale;
	mesh.position.z = -from.y*config.scale;
	mesh.rotation.x = -Math.PI/2-(tiltDir===2?angle:0);
	if (tiltDir === 1) {
		mesh.rotation.y = -angle;
	}

	mesh.name = id;
	mesh.type = "floor";


	mesh.castShadow = true;
	mesh.receiveShadow = true;
	for ( var i in mesh.geometry.faces ) {

		var face = mesh.geometry.faces[ i ];
		if (face.normal.z < 0 && Math.abs(1+face.normal.z)<=0.0001) {
			face.materialIndex = 1;
		}
	}

	return mesh;
};

module.exports = {
	createBuilding: createBuilding,
	createWall: createWall,
	createCustomWall: createCustomWall,
	createFloor: createFloor,
	createStairs: createStairs
};
