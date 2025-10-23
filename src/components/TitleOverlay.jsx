import React, { useRef, useCallback } from 'react'
import { SUPPORTED_VIDEO_FORMATS, DEFAULTS } from '../utils/constants'
import '../styles/TitleOverlay.css'

const TitleOverlay = ({ videoTitle, onOpenFile }) => {
  const fileInputRef = useRef(null)

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0]
    if (file && onOpenFile) {
      onOpenFile(file)
    }
  }, [onOpenFile])

  return (
    <div
      className="title-bar"
      style={{
        height: 40,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 12,
        color: '#fff',
        background: '#000',
        borderBottom: '1px solid #333',
        WebkitAppRegion: 'drag',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="control-btn no-drag window-control-btn" 
          title="Open Video File" 
          aria-label="Open video file" 
          onClick={handleOpenFile}
          style={{
            WebkitAppRegion: 'no-drag',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
        >
          <i className="ti ti-flare-filled small-icon"></i>
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          accept={SUPPORTED_VIDEO_FORMATS} 
          style={{ display: 'none' }} 
          aria-hidden="true" 
          onChange={handleFileChange}
        />
        <div className="no-drag app-welcome" style={{ WebkitAppRegion: 'no-drag' }}>
          {videoTitle || DEFAULTS.WELCOME_MESSAGE}
        </div>
      </div>
    </div>
  )
}

export default TitleOverlay



