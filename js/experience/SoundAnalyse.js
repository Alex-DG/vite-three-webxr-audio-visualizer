import Loader from './Loader'

import audioSrc from '../../assets/audio/Pandrezz_Curtain_Call.mp4'
import { hideEndSessionBtn, showEndSessionBtn } from './utils/dom'
import { isWaveForm } from './utils/url'

class _SoundAnalyse {
  onAudioLoaded(audio) {
    this.audio = audio
    Loader.loaded('🎵 Audio ready')
  }

  //////////////////////////////////////////////////////////////////////////////

  bind() {
    this.onAudioLoaded = this.onAudioLoaded.bind(this)
  }

  //////////////////////////////////////////////////////////////////////////////

  drawWaveform(waveform) {
    push()
    noFill()
    stroke('white')
    strokeWeight(2)
    beginShape()

    for (let i = 0; i < waveform.length; i++) {
      const { x, y } = {
        x: map(i, 0, waveform.length, 0, width),
        y: map(waveform[i], -2.2, 2.2, 0, height),
      }
      vertex(x, y)
    }

    endShape()
    pop()
  }

  //////////////////////////////////////////////////////////////////////////////

  play() {
    this.audio?.play()
    showEndSessionBtn()
    this.isPlaying = true
  }

  pause() {
    this.audio?.pause()
    this.isPlaying = false
  }

  stop() {
    this.audio?.stop()
    hideEndSessionBtn()
    this.isPlaying = false
  }

  //////////////////////////////////////////////////////////////////////////////

  start() {
    const { sketch } = this

    let fft, amp, canvas

    sketch.preload = () => {
      loadSound(audioSrc, this.onAudioLoaded)
    }

    sketch.setup = () => {
      canvas = createCanvas(windowWidth, windowHeight)
      canvas.parent('p5')

      // Sound analysis tools
      fft = new p5.FFT(0.4)
      amp = new p5.Amplitude()
    }

    sketch.draw = () => {
      clear()
      stroke(random(255))

      fft.analyze()

      const volume = amp.getLevel()
      let freq = fft.getCentroid()
      freq *= 0.001

      this.mapF = map(freq, 0, 0.01, 0, 0.001)
      this.mapA = map(volume, 0, 0.2, 0, 0.5)

      if (isWaveForm()) {
        const waveform = fft.waveform()
        this.drawWaveform(waveform)
      }
    }

    sketch.windowResized = () => {
      resizeCanvas(windowWidth, windowHeight)
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  init(s) {
    this.sketch = s
    this.isPlaying = false

    this.bind()
    this.start()
  }
}

const SoundAnalyse = new _SoundAnalyse()
export default SoundAnalyse
