import React, { useState } from 'react'
import { useTexture } from '@react-three/drei'
import { Grid } from './Grid'
import { useBox, usePlane } from '@react-three/cannon'

function Block({ material, ...props }) {
  const [ref] = useBox(() => ({
    args: [4.01, 4.01, 4.01, 4.01],
    type: 'static',
    ...props
  }))

  return (
    <mesh ref={ref} castShadow material={material}>
      <boxGeometry args={[4, 4, 4]} />
    </mesh>
  )
}
function Wall({ size = [1, 1, 1], material, position }) {
  return (
    <Grid width={size[0]} height={size[1]} depth={[size[2]]}>
      {(x, y, z) => (
        <Block
          key={[x, y, z].join('-')}
          position={[
            x * 4 + position[0],
            2 + y * 4 + position[1],
            z * 4 + position[2]
          ]}
          material={material}
        />
      )}
    </Grid>
  )
}

function Floor(props) {
  const [ref] = usePlane(() => ({
    type: 'Static',
    args: [100, 100],
    rotation: [-Math.PI / 2, 0, 0]
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial envMapIntensity={0.1} roughness={1} />
    </mesh>
  )
}

export default function Objects() {
  const map = useTexture(
    'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/purple/texture_01.png'
  )

  const [material, setMaterial] = useState()

  return (
    <>
      <meshStandardMaterial ref={setMaterial} envMapIntensity={0.1} map={map} />

      {true && (
        <group>
          {material && (
            <>
              <Wall size={[1, 1, 1]} position={[0, 0, 0]} material={material} />
              <Wall
                size={[4, 4, 1]}
                position={[0, 0, -3]}
                material={material}
              />
              <Wall
                size={[1, 3, 4]}
                position={[-12, 0, -3]}
                material={material}
              />
              {false && (
                <Wall
                  size={[1, 5, 4]}
                  position={[14, 0, 3]}
                  material={material}
                />
              )}
            </>
          )}
        </group>
      )}
      <Floor />
    </>
  )
}
