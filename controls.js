'use strict';

/* global canvas, engine */

/* eslint-disable-next-line no-unused-vars */
function addCameraInputs (camera, style) {
	// valid styles are `rotate` and `translate` for the left/right arrow key behaviour
	if (!style) style = 'translate';
	camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
	camera.inputs.removeByType("FreeCameraMouseInput");

	class FreeCameraKeyboardWalkInput {
		constructor () {
			this._keys = [];
			this.keysUp = [38, 87];
			this.keysDown = [40, 83];
			this.keysLeft = [37, 65];
			this.keysRight = [39, 68];
			this.keysExit = [27];
		}
		attachControl (noPreventDefault) {
			let _this = this;
			let engine = this.camera.getEngine();
			camera.angularSpeed = 0.05;
			if (style === 'translate') {
				engine.enterPointerlock();
				canvas.addEventListener('click', () => engine.enterPointerlock());
			}
			let element = engine.getInputElement();
			if (!this._onKeyDown) {
				element.tabIndex = 1;
				this._onKeyDown = function (evt) {
					if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
						_this.keysDown.indexOf(evt.keyCode) !== -1 ||
						_this.keysLeft.indexOf(evt.keyCode) !== -1 ||
						_this.keysRight.indexOf(evt.keyCode) !== -1 ||
						_this.keysExit.indexOf(evt.keyCode) !== -1) {
						let index = _this._keys.indexOf(evt.keyCode);
						if (index === -1) {
							_this._keys.push(evt.keyCode);
						}
						if (!noPreventDefault) {
							evt.preventDefault();
						}
					}
				}
				this._onKeyUp = function (evt) {
					if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
						_this.keysDown.indexOf(evt.keyCode) !== -1 ||
						_this.keysLeft.indexOf(evt.keyCode) !== -1 ||
						_this.keysRight.indexOf(evt.keyCode) !== -1 ||
						_this.keysExit.indexOf(evt.keyCode) !== -1) {
						let index = _this._keys.indexOf(evt.keyCode);
						if (index >= 0) {
							_this._keys.splice(index, 1);
						}
						if (!noPreventDefault) {
							evt.preventDefault();
						}
					}
				}
				element.addEventListener("keydown", this._onKeyDown, false);
				element.addEventListener("keyup", this._onKeyUp, false);
			}
		}
		detachControl () {
			let engine = this.camera.getEngine();
			let element = engine.getInputElement();
			if (this._onKeyDown) {
				element.removeEventListener("keydown", this._onKeyDown);
				element.removeEventListener("keyup", this._onKeyUp);
				BABYLON.Tools.UnregisterTopRootEvents([
					{
						name: "blur",
						handler: this._onLostFocus
					}
				]);
				this._keys = [];
				this._onKeyDown = null;
				this._onKeyUp = null;
			}
		}
		checkInputs () {
			if (this._onKeyDown) {
				let camera = this.camera;
				for (let index = 0; index < this._keys.length; index++) {
					let keyCode = this._keys[index];
					let speed = camera.speed;
					if (this.keysExit.indexOf(keyCode) !== -1) {
						engine.exitPointerlock();
					}
					else if (this.keysLeft.indexOf(keyCode) !== -1) {
						switch (style) {
							case 'translate': {
								camera.direction.copyFromFloats(-speed, 0, 0);
								break;
							}
							case 'rotate': {
								camera.rotation.y -= camera.angularSpeed;
								camera.direction.copyFromFloats(0, 0, 0);
								break;
							}
						}
					}
					else if (this.keysUp.indexOf(keyCode) !== -1) {
						camera.direction.copyFromFloats(0, 0, speed);
					}
					else if (this.keysRight.indexOf(keyCode) !== -1) {
						switch (style) {
							case 'translate': {
								camera.direction.copyFromFloats(speed, 0, 0);
								break;
							}
							case 'rotate': {
								camera.rotation.y += camera.angularSpeed;
								camera.direction.copyFromFloats(0, 0, 0);
								break;
							}
						}
					}
					else if (this.keysDown.indexOf(keyCode) !== -1) {
						camera.direction.copyFromFloats(0, 0, -speed);
					}
					if (camera.getScene().useRightHandedSystem) {
						camera.direction.z *= -1;
					}
					camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
					BABYLON.Vector3.TransformNormalToRef(
						camera.direction,
						camera._cameraTransformMatrix,
						camera._transformedDirection
					);
					camera.cameraDirection.addInPlace(new BABYLON.Vector3(
						camera._transformedDirection.x,
						0,
						camera._transformedDirection.z
					));
				}
			}
		}
		_onLostFocus () {
			this._keys = [];
		}
		getClassName () {
			return "FreeCameraKeyboardWalkInput";
		}
		getSimpleName () {
			return "keyboard";
		}
	}

	camera.inputs.add(new FreeCameraKeyboardWalkInput());

	class FreeCameraSearchInput {
		constructor (touchEnabled) {
			if (touchEnabled === 0) touchEnabled = true;
			this.touchEnabled = touchEnabled;
			this.buttons = [0, 1, 2];
			this.angularSensibility = 2000.0;
			this.restrictionX = 100;
			this.restrictionY = 60;
		}
		attachControl (noPreventDefault) {
			let _this = this;
			let engine = this.camera.getEngine();
			let element = engine.getInputElement();
			let angle = { x: 0, y: 0 };
			if (!this._pointerInput) {
				this._pointerInput = function (p) {
					let evt = p.event;
					if (!_this.touchEnabled && evt.pointerType === "touch") {
						return;
					}
					if (p.type !== BABYLON.PointerEventTypes.POINTERMOVE && _this.buttons.indexOf(evt.button) === -1) {
						return;
					}
					if (p.type === BABYLON.PointerEventTypes.POINTERDOWN) {
						try {
							evt.srcElement.setPointerCapture(evt.pointerId);
						}
						catch (e) {
							// Nothing to do with the error. Execution will continue.
						}
						_this.previousPosition = {
							x: evt.clientX,
							y: evt.clientY
						}
						if (!noPreventDefault) {
							evt.preventDefault();
							element.focus();
						}
					} else if (p.type === BABYLON.PointerEventTypes.POINTERUP) {
						try {
							evt.srcElement.releasePointerCapture(evt.pointerId);
						}
						catch (e) {
							// Nothing to do with the error.
						}
						_this.previousPosition = null;
						if (!noPreventDefault) {
							evt.preventDefault();
						}
					} else if (p.type === BABYLON.PointerEventTypes.POINTERMOVE) {
						if (!_this.previousPosition || engine.isPointerLock) {
							return;
						}
						let offsetX = evt.clientX - _this.previousPosition.x;
						let offsetY = evt.clientY - _this.previousPosition.y;
						angle.x += offsetX;
						angle.y -= offsetY;
						if (Math.abs(angle.x) > _this.restrictionX) {
							angle.x -= offsetX;
						}
						if (Math.abs(angle.y) > _this.restrictionY) {
							angle.y += offsetY;
						}
						if (_this.camera.getScene().useRightHandedSystem) {
							if (Math.abs(angle.x) < _this.restrictionX) {
								_this.camera.cameraRotation.y -= offsetX / _this.angularSensibility;
							}
						} else {
							if (Math.abs(angle.x) < _this.restrictionX) {
								_this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
							}
						}
						if (Math.abs(angle.y) < _this.restrictionY) {
							_this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
						}
						_this.previousPosition = {
							x: evt.clientX,
							y: evt.clientY
						}
						if (!noPreventDefault) {
							evt.preventDefault();
						}
					}
				}
			}
			this._onSearchMove = function (evt) {
				if (!engine.isPointerLock) {
					return;
				}
				let offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
				let offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
				if (_this.camera.getScene().useRightHandedSystem) {
					_this.camera.cameraRotation.y -= offsetX / _this.angularSensibility;
				} else {
					_this.camera.cameraRotation.y += offsetX / _this.angularSensibility;
				}
				_this.camera.cameraRotation.x += offsetY / _this.angularSensibility;
				_this.previousPosition = null;
				if (!noPreventDefault) {
					evt.preventDefault();
				}
			}
			const observer = BABYLON.PointerEventTypes.POINTERDOWN |
				             BABYLON.PointerEventTypes.POINTERUP |
				             BABYLON.PointerEventTypes.POINTERMOVE;
			this._observer = this.camera.getScene().onPointerObservable.add(this._pointerInput, observer);
			element.addEventListener("mousemove", this._onSearchMove, false);
		}
		detachControl () {
			let engine = this.camera.getEngine();
			let element = engine.getInputElement();
			if (this._observer && element) {
				this.camera.getScene().onPointerObservable.remove(this._observer);
				element.removeEventListener("mousemove", this._onSearchMove);
				this._observer = null;
				this._onSearchMove = null;
				this.previousPosition = null;
			}
		}
		getClassName () {
			return "FreeCameraSearchInput";
		}
		getSimpleName () {
			return "MouseSearchCamera";
		}
	}

	camera.inputs.add(new FreeCameraSearchInput());
}