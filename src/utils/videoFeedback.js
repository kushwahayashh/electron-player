// Utility functions to show video playback-related feedback overlays

export const showPlaybackFeedback = (playerElement, isPlaying) => {
	let overlay = document.querySelector('.playback-feedback-overlay')
	if (!overlay) {
		overlay = document.createElement('div')
		overlay.className = 'playback-feedback-overlay'
		playerElement?.appendChild(overlay)
	}

	let icon = overlay.querySelector('.feedback-icon')
	if (!icon) {
		icon = document.createElement('i')
		icon.className = 'feedback-icon'
		overlay.appendChild(icon)
	}

	icon.className = `feedback-icon ti ${isPlaying ? 'ti-player-play-filled' : 'ti-player-pause-filled'}`
	icon.classList.remove('animate')
	requestAnimationFrame(() => {
		icon.classList.add('animate')
	})
}

export const showVolumeFeedback = (playerElement, isMuted) => {
	let overlay = document.querySelector('.playback-feedback-overlay')
	if (!overlay) {
		overlay = document.createElement('div')
		overlay.className = 'playback-feedback-overlay'
		playerElement?.appendChild(overlay)
	}

	let icon = overlay.querySelector('.feedback-icon')
	if (!icon) {
		icon = document.createElement('i')
		icon.className = 'feedback-icon'
		overlay.appendChild(icon)
	}

	icon.className = `feedback-icon ti ${isMuted ? 'ti-volume-off' : 'ti-volume'}`
	icon.classList.remove('animate')
	requestAnimationFrame(() => {
		icon.classList.add('animate')
	})
}

export const showSkipFeedback = (playerElement, isForward) => {
	const overlayClass = isForward ? 'skip-forward-overlay' : 'skip-backward-overlay'
	let overlay = document.querySelector(`.${overlayClass}`)

	if (!overlay) {
		overlay = document.createElement('div')
		overlay.className = overlayClass
		playerElement?.appendChild(overlay)
	}

	overlay.innerHTML = ''

	const icon = document.createElement('i')
	icon.className = `skip-feedback-icon ti ${isForward ? 'ti-chevrons-right' : 'ti-chevrons-left'}`
	overlay.appendChild(icon)

	icon.classList.remove('animate')
	requestAnimationFrame(() => {
		icon.classList.add('animate')
	})
}


