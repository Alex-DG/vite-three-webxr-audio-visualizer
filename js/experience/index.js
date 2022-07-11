import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

import {
  browserHasImmersiveArCompatibility,
  displayUnsupportedBrowserMessage,
} from './utils/xr'

class Experience {
  constructor(options) {
    this.container = options.container
    this.scene = new THREE.Scene()
    this.isReady = true

    this.start()
  }

  init() {
    this.bind()

    this.setLight()
    this.setSizes()
    this.setCamera()
    // TODO: set visualizers Ico + Plane
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
    // Create the AR button element, configure our XR session, and append it to the DOM.
    document.body.appendChild(
      ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] })
    )
  }

  //////////////////////////////////////////////////////////////////////////////

  // Check if browser supports WebXR with "immersive-ar".
  async start() {
    const immersiveArSupported = await browserHasImmersiveArCompatibility()
    immersiveArSupported ? this.init() : displayUnsupportedBrowserMessage()
  }

  update() {
    const renderLoop = (_, frame) => {
      if (!this.isReady) return

      if (this.renderer.xr.isPresenting) {
        if (frame) {
          //
        }
        this.renderer.render(this.scene, this.camera)
      }
    }

    this.renderer.setAnimationLoop(renderLoop)
  }
}

export default Experience
