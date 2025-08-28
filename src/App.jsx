import React from 'react'
import VideoPlayer from './components/VideoPlayer'
import TitleOverlay from './components/TitleOverlay'

function App() {
  return (
    <div className="wrap">
      <TitleOverlay />
      <div className="content-area">
        <VideoPlayer />
      </div>
    </div>
  )
}

export default App