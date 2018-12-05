import TrackballController from "../3d/controllers/TrackballController.js";
import Matrix4 from "../math/Matrix4.js";

import { Matrix4 as THREEMatrix4, Object3D } from "../../three/build/three.module.js";

export default class THREETrackballController extends TrackballController {
  constructor(object3D = new Object3D(), options) {
    object3D.updateMatrix();
    super(Object.assign({ matrix: new Matrix4(object3D.matrix.elements) }, options));
    this._matrix4 = new THREEMatrix4();
    this.object3D = object3D;

    const enabled = this.enabled;
    this.enabled = true;
    this.update();
    this.enabled = enabled;
  }

  update() {
    if (!this.object3D) {
      return;
    }
    this.matrix.x = this.object3D.position.x;
    this.matrix.y = this.object3D.position.y;
    this.matrix.z = this.object3D.position.z;
    super.update();
    this._matrix4.fromArray(this.matrix);
    this.object3D.matrix.identity();
    this.object3D.applyMatrix(this._matrix4);
  }
}
