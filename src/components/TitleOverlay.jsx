import React from 'react'

const TitleOverlay = () => {
  return (
    <div
      className="drag-region"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 32,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        color: '#000',
        zIndex: 100,
        pointerEvents: 'auto',
        WebkitAppRegion: 'drag',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="no-drag app-welcome" style={{ WebkitAppRegion: 'no-drag' }}>Welcome to Luna</div>
    </div>
  )
}

export default TitleOverlay



