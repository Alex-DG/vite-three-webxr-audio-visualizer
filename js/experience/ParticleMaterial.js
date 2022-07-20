import { ShaderMaterial, AdditiveBlending } from 'three'

import vertexShader from './shaders/particle/vertex.glsl'
import fragmentShader from './shaders/particle/fragment.glsl'

class ParticleMaterial extends ShaderMaterial {
  constructor() {
    super({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 50 },
      },
      vertexShader,
      fragmentShader,
    })
  }
}

export default ParticleMaterial
