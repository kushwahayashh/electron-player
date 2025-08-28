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
        color: '#fff',
        background: '#000',
        borderBottom: '1px solid #333',
        WebkitAppRegion: 'drag',
        userSelect: 'none'
      }}
    >
      <div className="no-drag app-welcome" style={{ WebkitAppRegion: 'no-drag' }}>Welcome to Luna</div>
    </div>
  )
}

export default TitleOverlay



