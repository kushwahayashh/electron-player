import React, { useRef } from 'react'

const TopBar = ({ title, onBack, onOpenFile, isVisible }) => {
  const fileInputRef = useRef(null)

  const handleOpenFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && onOpenFile) {
      onOpenFile(file)
    }
  }

  return (
    <div className={`topbar drag-region ${isVisible ? '' : 'top-hidden'}`}>
      <div className="top-left">
        <div className="app-welcome">Welcome to Luna</div>
        <div className="title" id="title">{title}</div>
      </div>
      <div className="top-right">
        <button className="control-btn no-drag window-control-btn" id="openFileBtn" title="Open Video File" aria-label="Open video file" onClick={handleOpenFile}>
          <i className="ti ti-align-right small-icon"></i>
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          id="fileInput" 
          accept=".mp4,.mkv,.avi,.mov,.wmv,.webm,.m4v,.flv,.3gp,video/*" 
          style={{ display: 'none' }} 
          aria-hidden="true" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export default TopBar