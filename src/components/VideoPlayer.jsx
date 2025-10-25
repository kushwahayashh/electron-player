import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import SettingsButton from './SettingsButton';
import { showPlaybackFeedback, showVolumeFeedback, showSkipFeedback } from '../utils/videoFeedback';
import { KEYBOARD_SHORTCUTS, UI_CONSTANTS } from '../utils/constants';
import { extractFileName, createVideoUrl, handleVideoAutoplay } from '../utils/fileUtils';
import '../styles/VideoPlayer.css';
import '../styles/feedback.css';

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
  const playerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const isMutedRef = useRef(isMuted);
  const clickTimeout = useRef(null);

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

  // Expose handleOpenFile method to parent component
  React.useImperativeHandle(onOpenFileRef, () => ({
    handleOpenFile
  }), []);

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

  return (
    <div className="player" id="player" ref={playerRef}>
      <video
        ref={videoRef}
        className={`w-full max-h-full ${isFitToScreen ? 'object-cover h-full' : 'object-contain h-auto'}`}
        preload="metadata"
        playsInline
        onClick={handleVideoClick}
        onContextMenu={(e) => e.preventDefault()}
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

      <div className={`controls-overlay ${showControls ? 'visible' : ''}`} />

      <div className={`controls ${showControls ? '' : 'hidden'}`}>
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
            <button className="control-btn" onClick={handleSkipBackward} title={`Back ${UI_CONSTANTS.SKIP_SECONDS}s`}>
              <i className="ti ti-chevrons-left small-icon" />
            </button>

            <button className="control-btn big-btn" onClick={handlePlayPause} title="Play / Pause">
              <i className={`ti ${isPlaying ? 'ti-player-pause-filled' : 'ti-player-play-filled'} small-icon`} />
            </button>

            <button className="control-btn" onClick={handleSkipForward} title={`Forward ${UI_CONSTANTS.SKIP_SECONDS}s`}>
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
              title="Toggle Fit to Screen"
            >
              <i className="ti ti-arrows-maximize small-icon" />
            </button>

            <SettingsButton />

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
