import { useState, useEffect, useRef } from 'react'
import { DEFAULTS, UI_CONSTANTS } from '../utils/constants'
import { revokeVideoUrl } from '../utils/fileUtils'

export const useVideoPlayer = () => {
  const videoRef = useRef(null)
  const audioContextRef = useRef(null)
  const gainNodeRef = useRef(null)
  const sourceNodeRef = useRef(null)
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
  const [repeatMode, setRepeatMode] = useState('off') // 'off', 'one'

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let lastUpdateTime = 0
    const updateProgress = () => {
      const now = Date.now()
      if (now - lastUpdateTime < UI_CONSTANTS.PROGRESS_UPDATE_THROTTLE) return
      lastUpdateTime = now
      setCurrentTime(video.currentTime)
      setDuration(video.duration || 0)
    }

    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      if (repeatMode === 'one') {
        // Restart the video
        video.currentTime = 0
        video.play().catch((error) => {
          console.log('Error replaying video:', error)
        })
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('progress', updateBuffered)
    video.addEventListener('loadedmetadata', updateProgress)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('progress', updateBuffered)
      video.removeEventListener('loadedmetadata', updateProgress)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [repeatMode])

  // Helper function to initialize Web Audio API
  const initWebAudio = () => {
    const video = videoRef.current
    if (!video?.src || sourceNodeRef.current) return

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(video)
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
      sourceNodeRef.current.connect(gainNodeRef.current)
    } catch (error) {
      console.log('Web Audio API not available:', error)
    }
  }

  // Cleanup Web Audio nodes
  const cleanupWebAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect()
      } catch (e) {}
      sourceNodeRef.current = null
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect()
      } catch (e) {}
      gainNodeRef.current = null
    }
  }

  // Initialize Web Audio when video loads
  useEffect(() => {
    if (!hasVideo) {
      cleanupWebAudio()
      return
    }

    const timeoutId = setTimeout(initWebAudio, 100)
    return () => clearTimeout(timeoutId)
  }, [hasVideo])

  // Sync volume state changes to video element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const clampedVolume = Math.max(0, Math.min(2, volume))
    
    if (clampedVolume <= 1.0) {
      video.volume = clampedVolume
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = 1.0
      }
    } else {
      video.volume = 1.0
      if (!gainNodeRef.current && video.src) {
        initWebAudio()
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = clampedVolume
      }
    }
    
    if (clampedVolume > 0) {
      video.muted = false
    }
  }, [volume])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    // Toggle UI state even without video
    if (!video.src) {
      setIsPlaying(!isPlaying)
      return
    }

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
    if (video && video.src) {
      video.currentTime = Math.max(0, video.currentTime - seconds)
    }
  }

  const skipForward = (seconds = 10) => {
    const video = videoRef.current
    if (video && video.src) {
      video.currentTime = Math.min(video.duration || Infinity, video.currentTime + seconds)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    // Toggle UI state even without video
    if (!video.src) {
      setIsMuted(!isMuted)
      return
    }

    const newMuted = !video.muted
    video.muted = newMuted
    setIsMuted(newMuted)

    // If unmuting and volume is 0, set to a reasonable volume level
    if (!newMuted && (volume === 0 || isNaN(volume))) {
      const newVolume = 1.0
      setVolume(newVolume)
    }
  }

  const setVideoVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(2, newVolume))
    setVolume(clampedVolume)
    setIsMuted(clampedVolume === 0)
    
    const video = videoRef.current
    if (video?.src) {
      video.muted = clampedVolume === 0
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
      
      // For URL videos (http/https), set crossorigin to handle CORS
      if (src && typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
        video.setAttribute('crossorigin', 'anonymous')
      }
      // For MKV files, we need to ensure proper handling
      else if (src && typeof src === 'string' && (src.endsWith('.mkv') || src.includes('.mkv'))) {
        console.log('Loading MKV file:', src)
        video.setAttribute('crossorigin', 'anonymous')
      }
      
      video.src = src
      video.load()
      video.muted = false
      video.preload = 'auto'
      setHasVideo(true)
      setIsPlaying(false)
      setIsMuted(false)
    }
  }

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'one'
      return 'off'
    })
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
    repeatMode,

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
    setVideoPlaybackRate,
    toggleRepeat
  }
}