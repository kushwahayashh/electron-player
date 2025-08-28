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
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        color: '#fff',
        zIndex: 100,
        pointerEvents: 'auto',
        WebkitAppRegion: 'drag',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)'
      }}
    >
      <div className="no-drag app-welcome" style={{ WebkitAppRegion: 'no-drag' }}>Wellcome to Luna</div>
    </div>
  )
}

export default TitleOverlay


