import * as React from 'react'
import { useThree, useFrame } from '@react-three/fiber'

export function useHelper(object3D, proto, active, ...args) {
  const helper = React.useRef()

  const scene = useThree((state) => state.scene)
  React.useEffect(() => {
    if (proto && object3D.current) {
      helper.current = new proto(object3D.current, ...args)
      if (helper.current && active) {
        scene.add(helper.current)
      }

      if (!active) {
        scene.remove(helper.current)
      }
    }

    return () => {
      if (helper.current) {
        scene.remove(helper.current)
      }
    }
  }, [scene, active, proto, object3D, args])

  useFrame(() => {
    if (helper.current?.update) {
      helper.current.update()
    }
  })

  return helper
}
