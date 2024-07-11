import './styles.css'

import React, {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { Canvas, extend, useFrame, useThree, _roots } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { Environment } from '@react-three/drei/core/Environment'
import { Leva, useControls } from 'leva'
import { Html, OrbitControls } from '@react-three/drei'

import CameraRig from './controllers/CameraRig'
import PlayerRig from './controllers/PlayerRig'
import { useGamepads } from 'react-gamepads'

import Objects from './components/Objects'

import ReactNipple from 'react-nipple'

// optional: include the stylesheet somewhere in your app
import 'react-nipple/lib/styles.css'
import InputController from './controllers/Input'

import * as meshline from 'meshline'
import Trail from './components/Trail'
import { Debug, Physics, useSphere } from '@react-three/cannon'
import mergeRefs from 'react-merge-refs'

import { Perf, usePerf } from 'r3f-perf'

extend(meshline)

function useGamepad() {
  const [gamepads, setGamepads] = useState({})
  useGamepads((gamepads) => setGamepads(gamepads))

  return gamepads[0]
}

const PerfHook = () => {
  const perf = usePerf()
  const gl = useThree((state) => state.gl)

  const [el] = useState(() => document.createElement('div'))
  const target = gl.domElement.parentNode

  useEffect(() => {
    target.appendChild(el)

    return () => {
      unmountComponentAtNode(el)
    }
  }, [])

  useLayoutEffect(() => {
    render(
      <div
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 10,
          padding: '1rem',
          pointerEvents: 'none'
        }}
        children={<pre>{JSON.stringify(perf.log, null, '  ')}</pre>}
      />,
      el
    )
  })

  return null
}

const inputController = new InputController()

const Player = forwardRef(function Player(props, forwardedRef) {
  const [ref, api] = useSphere(() => ({
    position: [0, 20, 0],
    mass: 1,
    fixedRotation: true
  }))

  useEffect(() => {
    forwardedRef.current = {
      api,
      body: { position: [0, 0, 0], velocity: [0, 0, 0] }
    }

    api.position.subscribe((p) => (forwardedRef.current.body.position = p))
    api.velocity.subscribe((v) => (forwardedRef.current.body.velocity = v))
  }, [])

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 2, 1]} />
      <meshPhysicalMaterial roughness={0.5} color="white" />
      <mesh position-z={0.2} position-y={1}>
        <meshPhysicalMaterial roughness={0.5} color="white" />
        <boxGeometry args={[1, 0.2, 1]} />
      </mesh>
    </mesh>
  )
})

function Scene({ mode }) {
  const scene = useThree((s) => s.scene)

  const player = useRef()
  const camera = useRef()

  const lookCamera = useRef()
  const aimCamera = useRef()

  const gamepad = useGamepad()
  inputController.add(gamepad)

  useFrame(() => {
    inputController.update()
  })

  const cameraRig = useMemo(() => new CameraRig(), [])
  const playerRig = useMemo(() => new PlayerRig(), [])

  cameraRig.camera = camera
  cameraRig.aimCamera = aimCamera
  cameraRig.lookCamera = lookCamera
  cameraRig.target = player

  playerRig.player = player
  playerRig.$camera = cameraRig

  playerRig.mode = cameraRig.mode = mode
  playerRig.scene = cameraRig.scene = scene
  playerRig.input = cameraRig.input = inputController

  const { movementSpeed } = useControls('movement', {
    movementSpeed: {
      min: 0,
      max: 100,
      value: 20
    }
  })

  const { cameraRotationSpeed } = useControls('camera', {
    cameraRotationSpeed: {
      value: 100,
      min: 0,
      max: 400,
      step: 0.1
    },
    aimOffset: {
      value: { x: 2, y: 2 },
      step: 0.1,
      min: { x: -10, y: -10 },
      max: { x: 10, y: -100 },
      onChange: (x) => {
        cameraRig.aimOffset.set(x.x, x.y)
      }
    },
    aimDistance: {
      value: 5,
      min: 0,
      max: 20,
      onChange: (v) => {
        cameraRig.aimDistance = v
      }
    }
  })

  useFrame((_, delta) => {
    playerRig.update(delta, { movementSpeed })
    cameraRig.update({ cameraRotationSpeed })
  })

  return (
    <>
      <Player ref={player} />

      <Trail player={player} />

      <PerspectiveCamera
        ref={aimCamera}
        near={0.1}
        far={300}
        fov={40}
        position={[0, 0, 0]}
      />
      <PerspectiveCamera
        ref={lookCamera}
        near={0.1}
        far={300}
        fov={40}
        position={[0, 0, 0]}
      />

      <PerspectiveCamera
        makeDefault={mode === 'play' || 'aim'}
        ref={camera}
        near={0.1}
        far={1000}
        position={[5, 5, 5]}
      />
    </>
  )
}

function DebugMode({ mode }) {
  const [camera, setCamera] = useState()

  return (
    <>
      <PerspectiveCamera
        position={[15, 15, 15]}
        makeDefault={mode === 'debug'}
        ref={setCamera}
      />
      {camera && <OrbitControls enabled={mode === 'debug'} camera={camera} />}
    </>
  )
}

function MyEditor() {
  const [mode, setMode] = useState('debug')

  const gamepad = useGamepad()

  useEffect(() => {
    if (gamepad?.buttons[2].pressed) {
      setMode('play')
    } else if (gamepad?.buttons[1].pressed) {
      setMode('debug')
    } else if (mode !== 'debug') {
      setMode(gamepad?.buttons[6].pressed ? 'aim' : 'play')
    }
  }, [mode, setMode, gamepad])

  return (
    <>
      <pointLight castShadow intensity={0.5} position={[-3, 4, 3]} />
      <pointLight castShadow intensity={0.3} position={[3, 4, -3]} />

      <Objects />
      <Scene mode={mode} />

      <DebugMode mode={mode} />
    </>
  )
}

function App() {
  const x = useCallback(
    (n) => (e, data) => {
      if (!data) {
        inputController.setAxis(n, 0)
        inputController.setAxis(n + 1, 0)
        return
      }
      const angle = data.angle.radian
      const distance = data.distance / 50

      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      inputController.setAxis(n, x)
      inputController.setAxis(n + 1, -y)
    },
    []
  )

  return (
    <>
      <Canvas shadows dpr={2}>
        <color args={['#080406']} attach="background" />

        <Physics gravity={[0, -9.8 * 4, 0]}>
          <Debug>
            <Suspense fallback={null}>
              <Environment preset="dawn" />

              <MyEditor />
            </Suspense>
          </Debug>
        </Physics>

        <Perf headless />
        <PerfHook />
      </Canvas>
      <Leva hidden />
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between'
        }}>
        <ReactNipple
          style={{
            outline: '1px dashed red',
            width: '30vw',
            height: '30vw'
            // if you pass position: 'relative', you don't need to import the stylesheet
          }}
          onMove={x(0)}
          onEnd={() => x(0)(null)}
          onPlain={() => console.log('plain')}
          onDir={() => console.log('dir')}
        />

        <ReactNipple
          style={{
            outline: '1px dashed red',
            width: '30vw',
            height: '30vw'
            // if you pass position: 'relative', you don't need to import the stylesheet
          }}
          onMove={x(2)}
          onEnd={() => x(2)(null)}
        />
      </div>
    </>
  )
}

render(<App />, document.getElementById('root'))

export default App
