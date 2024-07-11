import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import useTrail from '../hooks/useTrail'

export default function Trail({ player }) {
  const trailPositions = useTrail(30, player)
  const trailRef = useRef()
  useFrame(() => {
    trailRef.current.setPoints(trailPositions, (i) => 1 - i)
  })

  return (
    <mesh position-y={1}>
      <meshLine ref={trailRef} attach="geometry" />
      <meshLineMaterial lineWidth={0.5} color="blue" />
    </mesh>
  )
}
