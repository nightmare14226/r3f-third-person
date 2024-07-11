import * as THREE from 'three'
import { makeCircleHelper } from '../helpers'

export default class HeightRig {
  highRig = {
    height: 6,
    distance: 14
  }
  midRig = {
    height: 3,
    distance: 8
  }
  lowRig = {
    height: 0.1,
    distance: 2
  }

  suggestedDistance = this.midRig.distance

  update() {
    const h = this.camera.cameraHeight

    this.riggedDistance = this.midRig.distance

    this.updateGizmo()
  }

  withGizmo = false
  updateGizmo = () => {
    if (!this.withGizmo) return

    if (!this.hasGizmo) {
      this.makeGizmo()
      return
    }

    this.gizmo.group.visible = this._mode === 'debug'

    this.gizmo.interpolatedRig.position
      .copy(this.target.current.position)
      .setComponent(1, this.camera.cameraHeight)
    this.gizmo.interpolatedRig.scale.setScalar(this.riggedDistance)

    this.gizmo.highRig.position
      .copy(this.target.current.position)
      .setComponent(1, this.highRig.height)
    this.gizmo.highRig.scale.setScalar(this.highRig.distance)

    this.gizmo.midRig.position
      .copy(this.target.current.position)
      .setComponent(1, this.midRig.height)
    this.gizmo.midRig.scale.setScalar(this.midRig.distance)

    this.gizmo.lowRig.position
      .copy(this.target.current.position)
      .setComponent(1, this.lowRig.height)
    this.gizmo.lowRig.scale.setScalar(this.lowRig.distance)
  }

  set mode(v) {
    this._mode = v
    return v
  }

  makeGizmo() {
    this.hasGizmo = true
    this.gizmo = {}

    const g = new THREE.Group()
    this.scene.add(g)

    this.gizmo.group = g

    this.gizmo.interpolatedRig = makeCircleHelper('green')
    this.gizmo.interpolatedRig.rotation.x = Math.PI / 2
    g.add(this.gizmo.interpolatedRig)

    this.gizmo.highRig = makeCircleHelper()
    this.gizmo.highRig.rotation.x = Math.PI / 2
    g.add(this.gizmo.highRig)

    this.gizmo.midRig = makeCircleHelper()
    this.gizmo.midRig.rotation.x = Math.PI / 2
    g.add(this.gizmo.midRig)

    this.gizmo.lowRig = makeCircleHelper()
    this.gizmo.lowRig.rotation.x = Math.PI / 2
    g.add(this.gizmo.lowRig)
  }
}
