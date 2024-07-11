import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const shiftRight = (collection, steps = 1) => {
  collection.set(collection.subarray(0, -steps), steps)
  collection.fill(0, 0, steps)
  return collection
}

function v3distSqr(a, b) {
  const dx = a[0] - b[0],
    dy = a[1] - b[1],
    dz = a[2] - b[2]

  return dx * dx + dy * dy + dz * dz
}

export default function useTrail(n = 1, ref) {
  const arr = useMemo(() => Float32Array.from({ length: n * 3 }, () => 0), [n])

  useEffect(() => {
    ref.current.api.position.subscribe((pos) => {
      shiftRight(arr, 3)
      arr.set(pos)
    })
  }, [])

  return arr
}
