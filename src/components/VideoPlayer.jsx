import React, { useState, useEffect, useRef } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import { showPlaybackFeedback as showPlaybackFeedbackOverlay, showVolumeFeedback as showVolumeFeedbackOverlay, showSkipFeedback as showSkipFeedbackOverlay } from '../utils/videoFeedback';

const VideoPlayer = ({ onVideoTitleChange, onOpenFileRef }) => {
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    buffered,
    isFitToScreen,
    togglePlay,
    skipBackward,
    skipForward,
    toggleMute,
    setVideoVolume,
    toggleFullscreen,
    toggleFitMode,
    seekTo,
    loadVideo,
    formatTime
  } = useVideoPlayer();

  // Expose handleOpenFile method to parent component
  React.useImperativeHandle(onOpenFileRef, () => ({
    handleOpenFile
  }), []);
  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState(null);
  const playerRef = useRef(null);

  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    let lastMouseMoveTime = 0;
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMouseMoveTime < 100) {
        return;
      }
      lastMouseMoveTime = now;

      setShowControls(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setHideTimeout(timeout);
    };

    player.addEventListener('mousemove', handleMouseMove);
    return () => {
      player.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  const handleProgressClick = (ratio) => {
    const time = (duration || 0) * ratio;
    seekTo(time);
  };

  const showPlaybackFeedback = (isPlaying) => {
    return showPlaybackFeedbackOverlay(playerRef.current, isPlaying);
  };

  const showVolumeFeedback = (isMuted) => {
    return showVolumeFeedbackOverlay(playerRef.current, isMuted);
  };

  const showSkipFeedback = (isForward) => {
    return showSkipFeedbackOverlay(playerRef.current, isForward);
  };

  const handleOpenFile = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      loadVideo(url);
      onVideoTitleChange(file.name.replace(/\.[^/.]+$/, ''));
      requestAnimationFrame(() => {
        videoRef.current?.play().catch(error => {
          console.log('Autoplay prevented:', error);
          videoRef.current.muted = true;
          videoRef.current.play().catch(err => console.log('Muted autoplay also failed:', err));
        });
      });
    }
  };

  const handleBack = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      console.log('Back button pressed - not in fullscreen mode');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          showPlaybackFeedback(!isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward(10);
          showSkipFeedback(true);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward(10);
          showSkipFeedback(false);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          showVolumeFeedback(!isMuted);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, skipForward, skipBackward, toggleFullscreen, toggleMute, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.classList.toggle('object-cover', isFitToScreen);
      video.classList.toggle('object-contain', !isFitToScreen);
    }
  }, [isFitToScreen]);

  useEffect(() => {
    const handleLoadVideoFile = (event, filePath) => {
      loadVideo(filePath);
      const filename = filePath.split(/[\\/]/).pop() || 'Unknown';
      const baseName = filename.replace(/\.[^/.]+$/, '');
      onVideoTitleChange(baseName);
      requestAnimationFrame(() => {
        videoRef.current?.play().catch(error => {
          console.log('Autoplay prevented:', error);
          videoRef.current.muted = true;
          videoRef.current.play().catch(err => console.log('Muted autoplay also failed:', err));
        });
      });
    };

    if (window.electronAPI) {
      window.electronAPI.onLoadVideoFile(handleLoadVideoFile);
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('load-video-file');
      }
    };
  }, [loadVideo]);

  return (
    <div className="player" id="player" ref={playerRef}>

      <video
        ref={videoRef}
        className={`w-full max-h-full ${isFitToScreen ? 'object-cover h-full' : 'object-contain h-auto'}`}
        preload="metadata"
        playsInline
        onClick={() => {
          togglePlay();
          showPlaybackFeedback(!isPlaying);
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className={`controls-overlay ${showControls ? 'visible' : ''}`} />

      <div className={`controls ${showControls ? '' : 'hidden'}`}>
        <ProgressBar
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onProgressClick={handleProgressClick}
          formatTime={formatTime}
        />

        <div className="controls-row">
          <div className="left-controls">
            <button className="control-btn" onClick={() => {
              skipBackward(10);
              showSkipFeedback(false);
            }} title="Back 10s">
              <i className="ti ti-chevrons-left small-icon" />
            </button>

            <button className="control-btn big-btn" onClick={() => {
              togglePlay();
              showPlaybackFeedback(!isPlaying);
            }} title="Play / Pause">
              <i
                className={`ti ${isPlaying ? 'ti-player-pause-filled' : 'ti-player-play-filled'} small-icon`}
              />
            </button>

            <button className="control-btn" onClick={() => {
              skipForward(10);
              showSkipFeedback(true);
            }} title="Forward 10s">
              <i className="ti ti-chevrons-right small-icon" />
            </button>

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVideoVolume}
              onToggleMute={toggleMute}
              showVolumeFeedback={showVolumeFeedback}
            />
          </div>

          <div className="right-controls">
            <button 
              className="control-btn"
              onClick={toggleFitMode}
              title="Toggle Fit to Screen"
            >
              <i className="ti ti-arrows-maximize small-icon" />
            </button>
            <button className="control-btn fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
              <i className="ti ti-maximize small-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
