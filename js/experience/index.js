import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

import {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
  handleXRHitTest,
} from './utils/xr'

import { settings } from './utils/settings'

import VisualizerIcoMaterial from './VisualizerIcoMaterial'
import SoundReactor from './SoundReactor'
// import ParticleSystem from './ParticleSystem'
import ParticleMaterial from './ParticleMaterial'

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
    this.setRenderer()
    this.setAudioController()
    this.setVisualizerIco()
    this.setParticleSystem()
    this.setMarker()
    this.setController()
    this.setARButton()

    this.update()
  }

  bind() {
    this.onSelect = this.onSelect.bind(this)
  }

  //////////////////////////////////////////////////////////////////////////////

  onSelect() {
    if (this.marker?.visible) {
      // const model = this.fox.clone()
      // model.position.setFromMatrixPosition(this.marker.matrix)
      // // Rotate the model randomly to give a bit of variation to the scene.
      // model.rotation.y = Math.random() * (Math.PI * 2)
      // model.visible = true
      // this.scene.add(model)
    }
  }

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

  setParticleSystem() {
    // this.particleSystem = new ParticleSystem({ scene: this.scene })

    this.particleMaterial = new ParticleMaterial()
    const particleGeometry = new THREE.BufferGeometry()

    const count = 1000
    const positionArray = new Float32Array(count * 3)
    const scaleArray = new Float32Array(count) // add scale randomness

    for (let i = 0; i < count; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
      positionArray[i * 3 + 1] = Math.random() * 1.5
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

  setMarker() {
    const planeMarkerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    })
    // const planeMarkerGeometry = new THREE.RingGeometry(0.14, 0.15, 16).rotateX(
    //   -Math.PI / 2
    // )
    const planeMarkerGeometry = new THREE.PlaneBufferGeometry(
      0.5,
      0.5,
      64 * 2,
      64 * 2
    ).rotateX(-Math.PI / 2)

    this.marker = new THREE.Mesh(planeMarkerGeometry, planeMarkerMaterial)
    this.marker.matrixAutoUpdate = false
    this.scene.add(this.marker)
  }

  setController() {
    this.controller = this.renderer.xr.getController(0)
    this.scene.add(this.controller)

    this.controller.addEventListener('select', this.onSelect)
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
      this.audioController.setupAudioContext()
    })
  }

  //////////////////////////////////////////////////////////////////////////////

  // Check if browser supports WebXR with "immersive-ar".
  async start() {
    const immersiveArSupported = await browserHasImmersiveArCompatibility()
    immersiveArSupported ? this.init() : displayUnsupportedBrowserMessage()
  }

  //////////////////////////////////////////////////////////////////////////////

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
      const r = Math.sin(this.elapsedTime * 0.5) * 0.5
      this.visualizerIco.rotation.set(r, r, r)

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

  updateWebXR(frame) {
    handleXRHitTest(
      this.renderer,
      frame,
      (hitPoseTransformed) => {
        if (hitPoseTransformed) {
          this.marker.visible = true
          this.marker.matrix.fromArray(hitPoseTransformed)
        }
      },
      () => {
        this.marker.visible = false
      }
    )
  }

  updateParticleSystem(time) {
    if (this.particleMaterial) {
      console.log({ time })
      this.particleMaterial.uniforms.uTime.value = time
    }
  }

  update() {
    const renderLoop = (time, frame) => {
      if (!this.isReady) return

      if (this.particleMaterial) {
        // this.particleMaterial.uniforms.uTime.value = time
      }

      if (this.renderer.xr.isPresenting) {
        if (frame) {
          this.updateTime()
          this.updateWebXR(frame)
          this.updateVisualizerIco()
          this.updateParticleSystem(time)
        }
        this.renderer.render(this.scene, this.camera)
      }
    }

    this.renderer.setAnimationLoop(renderLoop)
  }
}

export default Experience
