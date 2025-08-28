import React from 'react'

const TitleOverlay = () => {
  return (
    <div
      className="title-bar"
      style={{
        height: 32,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        color: '#000',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        WebkitAppRegion: 'drag',
        userSelect: 'none'
      }}
    >
      <div className="no-drag app-welcome" style={{ WebkitAppRegion: 'no-drag' }}>Welcome to Luna</div>
    </div>
  )
}

export default TitleOverlay



