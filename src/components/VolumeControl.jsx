import React from 'react'

const VolumeControl = ({ volume, isMuted, onToggleMute }) => {
  // Determine volume icon based on mute state and volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return 'ti-volume-off'
    if (volume < 0.5) return 'ti-volume-2'
    return 'ti-volume'
  }

  return (
    <button 
      className="control-btn" 
      onClick={onToggleMute} 
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      <i className={`ti ${getVolumeIcon()} small-icon`}></i>
    </button>
  )
}

export default VolumeControl