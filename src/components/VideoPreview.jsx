
import React, { useRef, useEffect } from 'react';

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;
const PREVIEW_DELAY_MS = 250;
const PREVIEW_OFFSET_Y = 10;

const VideoPreview = ({ videoRef, hoverTime, progressRef }) => {
  const previewCanvasRef = useRef(null);
  const previewVideoRef = useRef(null);
  const delayTimerRef = useRef(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const previewVideo = document.createElement('video');
    previewVideo.width = PREVIEW_WIDTH;
    previewVideo.height = PREVIEW_HEIGHT;
    previewVideo.muted = true;
    previewVideo.style.display = 'none';
    previewVideo.crossOrigin = 'anonymous';
    previewVideo.preload = 'auto';
    previewVideo.playsinline = true;
    document.body.appendChild(previewVideo);
    previewVideoRef.current = previewVideo;

    return () => {
      document.body.removeChild(previewVideo);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current?.src) {
      previewVideoRef.current.src = videoRef.current.src;
    }
  }, [videoRef.current?.src]);

  // Main effect: handles preview display with initial delay to prevent flicker
  // - First hover: 250ms delay before showing
  // - Once visible: updates immediately as cursor moves
  // - On leave: hides instantly and resets for next hover
  useEffect(() => {
    const hidePreview = () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      
      isVisibleRef.current = false;
      if (previewCanvasRef.current) {
        previewCanvasRef.current.style.opacity = '0';
      }
    };

    if (hoverTime === null) {
      hidePreview();
      return;
    }

    const previewVideo = previewVideoRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (!previewVideo || !previewCanvas) return;
    
    const ctx = previewCanvas.getContext('2d');

    const drawImageWithAspectRatio = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

      const videoWidth = previewVideo.videoWidth;
      const videoHeight = previewVideo.videoHeight;
      if (!videoWidth || !videoHeight) return;

      const videoAspect = videoWidth / videoHeight;
      const canvasAspect = PREVIEW_WIDTH / PREVIEW_HEIGHT;

      let drawWidth = PREVIEW_WIDTH;
      let drawHeight = PREVIEW_HEIGHT;
      let x = 0;
      let y = 0;

      if (videoAspect > canvasAspect) {
        drawHeight = PREVIEW_WIDTH / videoAspect;
        y = (PREVIEW_HEIGHT - drawHeight) / 2;
      } else {
        drawWidth = PREVIEW_HEIGHT * videoAspect;
        x = (PREVIEW_WIDTH - drawWidth) / 2;
      }

      ctx.drawImage(previewVideo, x, y, drawWidth, drawHeight);
      
      if (isVisibleRef.current) {
        previewCanvas.style.opacity = '1';
      }
    };

    const seeked = () => {
      drawImageWithAspectRatio();
    };

    // Draw when a video frame is ready (more responsive than only relying on 'seeked')
    const requestFrameDraw = () => {
      // @ts-ignore - requestVideoFrameCallback not in all TS DOM libs
      if (typeof previewVideo.requestVideoFrameCallback === 'function') {
        // @ts-ignore
        previewVideo.requestVideoFrameCallback(() => {
          drawImageWithAspectRatio();
        });
      }
    };

    const updatePreviewPosition = () => {
      if (!progressRef.current || !videoRef.current) return;
      
      const progressRect = progressRef.current.getBoundingClientRect();
      const hoverRatio = hoverTime / videoRef.current.duration;
      const centerX = progressRect.left + progressRect.width * hoverRatio;
      
      // Calculate left position, centered on cursor
      let left = centerX - PREVIEW_WIDTH / 2;
      
      // Add padding from edges (10px)
      const edgePadding = 10;
      const maxLeft = window.innerWidth - PREVIEW_WIDTH - edgePadding;
      
      // Clamp to viewport with padding
      left = Math.max(edgePadding, Math.min(left, maxLeft));

      previewCanvas.style.left = `${left}px`;
      previewCanvas.style.top = `${progressRect.top - PREVIEW_HEIGHT - PREVIEW_OFFSET_Y}px`;
    };

    if (!isVisibleRef.current && !delayTimerRef.current) {
      delayTimerRef.current = setTimeout(() => {
        isVisibleRef.current = true;
        delayTimerRef.current = null;
        if (previewCanvasRef.current) {
          previewCanvasRef.current.style.opacity = '1';
        }
      }, PREVIEW_DELAY_MS);
    }

    updatePreviewPosition();
    previewVideo.addEventListener('seeked', seeked);
    
    try {
      if (typeof previewVideo.fastSeek === 'function') {
        previewVideo.fastSeek(hoverTime);
      } else {
        previewVideo.currentTime = hoverTime;
      }
    } catch {
      previewVideo.currentTime = hoverTime;
    }
    
    requestFrameDraw();

    return () => {
      previewVideo.removeEventListener('seeked', seeked);
    };
  }, [hoverTime, videoRef, progressRef]);

  return (
    <canvas
      ref={previewCanvasRef}
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      className="fixed z-10 opacity-0 pointer-events-none"
      style={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        border: '2px solid #ccc',
        transition: 'opacity 0.2s ease-in-out',
      }}
    />
  );
};

export default VideoPreview;
