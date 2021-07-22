'use strict';

/* global scene */

const Materials = {};
// const Minimap = {};

Materials.sphere = new BABYLON.StandardMaterial("player", scene);
Materials.sphere.alpha = 0;
Materials.player = new BABYLON.PBRMaterial("playershow", scene);
Materials.player.albedoTexture = new BABYLON.Texture("textures/arrow.png", scene);
Materials.player.albedoTexture.hasAlpha = true;
Materials.player.roughness = 1.0;

Materials.viewport = new BABYLON.StandardMaterial("viewport", scene);
// Materials.viewport.roughness = 1;

Materials.minimapBorder = new BABYLON.StandardMaterial('ring', scene);
Materials.minimapBorder.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.7);
Materials.minimapBorder.checkReadyOnlyOnce = true;

Materials.ground = new BABYLON.PBRMaterial("groundMaterial", scene);
Materials.ground.albedoTexture = new BABYLON.Texture("textures/floor/color.jpg", scene);
Materials.ground.metallicTexture = new BABYLON.Texture("textures/floor/roughness.jpg", scene);
Materials.ground.useRoughnessFromMetallicTextureAlpha = true;
Materials.ground.bumpTexture = new BABYLON.Texture("textures/floor/normal.jpg", scene);
{
	const groundScale = 180;
	Materials.ground.albedoTexture.uScale = groundScale;
	Materials.ground.albedoTexture.vScale = groundScale;
	Materials.ground.bumpTexture.uScale = groundScale;
	Materials.ground.bumpTexture.vScale = groundScale;
}

/*
Minimap.ground = new BABYLON.PBRMaterial('miniGround', scene);
Minimap.ground.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8);
Minimap.ground.roughness = 1;
*/

Materials.box = new BABYLON.PBRMaterial("boxmat", scene);
Materials.box.roughness = 1;
Materials.box.albedoTexture = new BABYLON.Texture("textures/wall/color.jpg", scene);
Materials.box.metallicTexture = new BABYLON.Texture("textures/wall/roughness.jpg", scene);
Materials.box.useRoughnessFromMetallicTextureAlpha = true;
Materials.box.bumpTexture = new BABYLON.Texture("textures/wall/normal.jpg", scene);

Materials.baseSquare = new BABYLON.PBRMaterial("base", scene);
Materials.baseSquare.roughness = 1;
Materials.baseSquare.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);

Materials.crystal = new BABYLON.PBRMaterial("crystal", scene);
Materials.crystal.metallic = 0;
Materials.crystal.roughness = 0.5;
Materials.crystal.alpha = 0.5;
Materials.crystal.subSurface.isRefractionEnabled = true;
Materials.crystal.subSurface.refractionIntensity = 0.8;
Materials.crystal.emissiveColor = new BABYLON.Color3(...[3, 252, 132].map(col => col / 256));
Materials.crystal.backFaceCulling = false;
Materials.crystal.sheen.isEnabled = true;
Materials.crystal.sheen.intensity = 0.5;
Materials.startCrystal = Materials.crystal;
Materials.endCrystal = Materials.crystal.clone("endcrystalmat", scene);
Materials.endCrystal.emissiveColor = new BABYLON.Color3(...[245, 90, 66].map(col => col / 256));

Materials.mapCrystal = new BABYLON.PBRMaterial('mapcrystal', scene);
Materials.mapCrystal.roughness = 1.0;
Materials.startMap = Materials.mapCrystal.clone('startmap', scene);
Materials.startMap.emissiveColor = new BABYLON.Color3(...[3, 252, 32].map(col => col / 256));
Materials.endMap = Materials.mapCrystal.clone('endmap', scene);
Materials.endMap.emissiveColor = new BABYLON.Color3(...[245, 90, 66].map(col => col / 256));

Object.values(Materials).forEach(material => material.freeze());