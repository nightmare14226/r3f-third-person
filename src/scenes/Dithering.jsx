import { OrbitControls, shaderMaterial, useTexture } from '@react-three/drei'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import { Suspense, useRef } from 'react'
import ReactDOM from 'react-dom'
import { RepeatWrapping, Vector2 } from 'three'
import '../styles.css'

const MyMaterial = shaderMaterial(
  {
    u_time: 0,
    u_dithering: 0,
    u_dithering_map: null,
    u_screen: new Vector2(0, 0),
    u_texture_size: new Vector2(0, 0)
  },
  /* glsl */ `
varying vec2 vUv;

varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec3 vNormal;


void main()	{
    vUv = uv;

    vPositionW = vec3( vec4( position, 1.0 ) * modelMatrix);
    vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
    vNormal = normal.rgb;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
}`,
  /* glsl */ `
varying vec2 vUv;
uniform vec2 u_screen;
uniform float u_dithering;
uniform sampler2D u_dithering_map;
uniform vec2 u_texture_size;

varying vec3 vPositionW;
varying vec3 vNormal;
varying vec3 vNormalW;

uniform float u_time;

float getDither() {
  vec2 screenPos = gl_FragCoord.xy / gl_FragCoord.w;
  vec2 ditherCoordinate = screenPos * u_screen.xy;
  float ditherValue = texture2D(u_dithering_map, ditherCoordinate).r;
  return ditherValue;
}


void main() {
  float val = gl_FragCoord.x / u_screen.x;

  vec2 ditherCoordinate = gl_FragCoord.xy/u_screen.xy;

  vec2 x = vec2(1./(u_screen.xy) * vec2(u_texture_size));
  ditherCoordinate = fract(ditherCoordinate/x);
  
  float ditherValue = texture2D(u_dithering_map, ditherCoordinate).r;
 
  // get screen position [0, 1]
  vec2 screenPos = (gl_FragCoord.xy/u_screen.xy);

  vec3 light = normalize(vec3(0., 0., 1.));
  float normLightDot = dot(vNormalW, light);
  float yy = step(ditherValue, normLightDot);

  // if (yy < 1.) discard;

  gl_FragColor = vec4(vec3(yy), 1.);


}
  `
)

extend({ MyMaterial })

function Scene() {
  const { texture, dithering } = useControls({
    texture: {
      value: '16x16',
      options: ['4x4', '8x8', '16x16', 'blueNoise']
    },
    dithering: {
      value: 0.4,
      min: 0,
      max: 1,
      step: 0.001
    }
  })

  const [bayer4, bayer8, bayer16, blueNoise] = useTexture([
    './BayerDither4x4.png',
    './BayerDither8x8.png',
    './BayerDither16x16.png',
    './BlueNoise470.png'
  ])

  bayer16.wrapT = bayer16.wrapS = blueNoise.wrapS = blueNoise.wrapT = bayer4.wrapS = bayer4.wrapT = bayer8.wrapS = bayer8.wrapt = RepeatWrapping

  const scale = useThree((state) => [
    state.viewport.width,
    state.viewport.height,
    1
  ])

  const data = {
    '4x4': { u_dithering_map: bayer4, u_texture_size: [4, 4] },
    '8x8': { u_dithering_map: bayer8, u_texture_size: [8, 8] },
    '16x16': { u_dithering_map: bayer16, u_texture_size: [16, 16] },

    blueNoise: { u_dithering_map: blueNoise, u_texture_size: [470, 470] }
  }

  const ref = useRef()

  useFrame(({ clock }, delta) => {
    ref.current.rotation.x = ref.current.rotation.y += delta
    ref.current.material.uniforms.u_time.value = clock.getElapsedTime()
  })

  return (
    <>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.4, 300, 300]} />
        <myMaterial
          u_dithering={dithering}
          {...data[texture]}
          u_time={0}
          u_screen={[
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio
          ]}
        />
      </mesh>
    </>
  )
}

export default function App() {
  return (
    <>
      <Canvas camera={{ near: 0.1, far: 100 }}>
        <color args={['#080406']} attach="background" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls />
      </Canvas>
      <Leva titleBar={false} />
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
