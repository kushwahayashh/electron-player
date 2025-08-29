import { useState, useEffect, useRef } from 'react'
import { DEFAULTS, UI_CONSTANTS } from '../utils/constants'
import { revokeVideoUrl } from '../utils/fileUtils'

export const useVideoPlayer = () => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(DEFAULTS.VOLUME)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [isFitToScreen, setIsFitToScreen] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let lastUpdateTime = 0
    const updateProgress = () => {
      // Throttle progress updates to reduce re-renders
      const now = Date.now()
      if (now - lastUpdateTime < UI_CONSTANTS.PROGRESS_UPDATE_THROTTLE) {
        return
      }
      lastUpdateTime = now
      
      setCurrentTime(video.currentTime)
      setDuration(video.duration || 0)
    }

    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBuffered(bufferedEnd)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('progress', updateBuffered)
    video.addEventListener('loadedmetadata', updateProgress)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    // Set initial volume and playback rate
    video.volume = volume
    video.playbackRate = 1

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('progress', updateBuffered)
      video.removeEventListener('loadedmetadata', updateProgress)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      // Try to play unmuted first
      video.play().catch((error) => {
        console.log('Error playing video:', error)
        // If that fails, try playing muted
        video.muted = true
        video.play().catch((err) => {
          console.log('Error playing video even when muted:', err)
        })
      })
    } else {
      video.pause()
    }
  }

  const skipBackward = (seconds = 10) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = Math.max(0, video.currentTime - seconds)
    }
  }

  const skipForward = (seconds = 10) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = Math.min(video.duration || Infinity, video.currentTime + seconds)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    const newMuted = !video.muted
    video.muted = newMuted
    setIsMuted(newMuted)

    // If unmuting and volume is 0, set to a reasonable volume level
    if (!newMuted && (video.volume === 0 || isNaN(video.volume))) {
      const newVolume = 0.6
      setVolume(newVolume)
      video.volume = newVolume
    }
    
    // Ensure volume is valid
    if (!isNaN(video.volume) && video.volume >= 0 && video.volume <= 1) {
      setVolume(video.volume)
    }
  }

  const setVideoVolume = (newVolume) => {
    const video = videoRef.current
    if (!video) return

    // Ensure volume is within valid range
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    
    setVolume(clampedVolume)
    video.volume = clampedVolume
    
    // Only mute if volume is exactly 0
    if (clampedVolume === 0) {
      video.muted = true
      setIsMuted(true)
    } else {
      // Unmute if volume is greater than 0
      video.muted = false
      setIsMuted(false)
    }
  }

  const toggleFullscreen = () => {
    const player = document.getElementById('player')
    if (!player) return

    if (!document.fullscreenElement) {
      player.requestFullscreen?.() || player.webkitRequestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const setVideoPlaybackRate = (rate) => {
    const video = videoRef.current
    if (!video) return
    const safe = Math.max(0.07, Math.min(16, rate))
    video.playbackRate = safe
    setPlaybackRate(safe)
  }

  const toggleFitMode = () => {
    const video = videoRef.current
    if (!video) return
    
    // Toggle the CSS classes and set height appropriately
    if (video.classList.contains('object-contain')) {
      video.classList.remove('object-contain')
      video.classList.add('object-cover')
    } else {
      video.classList.remove('object-cover')
      video.classList.add('object-contain')
    }
    setIsFitToScreen(!isFitToScreen)
  }

  const seekTo = (time) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = time
    }
  }

  const loadVideo = (src) => {
    const video = videoRef.current
    if (video) {
      // Revoke previous blob URL if it exists
      revokeVideoUrl(video.src)
      
      video.src = src
      // For MKV files, we need to ensure proper handling
      if (src && typeof src === 'string' && (src.endsWith('.mkv') || src.includes('.mkv'))) {
        console.log('Loading MKV file:', src)
        video.setAttribute('crossorigin', 'anonymous')
      }
      // Reset playback state
      video.load()
      // Ensure video is not muted by default unless needed
      video.muted = false
      // Set preload to auto for better loading
      video.preload = 'auto'
      // Set hasVideo to true when a video is loaded
      setHasVideo(true)
    }
  }

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return {
    // Refs
    videoRef,

    // State
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    buffered,
    isFitToScreen,
    hasVideo,
    playbackRate,

    // Methods
    togglePlay,
    skipBackward,
    skipForward,
    toggleMute,
    setVideoVolume,
    toggleFullscreen,
    toggleFitMode,
    seekTo,
    loadVideo,
    formatTime,
    setVideoPlaybackRate
  }
}