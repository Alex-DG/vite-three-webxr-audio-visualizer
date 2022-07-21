export const showEndSessionBtn = () => {
  document.querySelector('.xr-end-session-btn').style.display = 'block'
  document.querySelector('.xr-end-session-btn').style.opacity = '1'
}

export const hideEndSessionBtn = () => {
  document.querySelector('.xr-end-session-btn').style.opacity = '0'
  setTimeout(() => {
    document.querySelector('.xr-end-session-btn').style.display = 'none'
  }, 500)
}
