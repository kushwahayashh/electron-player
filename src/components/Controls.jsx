import React from 'react'

const Controls = ({ 
  isPlaying, 
  onPlayPause, 
  onSkipBackward, 
  onSkipForward, 
  isMuted, 
  onToggleMute, 
  onToggleFullscreen, 
  onToggleFitToScreen, 
  isFitToScreen 
}) => {
  return (
    <div className="controls-row">
      <div className="left-controls">
        <button className="control-btn" onClick={onSkipBackward} title="Back 10s">
          <i className="ti ti-chevrons-left small-icon"></i>
        </button>

        <button className="control-btn big-btn" onClick={onPlayPause} title="Play / Pause">
          <i 
            className={`ti ${isPlaying ? 'ti-player-pause-filled' : 'ti-player-play-filled'} small-icon`} 
            style={{ display: 'inline-block' }}
          ></i>
        </button>

        <button className="control-btn" onClick={onSkipForward} title="Forward 10s">
          <i className="ti ti-chevrons-right small-icon"></i>
        </button>

        <div className="volume-control">
          <button className="control-btn" onClick={onToggleMute} title="Mute / Unmute">
            <i 
              className={`ti ${isMuted ? 'ti-volume-off' : 'ti-volume'} small-icon`} 
              style={{ display: 'inline-block' }}
            ></i>
          </button>
          <div className="volume-slider-container">
            <div className="volume-slider">
              <div className="volume-filled"></div>
              <div className="thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="center-controls">
      </div>

      <div className="right-controls">
        <button 
          className="control-btn" 
          onClick={onToggleFitToScreen} 
          title="Toggle Fit to Screen"
          style={{ opacity: isFitToScreen ? 1 : 0.8 }}
        >
          <i className="ti ti-arrows-maximize small-icon"></i>
        </button>
        <button className="control-btn fullscreen-btn" onClick={onToggleFullscreen} title="Toggle Fullscreen">
          <i className="ti ti-maximize small-icon"></i>
        </button>
      </div>
    </div>
  )
}

export default Controls