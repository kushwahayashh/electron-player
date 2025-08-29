import React, { useState, useRef } from 'react'

const VolumeControl = ({ volume, isMuted, onVolumeChange, onToggleMute, showVolumeFeedback }) => {
  const [isHovering, setIsHovering] = useState(false)
  const volumeTrackRef = useRef(null)
  const isScrubbing = useRef(false)

  const handleVolumeClick = (e) => {
    if (!volumeTrackRef.current) return
    
    const rect = volumeTrackRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    
    onVolumeChange(ratio)
  }

  const handleVolumeMouseDown = (e) => {
    isScrubbing.current = true
    setIsHovering(true)
    handleVolumeClick(e)
  }

  const handleVolumeMouseMove = (e) => {
    if (isScrubbing.current && volumeTrackRef.current) {
      const rect = volumeTrackRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = Math.max(0, Math.min(1, x / rect.width))
      
      onVolumeChange(ratio)
    }
  }

  const handleVolumeMouseUp = () => {
    isScrubbing.current = false
  }

  // Global mouse events for volume scrubbing
  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isScrubbing.current) {
        handleVolumeMouseMove(e)
      }
    }
    
    const handleGlobalMouseUp = () => {
      if (isScrubbing.current) {
        isScrubbing.current = false
        setIsHovering(false)
      }
    }
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mouseleave', handleGlobalMouseUp)
    window.addEventListener('blur', handleGlobalMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mouseleave', handleGlobalMouseUp)
      window.removeEventListener('blur', handleGlobalMouseUp)
    }
  }, [])

  const volumeIcon = isMuted || volume === 0 ? 'ti-volume-off' : 'ti-volume'
  const percentage = volume * 100

  return (
    <div 
      className="volume-control relative flex items-center gap-2"
    >
      <button 
        className="control-btn" 
        onClick={() => {
          onToggleMute()
          if (showVolumeFeedback) {
            showVolumeFeedback(!isMuted)
          }
        }} 
        title="Mute / Unmute"
      >
        <i className={`ti ${volumeIcon} small-icon`} style={{ display: 'inline-block' }}></i>
      </button>
      <div 
        className="volume-hitbox ml-2"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { if (!isScrubbing.current) setIsHovering(false) }}
        onMouseMove={handleVolumeMouseMove}
      >
        <div 
          className={`volume-slider-container relative h-1 opacity-0 transition-all overflow-visible self-center ${isHovering || isScrubbing.current ? 'opacity-100 w-28' : 'w-0'}`}
        >
          <div 
            ref={volumeTrackRef}
            className="volume-slider absolute top-1/2 left-0 w-full h-1 rounded cursor-pointer"
            style={{ transform: 'translateY(-50%)' }}
            onClick={handleVolumeClick}
            onMouseDown={handleVolumeMouseDown}
            onMouseUp={handleVolumeMouseUp}
          >
            <div 
              className="volume-filled absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent to-blue-300 rounded"
              style={{ width: `${percentage}%` }}
            ></div>
            <div 
              className="thumb absolute top-1/2 w-3.5 h-3.5 bg-white rounded-full shadow transform -translate-x-1/2 -translate-y-1/2 transition-width-height"
              style={{ left: `${percentage}%` }}
            ></div>
            <input 
              type="range" 
              id="volume" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              title="Volume"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolumeControl