
import React, { useRef, useEffect } from 'react';

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;

const VideoPreview = ({ videoRef, hoverTime, progressRef }) => {
  const previewCanvasRef = useRef(null);
  const previewVideoRef = useRef(null);

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

  useEffect(() => {
    if (hoverTime === null) {
      if (previewCanvasRef.current) {
        previewCanvasRef.current.style.opacity = '0';
      }
      return;
    }

    const previewVideo = previewVideoRef.current;
    const previewCanvas = previewCanvasRef.current;
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
      previewCanvas.style.opacity = '1';
    };

    const seeked = () => {
      drawImageWithAspectRatio();
    };

    previewVideo.addEventListener('seeked', seeked);
    previewVideo.currentTime = hoverTime;

    if (progressRef.current && videoRef.current) {
        const progressRect = progressRef.current.getBoundingClientRect();
        const hoverRatio = hoverTime / videoRef.current.duration;
        const tooltipLeft = progressRect.left + progressRect.width * hoverRatio;
        
        let left = tooltipLeft - PREVIEW_WIDTH / 2;
        if (left < 0) left = 0;
        if (left + PREVIEW_WIDTH > window.innerWidth) {
          left = window.innerWidth - PREVIEW_WIDTH;
        }

        previewCanvas.style.left = `${left}px`;
        previewCanvas.style.top = `${progressRect.top - PREVIEW_HEIGHT - 10}px`;
    }

    return () => {
      previewVideo.removeEventListener('seeked', seeked);
    };
  }, [hoverTime, videoRef, progressRef]);

  return (
    <canvas
      ref={previewCanvasRef}
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      className="fixed z-10 opacity-0 transition-opacity duration-200 pointer-events-none"
      style={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        border: '2px solid #ccc',
      }}
    />
  );
};

export default VideoPreview;
