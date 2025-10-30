import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import SettingsButton from './SettingsButton';
import ContextMenu from './ContextMenu';
import UrlModal from './UrlModal';
import { showPlaybackFeedback, showVolumeFeedback, showSkipFeedback } from '../utils/videoFeedback';
import { KEYBOARD_SHORTCUTS, UI_CONSTANTS, SUPPORTED_VIDEO_FORMATS } from '../utils/constants';
import { extractFileName, createVideoUrl, handleVideoAutoplay } from '../utils/fileUtils';
import '../styles/VideoPlayer.css';
import '../styles/feedback.css';

const VideoPlayer = ({ videoTitle, onVideoTitleChange, onOpenFileRef }) => {
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    buffered,
    isFitToScreen,
    hasVideo,
    togglePlay,
    skipBackward,
    skipForward,
    toggleMute,
    setVideoVolume,
    toggleFullscreen,
    toggleFitMode,
    seekTo,
    loadVideo,
    formatTime,
    playbackRate,
    setVideoPlaybackRate
  } = useVideoPlayer();

  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const playerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const clickTimeout = useRef(null);
  const contextMenuClosingRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Cleanup click timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
    };
  }, []);

  const handleOpenUrl = useCallback((url) => {
    if (url) {
      loadVideo(url);
      // Extract filename from URL or use a default title
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'Online Video';
        onVideoTitleChange(filename.replace(/\.[^/.]+$/, ''));
      } catch (e) {
        onVideoTitleChange('Online Video');
      }
      requestAnimationFrame(() => {
        if (videoRef.current) {
          handleVideoAutoplay(videoRef.current);
        }
      });
    }
  }, [loadVideo, onVideoTitleChange]);

  // Handle mouse movement to show/hide controls
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    let lastMouseMoveTime = 0;
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMouseMoveTime < UI_CONSTANTS.MOUSE_MOVE_THROTTLE) return;
      lastMouseMoveTime = now;

      setShowControls(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      // Don't hide controls if user is interacting (scrubbing)
      if (!isInteracting) {
        const timeout = setTimeout(() => setShowControls(false), UI_CONSTANTS.CONTROLS_HIDE_DELAY);
        setHideTimeout(timeout);
      }
    };

    player.addEventListener('mousemove', handleMouseMove);
    return () => {
      player.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [hideTimeout, isInteracting]);


  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const keyHandlers = {
        [KEYBOARD_SHORTCUTS.SPACE]: () => {
          e.preventDefault();
          togglePlay();
          showPlaybackFeedback(playerRef.current, !isPlayingRef.current);
        },
        [KEYBOARD_SHORTCUTS.ARROW_RIGHT]: () => {
          e.preventDefault();
          skipForward(UI_CONSTANTS.SKIP_SECONDS);
          showSkipFeedback(playerRef.current, true);
        },
        [KEYBOARD_SHORTCUTS.ARROW_LEFT]: () => {
          e.preventDefault();
          skipBackward(UI_CONSTANTS.SKIP_SECONDS);
          showSkipFeedback(playerRef.current, false);
        },
        [KEYBOARD_SHORTCUTS.KEY_F]: toggleFullscreen,
        [KEYBOARD_SHORTCUTS.KEY_M]: () => {
          e.preventDefault();
          toggleMute();
          showVolumeFeedback(playerRef.current, !isMutedRef.current);
        }
      };

      const handler = keyHandlers[e.code];
      if (handler) handler();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipForward, skipBackward, toggleFullscreen, toggleMute]);

  // Update video fit mode
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.classList.toggle('object-cover', isFitToScreen);
      video.classList.toggle('object-contain', !isFitToScreen);
    }
  }, [isFitToScreen]);

  // Handle file loading from electron
  useEffect(() => {
    const handleLoadVideoFile = (event, filePath) => {
      loadVideo(filePath);
      const baseName = extractFileName(filePath);
      onVideoTitleChange(baseName);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          handleVideoAutoplay(videoRef.current);
        }
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
  }, [loadVideo, onVideoTitleChange]);

  const handleProgressClick = useCallback((ratio) => {
    const time = (duration || 0) * ratio;
    seekTo(time);
  }, [duration, seekTo]);

  const handleOpenFile = useCallback((file) => {
    if (file) {
      const url = createVideoUrl(file);
      loadVideo(url);
      onVideoTitleChange(file.name.replace(/\.[^/.]+$/, ''));
      requestAnimationFrame(() => {
        if (videoRef.current) {
          handleVideoAutoplay(videoRef.current);
        }
      });
    }
  }, [loadVideo, onVideoTitleChange]);

  // Expose handleOpenFile and handleOpenUrl methods to parent component
  React.useImperativeHandle(onOpenFileRef, () => ({
    handleOpenFile,
    handleOpenUrl
  }), [handleOpenFile, handleOpenUrl]);

  const handlePlayPause = useCallback(() => {
    togglePlay();
    showPlaybackFeedback(playerRef.current, !isPlayingRef.current);
  }, [togglePlay]);

  const handleSkipBackward = useCallback(() => {
    skipBackward(UI_CONSTANTS.SKIP_SECONDS);
    showSkipFeedback(playerRef.current, false);
  }, [skipBackward]);

  const handleSkipForward = useCallback(() => {
    skipForward(UI_CONSTANTS.SKIP_SECONDS);
    showSkipFeedback(playerRef.current, true);
  }, [skipForward]);

  const handleVolumeToggle = useCallback(() => {
    toggleMute();
    showVolumeFeedback(playerRef.current, !isMutedRef.current);
  }, [toggleMute]);

  // Handle video click - single click for play/pause, double click for fullscreen
  const handleVideoClick = useCallback((e) => {
    // Ignore clicks if context menu is closing
    if (contextMenuClosingRef.current) {
      contextMenuClosingRef.current = false;
      return;
    }

    if (clickTimeout.current) {
      // Double click detected
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      toggleFullscreen();
    } else {
      // Wait to see if it's a double click
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        handlePlayPause();
      }, 250); // 250ms delay to detect double click
    }
  }, [toggleFullscreen, handlePlayPause]);

  const handleExitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      toggleFullscreen();
    }
  }, [toggleFullscreen]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    contextMenuClosingRef.current = true;
    setContextMenu(null);
    // Reset the flag after a short delay
    setTimeout(() => {
      contextMenuClosingRef.current = false;
    }, 100);
  }, []);

  // Context menu action handlers
  const handleOpenFileFromContext = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      handleOpenFile(file);
    }
  }, [handleOpenFile]);

  const handleOpenUrlFromContext = useCallback(() => {
    setIsUrlModalOpen(true);
  }, []);

  const handleCloseUrlModal = useCallback(() => {
    setIsUrlModalOpen(false);
  }, []);

  const handleUrlSubmit = useCallback((url) => {
    if (url) {
      handleOpenUrl(url);
    }
  }, [handleOpenUrl]);

  const contextMenuActions = {
    'play-pause': handlePlayPause,
    'open-file': handleOpenFileFromContext,
    'open-url': handleOpenUrlFromContext,
    'fullscreen': toggleFullscreen,
    'fit-screen': toggleFitMode,
    'playback-speed': () => {
      // This will be handled by submenu later
      console.log('Playback speed submenu');
    },
    'settings': () => {
      // Settings action - can be implemented later
      console.log('Settings clicked');
    },
  };

  return (
    <div className="player" id="player" ref={playerRef}>
      <input 
        ref={fileInputRef}
        type="file" 
        accept={SUPPORTED_VIDEO_FORMATS} 
        style={{ display: 'none' }} 
        aria-hidden="true" 
        onChange={handleFileInputChange}
      />
      
      <video
        ref={videoRef}
        className={`w-full max-h-full ${isFitToScreen ? 'object-cover h-full' : 'object-contain h-auto'}`}
        preload="metadata"
        playsInline
        onClick={handleVideoClick}
        onContextMenu={handleContextMenu}
      />

      {!hasVideo && (
        <div 
          className="no-video-message"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '32px',
            fontFamily: '"Space Mono", monospace',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          Open any video to play
        </div>
      )}

      <div className={`controls-overlay ${showControls ? 'is-visible' : ''}`} />
      <div className={`title-overlay ${showControls ? 'is-visible' : ''}`} />

      {hasVideo && videoTitle && (
        <div className={`controls-title ${showControls ? '' : 'is-hidden'}`}>
          <button className="control-btn title-exit-btn" onClick={handleExitFullscreen} aria-label="Exit fullscreen">
            <i className="ti ti-arrow-left" />
          </button>
          <span className="controls-title-text">{videoTitle}</span>
        </div>
      )}

      <div className={`controls ${showControls ? '' : 'is-hidden'}`}>
        <ProgressBar
          videoRef={videoRef}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          onProgressClick={handleProgressClick}
          formatTime={formatTime}
          previewEnabled={previewEnabled}
          onInteractionChange={setIsInteracting}
        />

        <div className="controls-row">
          <div className="left-controls">
            <button className="control-btn" onClick={handleSkipBackward}>
              <i className="ti ti-chevrons-left small-icon" />
            </button>

            <button className="control-btn big-btn" onClick={handlePlayPause}>
              <i className={`ti ${isPlaying ? 'ti-player-pause-filled' : 'ti-player-play-filled'} small-icon`} />
            </button>

            <button className="control-btn" onClick={handleSkipForward}>
              <i className="ti ti-chevrons-right small-icon" />
            </button>

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVideoVolume}
              onToggleMute={handleVolumeToggle}
              onInteractionChange={setIsInteracting}
            />
          </div>

          <div className="right-controls">
            <button 
              className="control-btn"
              onClick={toggleFitMode}
            >
              <i className="ti ti-arrows-maximize small-icon" />
            </button>

            <SettingsButton />

            <button className="control-btn fullscreen-btn" onClick={toggleFullscreen}>
              <i className="ti ti-maximize small-icon" />
            </button>
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          actions={contextMenuActions}
        />
      )}

      <UrlModal 
        isOpen={isUrlModalOpen}
        onClose={handleCloseUrlModal}
        onSubmit={handleUrlSubmit}
      />
    </div>
  );
};

export default VideoPlayer;
