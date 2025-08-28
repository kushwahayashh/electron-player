import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPreview from './VideoPreview';

const ProgressBar = ({ videoRef, currentTime, duration, buffered, onProgressClick, formatTime }) => {
  const [hoverTime, setHoverTime] = useState(null);
  const [optimisticPercentage, setOptimisticPercentage] = useState(null);
  const progressRef = useRef(null);
  const isScrubbing = useRef(false);

  const currentPercentage = duration ? (currentTime / duration) * 100 : 0;
  const displayPercentage = optimisticPercentage !== null ? optimisticPercentage : currentPercentage;
  const bufferedPercentage = duration ? (buffered / duration) * 100 : 0;

  // Sync optimistic percentage with real currentTime
  useEffect(() => {
    if (optimisticPercentage !== null && Math.abs(currentPercentage - optimisticPercentage) < 1) {
      setOptimisticPercentage(null);
    }
  }, [currentTime, optimisticPercentage, currentPercentage]);

  const getRatio = useCallback((e) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!duration) return;
    const ratio = getRatio(e);
    const time = duration * ratio;
    setHoverTime(time);

    if (isScrubbing.current) {
      setOptimisticPercentage(ratio * 100);
    }
  }, [duration, getRatio]);

  const handleMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleClick = useCallback((e) => {
    const ratio = getRatio(e);
    setOptimisticPercentage(ratio * 100);
    onProgressClick(ratio);
  }, [getRatio, onProgressClick]);

  const handleScrubStart = useCallback((e) => {
    isScrubbing.current = true;
    const ratio = getRatio(e);
    setOptimisticPercentage(ratio * 100);
  }, [getRatio]);

  const handleScrubEnd = useCallback(() => {
    if (isScrubbing.current) {
      isScrubbing.current = false;
      if (optimisticPercentage !== null) {
        onProgressClick(optimisticPercentage / 100);
      }
      setHoverTime(null);
    }
  }, [optimisticPercentage, onProgressClick]);

  // Global mouse events for scrubbing
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
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
  }, [handleMouseMove, handleScrubEnd]);

  const isInteracting = optimisticPercentage !== null;
  const displayTime = isInteracting ? (duration * optimisticPercentage) / 100 : currentTime;

  return (
    <>
      <div className="progress-wrap">
        <div className="time-left">{formatTime(displayTime)}</div>
        <div
          ref={progressRef}
          className="progress relative flex items-center h-2 bg-white bg-opacity-10 rounded cursor-pointer transition-height hover:h-2.5"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseDown={handleScrubStart}
          onMouseLeave={handleMouseLeave}
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
              transition: isInteracting ? 'none' : 'left 0.1s linear'
            }}
          />
        </div>
        <div className="time-right">{formatTime(duration)}</div>
      </div>
      <VideoPreview videoRef={videoRef} hoverTime={hoverTime} progressRef={progressRef} />
    </>
  );
};

export default ProgressBar;
