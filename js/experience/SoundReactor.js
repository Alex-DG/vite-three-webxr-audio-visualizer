import audioSrc from '../../assets/audio/Pandrezz_Curtain_Call.mp4'
import { audioFileImport, audioNameUpdate, audioReset } from './utils/audio'
import { avg, max, map } from './utils/math'

class SoundReactor {
  constructor() {
    this.dataArray = new Uint8Array([0])
    this.playing = false
    this.ready = false

    this.init()
  }

  init() {
    this.setAudio()
  }

  //////////////////////////////////////////////////////////////////////////////

  setAudio() {
    this.audio = new Audio(audioSrc)
    this.audio.loop = true
    this.audio.onloadeddata = () => {
      this.audio.currentTime = 8
      this.ready = true
    }
  }

  setupAudioContext() {
    if (!this.ready) return

    this.audioContext = new AudioContext()

    this.source = this.audioContext.createMediaElementSource(this.audio)

    this.analyser = this.audioContext.createAnalyser()
    this.analyser.smoothingTimeConstant = 0.8

    this.source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    this.analyser.fftSize = 1024

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

    setTimeout(() => {
      this.play()
    }, 1000)
  }

  setPlayState(value) {
    this.playing = value
  }

  //////////////////////////////////////////////////////////////////////////////

  play() {
    this.audio?.play()
    this.setPlayState(true)
  }

  pause() {
    this.audio?.pause()
    this.setPlayState(false)
  }

  isPlaying() {
    this.setPlayState(!this.audioElement?.paused)
    return this.playing
  }

  //////////////////////////////////////////////////////////////////////////////

  getAudioData() {
    return this.dataArray
  }

  getAudioDataProcessed() {
    const dataArray = this.dataArray
    if (!dataArray?.length) return

    const lowerHalfArray = dataArray.slice(0, dataArray.length / 2 - 1)
    const upperHalfArray = dataArray.slice(
      dataArray.length / 2 - 1,
      dataArray.length - 1
    )

    const overallAvg = avg(dataArray)

    const lowerMax = max(lowerHalfArray)
    const lowerAvg = avg(lowerHalfArray)

    const upperMax = max(upperHalfArray)
    const upperAvg = avg(upperHalfArray)

    const lowerMaxFr = lowerMax / lowerHalfArray.length
    const lowerAvgFr = lowerAvg / lowerHalfArray.length

    const upperMaxFr = upperMax / upperHalfArray.length
    const upperAvgFr = upperAvg / upperHalfArray.length

    const lowerMaxFrMod = map(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8)
    const upperAvgFrMod = map(upperAvgFr, 0, 1, 0, 4)

    return {
      overallAvg,
      lowerMax,
      lowerAvg,
      upperMax,
      upperAvg,
      lowerMaxFr,
      lowerAvgFr,
      upperMaxFr,
      upperAvgFr,
      lowerMaxFrMod,
      upperAvgFrMod,
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  update() {
    if (this.isPlaying()) {
      this.analyser?.getByteFrequencyData(this.dataArray)
    }
  }
}

export default SoundReactor
