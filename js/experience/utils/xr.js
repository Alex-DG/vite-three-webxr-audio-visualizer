/*
 * Returns true if navigator has xr with 'immersive-ar' capabilities
 * Returns false otherwise.
 */
export const browserHasImmersiveArCompatibility = async () => {
  if (window.navigator.xr) {
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar')
    console.info(
      `[DEBUG] ${
        isSupported
          ? 'Browser supports immersive-ar'
          : 'Browser does not support immersive-ar'
      }`
    )

    return isSupported
  }
  return false
}

/*
 * Create and display message when no XR capabilities are found.
 */
export const displayUnsupportedBrowserMessage = () => {
  const details = document.getElementById('ar-details')
  if (details) {
    details.innerHTML = `
        😿 Your browser does not support WebXR<br></br>
        
        * If you are using Android, please try to open this app using the latest version of Chrome or Firefox.<br></br> 

        * If you are using iOS, please try the latest version of the WebXR Viewer available on the App Store.
    `
  }
}

const setOnSessionEnd = (session, onSessionEnd) => {
  session.addEventListener('end', () => {
    session.hitTestSourceInitialized = false
    session.hitTestSource = null
    onSessionEnd()
  })
}

export const handleSession = (renderer, callbacks) => {
  const { onSessionEnd, onSessionStart } = callbacks

  const session = renderer.xr.getSession()

  if (session) {
    setOnSessionEnd(session, onSessionEnd)
    onSessionStart()
  }
}

export const shutdownXR = async (renderer) => {
  const session = renderer.xr.getSession()
  if (session) {
    await session.end()
  }
}
