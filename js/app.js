import '../styles/app.css'

import Experience from './experience'

console.log('🎉', 'Project generated using vite-three-starter')
console.log(':: https://github.com/Alex-DG/vite-three-starter ::')

/**
 * Dom
 */
document.querySelector('#app').innerHTML = `
 <div class="container">
   <h1>Audio Visualizer</h1>

   <h2>AR / WebXR</h2>

   <p id="ar-details">
    This is an experiment using augmented reality features with the WebXR Device API.<br></br>
    Upon entering AR, don't forget to enable your audio 🔉 and enjoy the beats 🎧
   </p>
 </div>

 <div class="loading">
  <h2>Loading ⏳</h2>
 </div>
`

document.querySelector('#p5').innerHTML = `
  <span class="xr-end-session-btn">&times;</span>
`

/**
 * P5js
 */
const sketch = window
window.p5 = p5

/**
 * Experience
 */
window.experience = new Experience({
  container: document.getElementById('experience'),
  sketch,
})
