import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

import {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
  handleSession,
  shutdownXR,
} from './utils/xr.js'

import SoundAnalyse from './SoundAnalyse'
import ParticleMaterial from './ParticleMaterial'
import SphereMaterial from './SphereMaterial'

class Experience {
  constructor(options) {
    this.container = options.container
    this.sketch = options.sketch

    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()

    this.isReady = true

    this.lastElapsedTime = 0
    this.deltaTime = 0
    this.frameCount = 0

    this.endSessionBtn = document.querySelector('.xr-end-session-btn')

    SoundAnalyse.init(this.sketch)

    this.start()
  }

  init() {
    this.bind()

    this.setSizes()
    this.setCamera()
    this.setRenderer()
    this.setSphere()
    this.setParticleSystem()
    this.setARButton()

    this.update()
  }

  bind() {
    this.onShutdown = this.onShutdown.bind(this)
    this.onSessionEnd = this.onSessionEnd.bind(this)
    this.onSessionStart = this.onSessionStart.bind(this)
  }

  //////////////////////////////////////////////////////////////////////////////

  onSessionEnd() {
    this.renderer.clear()
    SoundAnalyse.stop()
    console.log('👋', 'Session ended')
  }

  onShutdown() {
    shutdownXR(this.renderer)
  }

  onSessionStart() {
    this.endSessionBtn?.addEventListener('click', this.onShutdown)
  }

  //////////////////////////////////////////////////////////////////////////////

  setSizes() {
    this.sizes = {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight || window.innerHeight,
    }
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    )
    this.camera.position.z = 5
    this.scene.add(this.camera)
  }

  setAudioController() {
    this.audioController = new SoundReactor()
  }

  setSphere() {
    this.sphereMaterial = new SphereMaterial()
    const geometry = new THREE.SphereBufferGeometry(1, 200, 200)
    this.sphere = new THREE.Mesh(geometry, this.sphereMaterial)
    this.sphere.position.z = -3
    this.sphere.scale.multiplyScalar(0.7)
    this.scene.add(this.sphere)
  }

  setParticleSystem() {
    this.particleMaterial = new ParticleMaterial()
    const particleGeometry = new THREE.BufferGeometry()
    const count = 2000
    const positionArray = new Float32Array(count * 3)
    const scaleArray = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
      positionArray[i * 3 + 1] = Math.random() * 2
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4
      scaleArray[i] = Math.random()
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positionArray, 3)
    )
    particleGeometry.setAttribute(
      'aScale',
      new THREE.BufferAttribute(scaleArray, 1)
    )

    this.particleSystem = new THREE.Points(
      particleGeometry,
      this.particleMaterial
    )
    this.scene.add(this.particleSystem)
  }

  setRenderer() {
    // Create a new WebGL renderer and set the size + pixel ratio.
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Enable XR functionality on the renderer.
    this.renderer.xr.enabled = true

    // Add it to the DOM.
    this.container.appendChild(this.renderer.domElement)
  }

  setARButton() {
    this.domARButton = ARButton.createButton(this.renderer, {
      requiredFeatures: ['dom-overlay'],
      domOverlay: {
        root: document.getElementById('p5'),
      },
    })

    this.domARButton.disabled = true
    this.domARButton.style.opacity = '0'

    // Create the AR button element, configure our XR session, and append it to the DOM.
    document.body.appendChild(this.domARButton)

    // Start audio
    this.domARButton.addEventListener('click', () => {
      SoundAnalyse.play()
    })
  }

  //////////////////////////////////////////////////////////////////////////////

  async start() {
    // Check if browser supports WebXR with "immersive-ar".
    const immersiveArSupported = await browserHasImmersiveArCompatibility()
    immersiveArSupported ? this.init() : displayUnsupportedBrowserMessage()
  }

  //////////////////////////////////////////////////////////////////////////////

  updateTime() {
    this.frameCount += 1
  }

  updateWebXR() {
    const callbacks = {
      onSessionEnd: () => this.onSessionEnd(),
      onSessionStart: () => this.onSessionStart(),
    }
    handleSession(this.renderer, callbacks)
  }

  updateParticleSystem(time) {
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = time
    }
  }

  updateSphere() {
    if (this.sphereMaterial) {
      this.sphereMaterial.uniforms.uTime.value = this.frameCount
      this.sphereMaterial.uniforms.uFrequency.value = SoundAnalyse.mapF
      this.sphereMaterial.uniforms.uAmplitude.value = SoundAnalyse.mapA
    } else {
      this.sphereMaterial.uniforms.uFrequency.value = 0
      this.sphereMaterial.uniforms.uAmplitude.value = 0
    }
  }

  update() {
    const renderLoop = (time, frame) => {
      if (!this.isReady) return

      if (this.renderer?.xr?.isPresenting) {
        if (frame) {
          this.updateTime()
          this.updateWebXR()
          this.updateSphere()
          this.updateParticleSystem(time)
        }
        this.renderer.render(this.scene, this.camera)
      }
    }

    this.renderer.setAnimationLoop(renderLoop)
  }
}

export default Experience
