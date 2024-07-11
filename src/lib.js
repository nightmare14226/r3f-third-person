import * as THREE from 'three'

const forward = new THREE.Vector3(0, 0, -1)
const forwardToRightEuler = new THREE.Euler(0, -Math.PI / 2, 0)

// TODO add tests
// expect dot product to be 0
// epxect cross product to be up
export function getCameraForwardAndRight(cameraQuaternion) {
  const cameraForward = forward
    .clone()
    .applyQuaternion(cameraQuaternion)
    .setY(0)
    .normalize()

  const cameraRight = cameraForward
    .clone()
    .applyEuler(forwardToRightEuler)
    .setY(0)
    .normalize()

  return { cameraForward, cameraRight }
}

export function round(x) {
  return Math.round(x * 100) / 100
}

export function sphericalToCartesian(r = 10, theta, phi) {
  const t = r * Math.cos(phi)
  const y = r * Math.sin(phi)

  const x = t * Math.cos(theta)
  const z = t * Math.sin(theta)

  return [x, y, z]
}
