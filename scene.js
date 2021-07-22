'use strict';

/* global canvas, engine */

/* eslint-disable-next-line no-unused-vars */
function generateScene (mazeHeight, mazeWidth, scene) {
	const startTime = Date.now();

	scene.clearColor = new BABYLON.Color3(...[44, 156, 212].map(col => col / 256));
	scene.gravity = new BABYLON.Vector3(0, -0.09, 0);
	scene.collisionsEnabled = true;

	const light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	light.specular = new BABYLON.Color3(255 / 256, 253 / 256, 128 / 256);

	const camera = new BABYLON.UniversalCamera("MyCamera", new BABYLON.Vector3(1, 1, 1), scene);
	camera.minZ = 0.01;
	camera.attachControl(canvas, true);
	camera.speed = 0.01;
	camera.angle = -Math.PI / 2;
	camera.rotation.y = Math.PI / 2;
	camera.direction = new BABYLON.Vector3(Math.cos(camera.angle), 0, -Math.sin(camera.angle));
	camera.ellipsoid = new BABYLON.Vector3(0.40, 0.75, 0.40);
	camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.75, 0);
	camera.checkCollisions = true;
	camera.applyGravity = true;
	scene.activeCameras.push(camera);
	const playerSize = 0.4;
	const sphere = BABYLON.MeshBuilder.CreateSphere("dummyCamera", { diameter: playerSize * 2 }, scene);
	sphere.material = Materials.sphere;
	const innerBox = BABYLON.MeshBuilder.CreatePlane('playerBox', { size: 0.4 }, scene);
	innerBox.material = Materials.player;
	innerBox.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
	const player = BABYLON.Mesh.MergeMeshes([sphere, innerBox], true, false, null, false, true);
	player.layerMask = 0x2000000F;
	player.rotation.x = Math.PI / 2;
	player.parent = camera;

	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
	ground.material = Materials.ground;
	ground.layerMask = 0x2000000F;
	// ground.miniMaterial = Minimap.ground;
	ground.checkCollisions = true;
	ground.freezeWorldMatrix();

	const minicam = new BABYLON.FollowCamera('minicam', new BABYLON.Vector3(1, 6, 1), scene);
	minicam.lockedTarget = player;
	minicam.radius = 0;
	minicam.heightOffset = 6;
	minicam.rotationOffset = 0;
	minicam.layerMask = 0x20000000;

	/*
	const cameraWrapper = BABYLON.Mesh.CreateBox('wrap', 1, scene);
	cameraWrapper.position = camera.position;
	cameraWrapper.rotation = camera.rotation;
	const viewport = new BABYLON.Mesh.CreatePlane('viewportthingy', { size: 1 }, scene);
	viewport.position = new BABYLON.Vector3(2, 2, 6);
	viewport.parent = cameraWrapper;
	viewport.material = Materials.viewport;
	*/

	minicam.viewport = new BABYLON.Viewport(0.06, 0.6, 200 / canvas.width, 200 / canvas.height);
	const innerRadius = 1.08, outerRadius = 1.2;
	const miniRing = BABYLON.MeshBuilder.CreateLathe('ring', {
		shape: [
			new BABYLON.Vector3(innerRadius, 0, 0),
			new BABYLON.Vector3(outerRadius, 0, 0),
			new BABYLON.Vector3(outerRadius, 0.01, 0),
			new BABYLON.Vector3(innerRadius, 0.01, 0)
		],
		radius: innerRadius,
		tesselation: 50,
		sideOrientation: BABYLON.Mesh.SINGLESIDE
	}, scene);
	miniRing.convertToFlatShadedMesh();
	miniRing.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, 0);
	miniRing.position.z += 2.84;
	miniRing.material = Materials.minimapBorder;
	miniRing.parent = minicam;
	miniRing.layerMask = 0x20000000;
	minicam.detachControl(canvas);
	scene.activeCameras.push(minicam);

	const roundMinimap = new BABYLON.Layer('top', 'textures/minimask.png', scene, true);
	roundMinimap.layerMask = 0x20000000;
	roundMinimap.scale = new BABYLON.Vector2(4, 4);
	roundMinimap.alphaTest = true;
	roundMinimap.onBeforeRender = () => {
		engine.setColorWrite(false);
		if (scene.activeCamera === minicam) engine.setDepthBuffer(true);
	}
	roundMinimap.onAfterRender = () => {
		engine.setColorWrite(true);
	}

	/*
	const minimapRender = new BABYLON.RenderTargetTexture('minimap', 1024, scene);
	minimapRender.renderList.push(ground);
	scene.customRenderTargets.push(minimapRender);
	minimapRender.activeCamera = minicam;
	minimapRender.onBeforeRender = () => {
		minimapRender.renderList.forEach(mesh => {
			mesh._savedMaterial = mesh.material;
			mesh.material = mesh.miniMaterial;
		});
	}
	minimapRender.onAfterRender = () => {
		minimapRender.renderList.forEach(mesh => {
			mesh.material = mesh._savedMaterial;
		});
	}
	viewport.material.onBindObservable.add(() => {
		viewport.material.getEffect().setTexture('diffuseColor', minimapRender);
	});
	viewport.material.diffuseTexture = minimapRender;
	*/

	const box = new BABYLON.MeshBuilder.CreateTiledBox("wall", {
		tileSize: 1,
		alignVertical: BABYLON.Mesh.TOP,
		alignHorizontal: BABYLON.Mesh.LEFT,
		height: 0.8 + 2 * playerSize,
		depth: 1,
		width: 1
	}, scene);
	box.material = Materials.box;
	box.checkCollisions = true;
	const baseSquare = new BABYLON.MeshBuilder.CreatePlane('base', { size: 1, sideOrientation: BABYLON.Mesh.SINGLESIDE }, scene);
	baseSquare.material = Materials.baseSquare;
	baseSquare.layerMask = 0x20000000;
	baseSquare.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

	const boxes = [];
	const bases = [];
	const maze = new Maze({ height: mazeHeight, width: mazeWidth });
	maze.maze.forEach((row, x) => {
		row.forEach((flag, y) => {
			if (!flag) return;
			let newBox = box.clone(`wall${x}-${y}`);
			boxes.push(newBox);
			newBox.position = new BABYLON.Vector3(x, 0.25 + playerSize, y);
			let newBase = baseSquare.clone(`base${x}-${y}`);
			bases.push(newBase);
			newBase.position = new BABYLON.Vector3(x, 0.01, y);
			// newBox.doNotSyncBoundingInfo = true;
			newBox.freezeWorldMatrix();
			// newBase.doNotSyncBoundingInfo = true;
			newBase.freezeWorldMatrix();
		});
	});

	const startCrystal = BABYLON.MeshBuilder.CreatePolyhedron("startcrystal", {
		type: 12,
		size: 0.15
	}), endCrystal = BABYLON.MeshBuilder.CreatePolyhedron("endcrystal", {
		type: 12,
		size: 0.15
	});
	startCrystal.checkCollisions = false;
	endCrystal.checkCollisions = false;
	startCrystal.material = Materials.startCrystal;
	endCrystal.material = Materials.endCrystal;
	const glow = new BABYLON.GlowLayer("glow", scene);
	glow.addIncludedOnlyMesh(startCrystal);
	glow.addIncludedOnlyMesh(endCrystal);

	const startMap = BABYLON.MeshBuilder.CreateDisc('startdisc', { radius: 0.2 }, scene),
	        endMap = BABYLON.MeshBuilder.CreateDisc('enddisc', { radius: 0.2 }, scene);
	startMap.material = Materials.startMap;
	endMap.material = Materials.endMap;
	startMap.layerMask = 0x20000000;
	endMap.layerMask = 0x20000000;

	startCrystal.position = new BABYLON.Vector3(1, 0.6, 1);
	startCrystal.rotation = new BABYLON.Vector3(0, 0, -0.32);
	endCrystal.position = new BABYLON.Vector3(2 * mazeHeight - 1, 0.6, 2 * mazeWidth - 1);
	endCrystal.rotation = new BABYLON.Vector3(0, 0, -0.32);
	startMap.position = new BABYLON.Vector3(1, 0.01, 1);
	startMap.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
	endMap.position = new BABYLON.Vector3(2 * mazeHeight - 1, 0.01, 2 * mazeWidth - 1);
	endMap.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

	scene.registerBeforeRender(() => {
		startCrystal.rotation.y += 0.03;
		endCrystal.rotation.y += 0.03;
		// End logic - incomplete
		// if (sphere.intersectsPoint(new BABYLON.Vector3(2 * mazeHeight - 1, 0.75, 2 * mazeWidth - 1))) {
		if (!scene.finished && player.intersectsMesh(endCrystal, true)) {
			// Player reached the end
			console.log(Date.now() - startTime);
			scene.finished = true;
		}
	});

	return scene;
}