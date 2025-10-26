import React, { useState, useRef, useEffect } from 'react'
import '../styles/UrlModal.css'

const UrlModal = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim())
      setUrl('')
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="url-modal-overlay" onClick={onClose}>
      <div className="url-modal" onClick={(e) => e.stopPropagation()}>
        <div className="url-modal-header">
          <h3>Play Video from URL</h3>
          <button className="url-modal-close" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="url-input"
            placeholder="Enter video URL (http:// or https://)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="url-modal-actions">
            <button type="button" className="url-btn url-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="url-btn url-btn-submit" disabled={!url.trim()}>
              Play
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UrlModal
