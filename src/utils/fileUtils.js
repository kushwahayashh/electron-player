// File utility functions

export const extractFileName = (filePath) => {
  const filename = filePath.split(/[\\/]/).pop() || 'Unknown'
  return filename.replace(/\.[^/.]+$/, '')
}

export const createVideoUrl = (file) => {
  return URL.createObjectURL(file)
}

export const revokeVideoUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export const handleVideoAutoplay = async (videoElement) => {
  try {
    await videoElement.play()
  } catch (error) {
    console.log('Autoplay prevented:', error)
    videoElement.muted = true
    try {
      await videoElement.play()
    } catch (err) {
      console.log('Muted autoplay also failed:', err)
    }
  }
}
