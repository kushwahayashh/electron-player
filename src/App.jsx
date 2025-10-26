import React, { useState, useRef, useCallback } from 'react'
import VideoPlayer from './components/VideoPlayer'
import TitleOverlay from './components/TitleOverlay'
import { DEFAULTS } from './utils/constants'

function App() {
  const [videoTitle, setVideoTitle] = useState(DEFAULTS.TITLE)
  const videoPlayerRef = useRef(null)

  const handleOpenFile = useCallback((file) => {
    if (videoPlayerRef.current?.handleOpenFile) {
      videoPlayerRef.current.handleOpenFile(file)
    }
  }, [])

  return (
    <div className="wrap">
      <TitleOverlay onOpenFile={handleOpenFile} />
      <div className="content-area">
        <VideoPlayer videoTitle={videoTitle} onVideoTitleChange={setVideoTitle} onOpenFileRef={videoPlayerRef} />
      </div>
    </div>
  )
}

export default App