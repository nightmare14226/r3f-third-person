import * as THREE from 'three'
import { Vector2, Vector3 } from 'three'
import { makeCircleHelper, makeFullCircleHelper } from '../helpers'
import { getCameraForwardAndRight } from '../lib'

export default class PlayerRig {
  constructor(player, $camera) {
    this.$camera = $camera
    this.player = player
  }

  rb = null

  positionX = 0
  positionY = 0

  raycaster = new THREE.Raycaster()
  floorRaycaster = new THREE.Raycaster()

  set mode(v) {
    this._mode = v
    return v
  }

  move = (movementDirection, movementMagnitude, movementSpeed) => {
    this.player.current.api.velocity.set(
      movementDirection.x * 20,
      this.player.current.body.velocity[1],
      movementDirection.z * 20
    )
    // const addedMovement = movementDirection.multiplyScalar(
    //   (movementMagnitude / 100) * movementSpeed
    // )
    // const newPosition = this.player.current.position.clone().add(addedMovement)

    // const dir = new THREE.Vector3().subVectors(
    //   newPosition,
    //   this.player.current.position
    // )

    // this.raycaster.set(this.player.current.position, dir)

    // const hits = this.raycaster.intersectObjects(this.scene.children)

    // if (hits.length === 0) {
    //   this.player.current.position.copy(newPosition)
    // }
  }

  rotate = (quaternion) => {
    this.player.current.quaternion.copy(quaternion)
  }

  input = new THREE.Vector2()
  isJumping = false
  handleInput = () => {
    const h = this.input?.axes[0] || 0
    const v = this.input?.axes[1] || 0

    this.input.x = h
    this.input.y = v

    this.isJumping = this.input?.buttons?.[0].pressed
  }

  velocity = new THREE.Vector3()

  isGrounded = false
  checkGround() {
    this.floorRaycaster.set(
      this.player.current.position,
      new Vector3(0, -1, 0).normalize()
    )

    this.floorRaycaster.far = 1

    const hits = this.floorRaycaster.intersectObjects(this.scene.children)
    this.isGrounded = hits.length > 0
  }

  jumpTimeout = 0
  jumpMaxTimeout = 1
  handleJump() {
    if (this.isJumping) {
      this.player.current.api.velocity.set(
        this.player.current.body.velocity[0],
        10,
        this.player.current.body.velocity[2]
      )
    }
  }

  update = (delta, { movementSpeed }) => {
    this.handleInput()

    this.handleJump()

    const aiming = this.mode === 'aim'
    const rotationCamera = this.$camera.camera.current

    const { cameraForward, cameraRight } = getCameraForwardAndRight(
      rotationCamera.quaternion
    )

    this.cameraForward = cameraForward
    this.cameraRight = cameraRight

    const o = new THREE.Object3D()
    const movementDirection = new THREE.Vector3().addVectors(
      cameraForward.clone().multiplyScalar(-this.input.y),
      cameraRight.clone().multiplyScalar(this.input.x)
    )

    const moveMag = movementDirection.length()
    movementDirection.normalize()

    // if (aiming) {
    //   o.lookAt(cameraForward)
    //   this.player.current.quaternion.copy(o.quaternion)
    // } else {
    //   if (moveMag > 0.1) {
    //     o.lookAt(movementDirection)
    //     this.player.current.quaternion.slerp(o.quaternion, 0.2)
    //   }
    // }

    if (moveMag > 0.2) {
      this.move(movementDirection, moveMag, movementSpeed)
    }

    // this.updateGizmo()
  }

  updateGizmo = () => {
    if (!this.hasGizmo) {
      this.makeGizmo()
    }

    this.gizmo.group.visible = this._mode === 'debug'
    this.gizmo.camForward.position.copy(this.player.current.position).setY(1)
    this.gizmo.camForward.setDirection(this.cameraForward)

    this.gizmo.camRight.position.copy(this.player.current.position).setY(1)
    this.gizmo.camRight.setDirection(this.cameraRight)

    this.gizmo.floored.position
      .copy(this.player.current.position)
      .add(new THREE.Vector3(0, 0.1, 0))
    this.gizmo.floored.material.color.set(this.isGrounded ? 'green' : 'red')

    this.gizmo.floorRay.position.copy(this.player.current.position)
    this.gizmo.floorRay.setDirection(this.floorRaycaster.ray.direction)
    this.gizmo.floorRay.setLength(this.floorRaycaster.far)
  }

  makeGizmo = () => {
    this.gizmo = {}
    this.hasGizmo = true

    const g = new THREE.Group()
    this.scene.add(g)

    this.gizmo.group = g

    this.gizmo.camForward = new THREE.ArrowHelper(
      new Vector3(0, 0, 1),
      undefined,
      2,
      'red'
    )
    g.add(this.gizmo.camForward)

    this.gizmo.camRight = new THREE.ArrowHelper(
      new Vector3(0, 0, 1),
      undefined,
      2,
      'blue'
    )
    g.add(this.gizmo.camRight)

    this.gizmo.floored = makeFullCircleHelper('green')
    this.gizmo.floored.rotation.x = -Math.PI / 2
    this.gizmo.floored.position.y = 0.1

    g.add(this.gizmo.floored)

    this.gizmo.floorRay = new THREE.ArrowHelper()

    g.add(this.gizmo.floorRay)
  }

  cleanupGizmos = () => {
    this.scene.remove(this.gizmo.group)
  }
}
