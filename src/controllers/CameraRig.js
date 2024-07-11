import * as THREE from 'three'
import { CameraHelper, EllipseCurve, Vector3 } from 'three'

import { makePosHelper } from '../helpers'
import { round, sphericalToCartesian } from '../lib'

export default class CameraRig {
  constructor() {
    this.raycaster.layers.disableAll()
    this.raycaster.layers.enable(1)
    this.raycaster.layers.enable(2)
  }

  set mode(v) {
    this._mode = v
  }

  raycaster = new THREE.Raycaster()

  offset = new THREE.Vector3(0, 2, 0)

  maxDistance = 8

  cameraCoords = { theta: 0, phi: Math.PI * 0.2 }

  minCameraHeight = 0.1
  maxCameraHeight = 20

  _lookAtTarget = new THREE.Vector3()

  impactPosition = new THREE.Vector3()
  idealPosition = new THREE.Vector3()

  lookDir = new THREE.Vector3()

  cameraRotationSpeed = 100
  cameraRotationSpeedWhileAiming = 50

  cameraForward = new THREE.Vector3()
  cameraRight = new THREE.Vector3()

  handleInput = () => {
    const lh = round(this.input?.axes[2], 2) || 0
    const lv = round(this.input?.axes[3], 2) || 0

    const speed =
      this.mode === 'aim'
        ? this.cameraRotationSpeedWhileAiming
        : this.cameraRotationSpeed

    this.cameraCoords.theta += lh * 0.001 * speed
    this.cameraCoords.phi -= lv * 0.001 * speed

    this.cameraCoords.phi = THREE.MathUtils.clamp(
      this.cameraCoords.phi,
      -Math.PI * 0.4,
      Math.PI * 0.4
    )

    this.lookDir
      .set(
        ...sphericalToCartesian(
          1,
          this.cameraCoords.theta,
          this.cameraCoords.phi
        )
      )
      .normalize()
      .multiplyScalar(this.maxDistance)
  }

  _raycastDir = new THREE.Vector3()

  aimOffset = new THREE.Vector2(2, 5)
  aimDistance = 5

  updateAimCamera = () => {
    const target = this.target.current
    const aimCamera = this.aimCamera.current

    aimCamera.position
      .copy(target.position)
      .sub(this._raycastDir.clone().multiplyScalar(-1 * this.aimDistance))

    const cameraForward = new THREE.Vector3(0, 0, -1)
    cameraForward.applyQuaternion(aimCamera.quaternion).normalize()

    const cameraRight = cameraForward
      .clone()
      .applyEuler(new THREE.Euler(0, -Math.PI / 2, 0))
      .normalize()

    cameraForward.y = 0
    cameraRight.y = 0

    aimCamera.position.add(cameraRight.setLength(this.aimOffset.x))

    aimCamera.position.y = target.position.y + this.aimOffset.y

    const aimTarget = this.idealPosition.clone()
    aimTarget.add(this._raycastDir.clone().multiplyScalar(-40))

    aimCamera.lookAt(aimTarget)
  }

  update = () => {
    return false
    const camera = this.camera.current
    const target = this.target.current
    const raycaster = this.raycaster
    const idealPosition = this.idealPosition
    const impactPosition = this.impactPosition

    this.handleInput()

    this.idealPosition.copy(this.lookDir).add(target.position)

    const position = new THREE.Vector3()
    // target.position.copy(position)
    this._lookAtTarget.lerp(position.add(this.offset), 0.4)

    // raycast
    this._raycastDir.subVectors(idealPosition, this._lookAtTarget)

    const idealDistance = this._raycastDir.length()

    this._raycastDir.normalize()
    raycaster.set(this._lookAtTarget, this._raycastDir)
    const hits = raycaster.intersectObjects(this.scene.children)

    if (hits[0] && hits[0].distance <= idealDistance) {
      const impactPoint = hits[0].point
      impactPosition.copy(impactPoint)
      camera.position.lerp(impactPosition, 0.1)
    } else {
      impactPosition.set(-Infinity, Infinity, Infinity)
      camera.position.lerp(idealPosition, 0.1)
    }

    camera.lookAt(this._lookAtTarget)

    // aimCamera stuff
    this.updateAimCamera()
    // /aimCamera stuff

    this.updateGizmo()
  }

  updateGizmo = () => {
    if (!this.hasGizmo) {
      this.makeGizmo()
    }

    this.gizmo.group.visible = this._mode === 'debug'

    this.gizmo.lookCamPos.position.copy(this.camera.current.position)
    this.gizmo.idealPosition.position.copy(this.idealPosition)
    this.gizmo.impactPosition.position.copy(this.impactPosition)
  }

  makeGizmo = () => {
    this.gizmo = {}
    this.hasGizmo = true

    const g = new THREE.Group()
    this.scene.add(g)

    this.gizmo.group = g

    this.gizmo.lookCamPos = makePosHelper()
    g.add(this.gizmo.lookCamPos)

    this.gizmo.impactPosition = makePosHelper(0.6, 'red')
    g.add(this.gizmo.impactPosition)

    this.gizmo.idealPosition = makePosHelper(0.6, '#333')
    g.add(this.gizmo.idealPosition)

    this.gizmo.lookCamera = new CameraHelper(this.camera.current)
    g.add(this.gizmo.lookCamera)
  }

  cleanupGizmos = () => {
    this.scene.remove(this.gizmo.group)
  }
}
