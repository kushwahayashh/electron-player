import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPreview from './VideoPreview';

const ProgressBar = ({ videoRef, currentTime, duration, buffered, onProgressClick, formatTime }) => {
  const [hoverTime, setHoverTime] = useState(null);
  const [optimisticPercentage, setOptimisticPercentage] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const progressRef = useRef(null);
  const hitboxRef = useRef(null);
  const isScrubbing = useRef(false);
  const HOVER_PADDING_PX = 16; // increases vertical hover tolerance above/below the bar

  const hasValidDuration = duration && isFinite(duration) && duration > 0;

  const currentPercentage = hasValidDuration ? (currentTime / duration) * 100 : 0;
  const displayPercentage = optimisticPercentage !== null ? optimisticPercentage : currentPercentage;
  const bufferedPercentage = hasValidDuration ? (buffered / duration) * 100 : 0;

  // Sync optimistic percentage with real currentTime
  useEffect(() => {
    if (optimisticPercentage !== null && Math.abs(currentPercentage - optimisticPercentage) < 1) {
      setOptimisticPercentage(null);
    }
  }, [currentTime, optimisticPercentage, currentPercentage]);

  // Reset optimistic percentage when a new video is loaded
  useEffect(() => {
    setOptimisticPercentage(null);
  }, [duration]);

  const getRatio = useCallback((e) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }, []);

  const handleMouseMove = useCallback((e) => {
    const ratio = getRatio(e);
    const time = (duration || 0) * ratio;
    setHoverTime(time);
    setTooltipPosition(ratio * 100);

    if (isScrubbing.current) {
      setOptimisticPercentage(ratio * 100);
    }
  }, [duration, getRatio]);

  const handleMouseLeave = useCallback(() => {
    // Do nothing here; we manage hide using global mousemove with tolerance
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleClick = useCallback((e) => {
    const ratio = getRatio(e);
    setOptimisticPercentage(ratio * 100);
    if (hasValidDuration) {
      onProgressClick(ratio);
    }
  }, [hasValidDuration, getRatio, onProgressClick]);

  const handleScrubStart = useCallback((e) => {
    isScrubbing.current = true;
    const ratio = getRatio(e);
    setOptimisticPercentage(ratio * 100);
  }, [getRatio]);

  const handleScrubEnd = useCallback(() => {
    if (isScrubbing.current) {
      isScrubbing.current = false;
      if (optimisticPercentage !== null && hasValidDuration) {
        onProgressClick(optimisticPercentage / 100);
      }
      setHoverTime(null);
    }
  }, [optimisticPercentage, onProgressClick, hasValidDuration]);

  // Global mouse events for scrubbing and tolerant hover near the bar
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const progressEl = progressRef.current;
      if (!progressEl) return;
      const rect = progressEl.getBoundingClientRect();
      const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
      const withinY = e.clientY >= rect.top - HOVER_PADDING_PX && e.clientY <= rect.bottom + HOVER_PADDING_PX;

      if (withinX && withinY) {
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = (duration || 0) * ratio;
        setHoverTime(time);
        setTooltipPosition(ratio * 100);
        if (isScrubbing.current) {
          setOptimisticPercentage(ratio * 100);
        }
        setShowTooltip(true);
      } else if (!isScrubbing.current) {
        setHoverTime(null);
        setShowTooltip(false);
      }

      if (isScrubbing.current) {
        handleMouseMove(e);
      }
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleScrubEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleScrubEnd);
    };
  }, [handleMouseMove, handleScrubEnd, duration]);

  const isInteracting = optimisticPercentage !== null;
  const displayTime = isInteracting && hasValidDuration ? (duration * optimisticPercentage) / 100 : currentTime;

  return (
    <>
      <div className="progress-wrap">
        <div className="time-left">{formatTime(displayTime)}</div>
        <div
          ref={hitboxRef}
          className="progress-hitbox"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseDown={handleScrubStart}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={progressRef}
            className="progress relative flex items-center h-2 bg-white bg-opacity-10 rounded cursor-pointer transition-height hover:h-2.5"
          >
            <div
              className="buffered absolute left-0 top-0 bottom-0 bg-white bg-opacity-15 rounded"
              style={{ width: `${bufferedPercentage}%` }}
            />
            <div
              className="filled absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent to-blue-300 rounded"
              style={{
                width: `${displayPercentage}%`,
                transition: isInteracting ? 'none' : 'width 0.1s linear'
              }}
            />
            <div
              className="thumb absolute top-1/2 w-3.5 h-3.5 bg-white rounded-full shadow transform -translate-x-1/2 -translate-y-1/2 transition-width-height"
              style={{
                left: `${displayPercentage}%`,
                transition: isInteracting ? 'none' : 'left 0.1s linear, width var(--transition-smooth), height var(--transition-smooth)'
              }}
            />
            {/* Progress tooltip */}
            <div 
              className={`progress-tooltip ${showTooltip && hoverTime !== null ? 'visible' : ''}`}
              style={{ left: `${tooltipPosition}%` }}
            >
              {hoverTime !== null ? formatTime(hoverTime) : '0:00'}
            </div>
          </div>
        </div>
        <div className="time-right">{formatTime(duration)}</div>
      </div>
      <VideoPreview videoRef={videoRef} hoverTime={hoverTime} progressRef={progressRef} />
    </>
  );
};

export default ProgressBar;
