import React, { useState, useRef, useEffect, useCallback } from 'react';
import VideoPreview from './VideoPreview';
import '../styles/ProgressBar.css';

const ProgressBar = ({ videoRef, currentTime, duration, buffered, onProgressClick, formatTime, previewEnabled = false, onInteractionChange }) => {
  const [hoverTime, setHoverTime] = useState(null);
  const [optimisticPercentage, setOptimisticPercentage] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const [isNearSeekbar, setIsNearSeekbar] = useState(false);
  const progressRef = useRef(null);
  const isScrubbing = useRef(false);
  const HOVER_PADDING_PX = 8; // increases vertical hover tolerance above/below the bar

  const hasValidDuration = duration && isFinite(duration) && duration > 0;

  const currentPercentage = hasValidDuration ? (currentTime / duration) * 100 : 0;
  const displayPercentage = optimisticPercentage !== null ? optimisticPercentage : currentPercentage;
  const bufferedPercentage = hasValidDuration ? (buffered / duration) * 100 : 0;

  // When a new video loads, reset any optimistic scrubbing state
  useEffect(() => {
    setOptimisticPercentage(null);
  }, [duration]);

  // When not scrubbing, sync the optimistic percentage back to the real video time
  useEffect(() => {
    if (!isScrubbing.current && optimisticPercentage !== null && Math.abs(currentPercentage - optimisticPercentage) < 1) {
      setOptimisticPercentage(null);
    }
  }, [currentTime, optimisticPercentage, currentPercentage]);

  const getRatio = useCallback((e) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }, []);

  const handleClick = useCallback((e) => {
    const ratio = getRatio(e);
    setOptimisticPercentage(ratio * 100);
    if (hasValidDuration) {
      onProgressClick(ratio);
    }
  }, [hasValidDuration, getRatio, onProgressClick]);

  const handleScrubStart = useCallback((e) => {
    // Prefer Pointer Events when available
    if (e.pointerId !== undefined && e.currentTarget?.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
    isScrubbing.current = true;
    onInteractionChange?.(true);
    const ratio = getRatio(e);
    setOptimisticPercentage(ratio * 100);
    // Prevent text selection/drag side-effects
    e.preventDefault?.();
    e.stopPropagation?.();
  }, [getRatio, onInteractionChange]);

  const handleScrubEnd = useCallback(() => {
    if (isScrubbing.current) {
      isScrubbing.current = false;
      onInteractionChange?.(false);
      if (optimisticPercentage !== null && hasValidDuration) {
        onProgressClick(optimisticPercentage / 100);
      }
      // After scrubbing, let the optimistic sync handle resetting the percentage
    }
  }, [optimisticPercentage, onProgressClick, hasValidDuration, onInteractionChange]);

  // Handles both scrubbing and hover-with-tolerance
  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (!progressRef.current) return;

      if (isScrubbing.current) {
        const ratio = getRatio(e);
        const time = (duration || 0) * ratio;
        setHoverTime(time);
        setTooltipPosition(ratio * 100);
        setOptimisticPercentage(ratio * 100);
        return;
      }

      const rect = progressRef.current.getBoundingClientRect();
      const withinX = e.clientX >= rect.left && e.clientX <= rect.right;
      const withinY = e.clientY >= rect.top - HOVER_PADDING_PX && e.clientY <= rect.bottom + HOVER_PADDING_PX;

      if (withinX && withinY) {
        setIsNearSeekbar(true);
        if (previewEnabled) {
          setShowTooltip(true);
          const ratio = getRatio(e);
          const time = (duration || 0) * ratio;
          setHoverTime(time);
          setTooltipPosition(ratio * 100);
        }
      } else {
        setIsNearSeekbar(false);
        setShowTooltip(false);
        setHoverTime(null);
      }
    };

    const endScrubSafely = () => handleScrubEnd();
    const handlePointerCancelOrOut = (e) => {
      // If pointer left the window (relatedTarget is null) or was canceled, end scrubbing
      if (isScrubbing.current && (!e.relatedTarget || e.type === 'pointercancel')) {
        handleScrubEnd();
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerup', endScrubSafely, { passive: true });
    window.addEventListener('pointercancel', handlePointerCancelOrOut, { passive: true });
    window.addEventListener('pointerout', handlePointerCancelOrOut, { passive: true });
    window.addEventListener('blur', endScrubSafely);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleScrubEnd();
    });

    // Fallback for environments without Pointer Events
    window.addEventListener('mousemove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('mouseup', endScrubSafely, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', endScrubSafely);
      window.removeEventListener('pointercancel', handlePointerCancelOrOut);
      window.removeEventListener('pointerout', handlePointerCancelOrOut);
      window.removeEventListener('blur', endScrubSafely);
      document.removeEventListener('visibilitychange', () => {
        if (document.hidden) handleScrubEnd();
      });
      window.removeEventListener('mousemove', handleGlobalPointerMove);
      window.removeEventListener('mouseup', endScrubSafely);
    };
  }, [getRatio, handleScrubEnd, duration, previewEnabled]);

  const isInteracting = optimisticPercentage !== null;
  const displayTime = isInteracting && hasValidDuration ? (duration * optimisticPercentage) / 100 : currentTime;

  return (
    <>
      <div className="progress-wrap">
        <div className="time-left">{formatTime(displayTime)}</div>
        <div
          className="progress-hitbox"
          onClick={handleClick}
          onPointerDown={handleScrubStart}
        >
          <div
            ref={progressRef}
            className={`progress relative flex items-center h-2 bg-white bg-opacity-10 cursor-pointer transition-height ${isNearSeekbar ? 'expanded' : ''}`}
          >
            <div
              className="buffered absolute left-0 top-0 bottom-0 bg-white bg-opacity-15"
              style={{ width: `${bufferedPercentage}%` }}
            />
            <div
              className="filled absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent to-blue-300"
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
      {previewEnabled && videoRef.current?.src && <VideoPreview videoRef={videoRef} hoverTime={hoverTime} progressRef={progressRef} />}
    </>
  );
};

export default ProgressBar;