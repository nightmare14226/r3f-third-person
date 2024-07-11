import * as THREE from 'three'

export const makePosHelper = (size = 0.5, color = 'white') => {
  return new THREE.Mesh(
    new THREE.OctahedronGeometry(size),
    new THREE.MeshBasicMaterial({ color })
  )
}

export const makeCircleHelper = (color = 0xff0000, wireframe = true) => {
  const circle = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2)

  const ellipse = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circle.getPoints(50)),
    new THREE.LineBasicMaterial({ color: new THREE.Color(color) })
  )

  return ellipse
}

export const makeFullCircleHelper = (color = 0xff0000, wireframe = true) => {
  const circle = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2)

  const ellipse = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
  )

  return ellipse
}
