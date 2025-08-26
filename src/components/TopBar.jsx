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
    <div className={`topbar ${isVisible ? '' : 'top-hidden'}`}>
      <div className="top-left">
        <button className="back" id="backBtn" title="Back" aria-label="Go back" onClick={onBack}>
          <i className="ti ti-arrow-left small-icon"></i>
        </button>
        <div className="title" id="title">{title}</div>
      </div>
      <div className="top-right">
        <button className="control-btn" id="openFileBtn" title="Open Video File" aria-label="Open video file" onClick={handleOpenFile}>
          <i className="ti ti-align-right small-icon"></i>
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          id="fileInput" 
          accept="video/*" 
          style={{ display: 'none' }} 
          aria-hidden="true" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export default TopBar