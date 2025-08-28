import React, { useState, useRef } from 'react'
import VideoPlayer from './components/VideoPlayer'
import TitleOverlay from './components/TitleOverlay'

function App() {
  const [videoTitle, setVideoTitle] = useState('Luna')
  const videoPlayerRef = useRef(null)

  const handleOpenFile = (file) => {
    // Pass the file to VideoPlayer component
    if (videoPlayerRef.current && videoPlayerRef.current.handleOpenFile) {
      videoPlayerRef.current.handleOpenFile(file)
    }
  }

  return (
    <div className="wrap">
      <TitleOverlay videoTitle={videoTitle} onOpenFile={handleOpenFile} />
      <div className="content-area">
        <VideoPlayer onVideoTitleChange={setVideoTitle} onOpenFileRef={videoPlayerRef} />
      </div>
    </div>
  )
}

export default App