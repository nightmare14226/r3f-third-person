import { PerspectiveCamera } from 'three'
import { getCameraForwardAndRight } from '../lib'

describe('lib', () => {
  describe('camera forward & right', () => {
    const c = new PerspectiveCamera()
    c.position.set(5, 5, 5)
    c.lookAt(0, 0, 0)

    c.updateMatrix()

    const { cameraForward, cameraRight } = getCameraForwardAndRight(
      c.quaternion
    )

    test('magnitudes are 1', () => {
      expect(cameraForward.length()).toEqual(1)
      expect(cameraRight.length()).toEqual(1)
    })

    test('dot product is 0', () => {
      const dot = cameraRight.dot(cameraForward)
      expect(dot).toBeLessThanOrEqual(Number.EPSILON)
    })

    test('cross product is up', () => {
      const cross = cameraRight.cross(cameraForward)
      expect(cross).toEqual({ x: 0, y: 1, z: 0 })
    })
  })
})
