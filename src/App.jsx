import React from 'react'
import VideoPlayer from './components/VideoPlayer'
import TitleOverlay from './components/TitleOverlay'

function App() {
  return (
    <div className="wrap">
      <TitleOverlay />
      <VideoPlayer />
    </div>
  )
}

export default App