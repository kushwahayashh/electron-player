// Utility functions to show video playback-related feedback overlays

const createOverlay = (playerElement, className) => {
  let overlay = document.querySelector(`.${className}`)
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = className
    playerElement?.appendChild(overlay)
  }
  return overlay
}

const createIcon = (overlay, className) => {
  let icon = overlay.querySelector('.feedback-icon')
  if (!icon) {
    icon = document.createElement('i')
    icon.className = 'feedback-icon'
    overlay.appendChild(icon)
  }
  return icon
}

const animateIcon = (icon) => {
  icon.classList.remove('animate')
  requestAnimationFrame(() => {
    icon.classList.add('animate')
  })
}

export const showPlaybackFeedback = (playerElement, isPlaying) => {
  const overlay = createOverlay(playerElement, 'playback-feedback-overlay')
  const icon = createIcon(overlay)
  
  icon.className = `feedback-icon ti ${isPlaying ? 'ti-player-play-filled' : 'ti-player-pause-filled'}`
  animateIcon(icon)
}

export const showVolumeFeedback = (playerElement, isMuted) => {
  const overlay = createOverlay(playerElement, 'playback-feedback-overlay')
  const icon = createIcon(overlay)
  
  icon.className = `feedback-icon ti ${isMuted ? 'ti-volume-off' : 'ti-volume'}`
  animateIcon(icon)
}

export const showSkipFeedback = (playerElement, isForward) => {
  const overlayClass = isForward ? 'skip-forward-overlay' : 'skip-backward-overlay'
  const overlay = createOverlay(playerElement, overlayClass)
  
  overlay.innerHTML = ''
  
  const icon = document.createElement('i')
  icon.className = `skip-feedback-icon ti ${isForward ? 'ti-chevrons-right' : 'ti-chevrons-left'}`
  overlay.appendChild(icon)
  
  animateIcon(icon)
}


