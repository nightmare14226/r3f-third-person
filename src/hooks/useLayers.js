import * as THREE from 'three'

export default function useLayers(desiredLayers) {
  const layers = new THREE.Layers()
  layers.disableAll()
  for (let i = 0; i < desiredLayers.length; i++) {
    let layer = desiredLayers[i]
    layers.enable(layer)
  }

  return {
    layers
  }
}
