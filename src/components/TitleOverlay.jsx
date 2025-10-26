import React, { useRef, useCallback, useState } from 'react'
import { SUPPORTED_VIDEO_FORMATS, DEFAULTS } from '../utils/constants'
import UrlModal from './UrlModal'
import '../styles/TitleOverlay.css'

const TitleOverlay = ({ onOpenFile, onOpenUrl }) => {
  const fileInputRef = useRef(null)
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false)

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0]
    if (file && onOpenFile) {
      onOpenFile(file)
    }
  }, [onOpenFile])

  const handleMute = useCallback(() => {
    // Toggle mute via keyboard shortcut simulation or direct call
    const event = new KeyboardEvent('keydown', { code: 'KeyM' })
    document.dispatchEvent(event)
  }, [])

  const handleExit = useCallback(() => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow()
    } else {
      window.close()
    }
  }, [])

  const handleOpenUrlModal = useCallback(() => {
    setIsUrlModalOpen(true)
  }, [])

  const handleCloseUrlModal = useCallback(() => {
    setIsUrlModalOpen(false)
  }, [])

  const handleUrlSubmit = useCallback((url) => {
    if (onOpenUrl) {
      onOpenUrl(url)
    }
  }, [onOpenUrl])

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <input 
          ref={fileInputRef}
          type="file" 
          accept={SUPPORTED_VIDEO_FORMATS} 
          style={{ display: 'none' }} 
          aria-hidden="true" 
          onChange={handleFileChange}
        />
        <button
          className="no-drag title-text-btn"
          onClick={handleOpenFile}
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <i className="ti ti-folder" />
          Open File
        </button>
        <button
          className="no-drag title-text-btn"
          onClick={handleOpenUrlModal}
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <i className="ti ti-link" />
          Play URL
        </button>
        <button
          className="no-drag title-text-btn"
          onClick={handleMute}
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <i className="ti ti-volume" />
          Mute
        </button>
        <button
          className="no-drag title-text-btn"
          onClick={handleExit}
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <i className="ti ti-x" />
          Exit
        </button>
      </div>
      <UrlModal 
        isOpen={isUrlModalOpen}
        onClose={handleCloseUrlModal}
        onSubmit={handleUrlSubmit}
      />
    </div>
  )
}

export default TitleOverlay



