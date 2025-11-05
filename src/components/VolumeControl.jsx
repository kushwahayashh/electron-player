import React, { useCallback } from 'react'
import '../styles/VolumeControl.css'

const VolumeControl = ({ volume, isMuted, onToggleMute, onVolumeChange, onInteractionChange }) => {
  // Determine volume icon based on mute state and volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return 'ti-volume-off'
    if (volume < 0.5) return 'ti-volume-2'
    return 'ti-volume'
  }

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const step = 0.05
    const dir = e.deltaY < 0 ? 1 : -1
    const current = isMuted ? 0 : (typeof volume === 'number' ? volume : 0)
    const next = Math.max(0, Math.min(2, current + dir * step))
    onInteractionChange?.(true)
    onVolumeChange?.(next)
    // brief grace period to avoid immediate hide while scrolling
    setTimeout(() => onInteractionChange?.(false), 400)
  }, [isMuted, volume, onVolumeChange, onInteractionChange])

  return (
    <div
      className="volume-control"
      onMouseEnter={() => onInteractionChange?.(true)}
      onMouseLeave={() => onInteractionChange?.(false)}
      onWheel={handleWheel}
    >
      <button 
        className="control-btn" 
        onClick={onToggleMute} 
      >
        <i className={`ti ${getVolumeIcon()} small-icon`}></i>
      </button>
      <div className="volume-slider-container">
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="2"
          step="0.01"
          value={isMuted ? 0 : volume}
          style={{ '--vol-p': `${(isMuted ? 0 : Math.max(0, Math.min(2, volume || 0))) * 50}%` }}
          onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
          onPointerDown={() => onInteractionChange?.(true)}
          onPointerUp={() => onInteractionChange?.(false)}
          onBlur={() => onInteractionChange?.(false)}
        />
      </div>
    </div>
  )
}

export default VolumeControl