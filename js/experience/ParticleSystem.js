import * as THREE from 'three'

class ParticleSystem {
  constructor(options) {
    this.particleCount = options.count || 4000
    this.boxSize = options.size || 30
    this.scene = options.scene

    this.init()
  }

  init() {
    this.particlesGeom = new THREE.BufferGeometry()
    this.particlesPos = []

    for (let p = 0; p < this.particleCount; p++) {
      let x = Math.random() * this.boxSize - this.boxSize / 2
      let y = Math.random() * this.boxSize - this.boxSize / 2
      let z = Math.random() * this.boxSize - this.boxSize / 2

      // Create the vertex
      this.particlesPos.push(x, y, z)
    }

    this.particlesGeom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.particlesPos, 3)
    )

    this.particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
    })

    this.particleSystem = new THREE.Points(
      this.particlesGeom,
      this.particleMaterial
    )
    this.scene.add(this.particleSystem)
  }

  update() {
    if (this.particlesGeom) {
      let i = 0
      while (i < this.particleCount) {
        // let x = this.particlesGeom.attributes.position.array[i * 3 + 0] += 0.01
        // let z = this.particlesGeom.attributes.position.array[i * 3 + 2] += 0.01

        this.particlesGeom.attributes.position.array[i * 3 + 1] += 0.01

        // Reset particles Y position
        if (
          this.particlesGeom.attributes.position.array[i * 3 + 1] >
          this.boxSize / 2
        ) {
          this.particlesGeom.attributes.position.array[i * 3 + 1] =
            -this.boxSize / 2
        }

        i++
      }

      this.particlesGeom.attributes.position.needsUpdate = true
    }
  }
}

export default ParticleSystem
