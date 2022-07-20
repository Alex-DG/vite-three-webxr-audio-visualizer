import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

import {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
} from './utils/xr'

import { settings } from './utils/settings'

import VisualizerIcoMaterial from './VisualizerIcoMaterial'
import SoundReactor from './SoundReactor'

class Experience {
  constructor(options) {
    this.container = options.container
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()

    this.isReady = true

    this.lastElapsedTime = 0
    this.deltaTime = 0
    this.frameCount = 0

    this.start()
  }

  init() {
    this.bind()

    this.setLight()
    this.setSizes()
    this.setCamera()
    this.setCube()
    this.setAudioController()
    this.setVisualizerIco()
    this.setRenderer()
    this.setARButton()

    this.update()
  }

  bind() {}

  //////////////////////////////////////////////////////////////////////////////

  setLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    this.scene.add(ambientLight)
  }

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

  setCube() {
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1, 10, 10),
      new THREE.MeshNormalMaterial({ wireframe: false })
    )
    this.cube.position.z = -3
    // this.scene.add(this.cube)
  }

  setAudioController() {
    this.audioController = new SoundReactor()
  }

  setVisualizerIco() {
    this.materialIco = new VisualizerIcoMaterial()
    const geometry = new THREE.IcosahedronBufferGeometry(1, 32)

    this.visualizerIco = new THREE.Mesh(geometry, this.materialIco)
    this.visualizerIco.position.z = -3
    this.visualizerIco.scale.multiplyScalar(0.5)

    this.scene.add(this.visualizerIco)
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
    const domARButton = ARButton.createButton(this.renderer, {
      requiredFeatures: ['hit-test'],
    })

    // Create the AR button element, configure our XR session, and append it to the DOM.
    document.body.appendChild(domARButton)

    // Start audio
    domARButton.addEventListener('click', () => {
      this.audioController.play()
    })
  }

  //////////////////////////////////////////////////////////////////////////////

  // Check if browser supports WebXR with "immersive-ar".
  async start() {
    const immersiveArSupported = await browserHasImmersiveArCompatibility()
    immersiveArSupported ? this.init() : displayUnsupportedBrowserMessage()
  }

  updateTime() {
    this.frameCount += 1
    this.elapsedTime = this.clock.getElapsedTime()
    this.deltaTime = this.elapsedTime - this.lastElapsedTime
    this.lastElapsedTime = this.elapsedTime
  }

  updateVisualizerIco() {
    if (this.audioController.isPlaying()) {
      // Update audio data
      this.audioController.update()
      const dataArray = this.audioController.getAudioData()

      // Update visualizer material
      this.materialIco.uniforms.uDataArray.value = dataArray

      const { lowerMaxFrMod, upperAvgFrMod } =
        this.audioController.getAudioDataProcessed()

      this.materialIco.uniforms.uBassFr.value = lowerMaxFrMod
      this.materialIco.uniforms.uTreFr.value = upperAvgFrMod
    } else {
      this.materialIco.uniforms.uBassFr.value = 0
      this.materialIco.uniforms.uTreFr.value = 0
    }

    // Update visualizer mesh
    if (this.visualizerIco) {
      // const { position, rotation } = this.visualizerIco
      // position.z = position.z + Math.sin(this.elapsedTime * 0.5) * 0.005

      const r = Math.sin(this.elapsedTime * 0.5) * 0.5
      rotation.set(r, r, r)

      // Update uniforms
      this.materialIco.uniforms.uTime.value = this.frameCount / 10 //this.elapsedTime
      this.materialIco.uniforms.uSpeed.value = settings.ico.speed
      this.materialIco.uniforms.uNoiseDensity.value = settings.ico.density
      this.materialIco.uniforms.uNoiseStrength.value = settings.ico.strength
      this.materialIco.uniforms.uFrequency.value = settings.ico.frequency
      this.materialIco.uniforms.uAmplitude.value = settings.ico.amplitude
      this.materialIco.uniforms.uIntensity.value = settings.ico.intensity
    }
  }

  update() {
    const renderLoop = (_, frame) => {
      if (!this.isReady) return

      if (this.renderer.xr.isPresenting) {
        if (frame) {
          this.updateTime()
          this.updateVisualizerIco()
        }
        this.renderer.render(this.scene, this.camera)
      }
    }

    this.renderer.setAnimationLoop(renderLoop)
  }
}

export default Experience
