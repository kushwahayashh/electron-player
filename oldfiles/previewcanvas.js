/**
 * Implements a video frame preview feature on progress bar hover.
 * This module requires a main video element, a progress bar element,
 * and a container element to display the preview.
 */


// --- Configuration (These could be passed as options to the init function) ---
const PREVIEW_WIDTH = 320; // Desired width of the preview thumbnail
const PREVIEW_HEIGHT = 180; // Desired height of the preview thumbnail
// --- End Configuration ---

let mainVideo = null;
let progressBar = null;
let previewContainer = null;
let previewVideo = null;
let previewcanvas = null;
let ctx = null;
let isSeekingForPreview = false;
let previewSeekId = null;
let previewSeekTimeout = null; // Add timeout for seek operations

/**
 * Initializes the video preview feature.
 * @param {HTMLVideoElement} mainVideoElement - The main video player element.
 * @param {HTMLElement} progressBarElement - The progress bar element to attach hover listeners to.
 * @param {HTMLElement} previewContainerElement - The element where the preview will be displayed.
 */
export function initVideoPreview(mainVideoElement, progressBarElement, previewContainerElement) {
  if (!mainVideoElement || !progressBarElement || !previewContainerElement) {
    console.error("VideoPreview: Missing required elements for initialization.");
    return;
  }

  mainVideo = mainVideoElement;
  progressBar = progressBarElement;
  previewContainer = previewContainerElement;

  // Create hidden preview video element
  previewVideo = document.createElement('video');
  previewVideo.src = mainVideo.src; // Assumes same source. Handle crossorigin if needed.
  previewVideo.preload = 'metadata'; // Load metadata to get duration quickly
  previewVideo.muted = true; // Mute to avoid audio conflicts
  previewVideo.style.display = 'none';
  // Add additional attributes for better compatibility
  previewVideo.setAttribute('crossorigin', 'anonymous');
  previewVideo.setAttribute('preload', 'auto');
  // Append to body or a specific container to ensure it loads
  document.body.appendChild(previewVideo); 

  // Create canvas for drawing preview frames
  previewcanvas = document.createElement('canvas');
  previewcanvas.width = PREVIEW_WIDTH;
  previewcanvas.height = PREVIEW_HEIGHT;
  previewcanvas.style.display = 'none'; // Initially hidden
  previewcanvas.style.border = '2px solid #ccc'; // Basic styling, can be overridden by CSS
  previewcanvas.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)'; // Basic styling
  previewcanvas.style.transition = 'left 0.1s linear, opacity 0.2s ease-in-out'; // Add transition for smooth movement and fade
  previewcanvas.style.opacity = '0'; // Start with transparent
  previewContainer.appendChild(previewcanvas);
  ctx = previewcanvas.getContext('2d');

  // Attach event listeners to the preview video
  previewVideo.addEventListener('seeked', () => {
    if (isSeekingForPreview) {
      drawPreviewFrame();
      // Reset flag as seek is complete for preview
      isSeekingForPreview = false;
      // Clear any timeout since seek completed successfully
      if (previewSeekTimeout) {
        clearTimeout(previewSeekTimeout);
        previewSeekTimeout = null;
      }
    }
  });

  // Handle video errors
  previewVideo.addEventListener('error', (e) => {
    console.error("VideoPreview: Error loading preview video:", e);
    isSeekingForPreview = false;
    if (previewSeekTimeout) {
      clearTimeout(previewSeekTimeout);
      previewSeekTimeout = null;
    }
    if (previewcanvas) {
       previewcanvas.style.display = 'none';
    }
  });
  
  // Handle stalled events (when seeking fails)
  previewVideo.addEventListener('stalled', () => {
    if (isSeekingForPreview) {
      console.warn("VideoPreview: Preview video stalled during seek");
      // Reset flag but don't hide canvas immediately
      isSeekingForPreview = false;
      if (previewSeekTimeout) {
        clearTimeout(previewSeekTimeout);
        previewSeekTimeout = null;
      }
    }
  });
  
  // Handle loadeddata event
  previewVideo.addEventListener('loadeddata', () => {
    console.log("VideoPreview: Preview video loaded data");
  });

  // Attach event listeners to the progress bar
  attachEventListeners();

  console.log("VideoPreview: Feature initialized.");
}

/**
 * Updates the source of the preview video.
 * @param {string} src - The new source URL for the preview video.
 */
/**
 * Updates the source of the preview video.
 * @param {string} src - The new source URL for the preview video.
 */
export function updatePreviewSource(src) {
  if (previewVideo) {
    // Revoke old object URL if it was a blob
    if (previewVideo.src && previewVideo.src.startsWith('blob:')) {
      URL.revokeObjectURL(previewVideo.src);
    }
    
    // Update preview video source
    previewVideo.src = src;
    
    // Match playback rate with main video if available
    if (mainVideo) {
      previewVideo.playbackRate = mainVideo.playbackRate;
    }
    
    // Load the video to ensure it's ready
    previewVideo.load();
  }
}

/**
 * Attaches mousemove and mouseleave event listeners to the progress bar.
 */
function attachEventListeners() {
  if (!progressBar) return;

  progressBar.addEventListener('mousemove', handleMouseMove);
  progressBar.addEventListener('mouseleave', handleMouseLeave);
}

/**
 * Handles mousemove event on the progress bar to trigger preview generation.
 * @param {MouseEvent} e - The mousemove event object.
 */
function handleMouseMove(e) {
  if (!mainVideo || !previewVideo) return;

  // Cancel the previous scheduled seek if it hasn't run yet (Throttling)
  if (previewSeekId) {
    cancelAnimationFrame(previewSeekId);
  }

  // Schedule the seek for the next animation frame
  previewSeekId = requestAnimationFrame(() => {
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    // Clamp pos between 0 and 1 to handle edge cases
    const clampedPos = Math.max(0, Math.min(1, pos));
    const hoverTime = clampedPos * mainVideo.duration;

    if (!isNaN(hoverTime)) { // Ensure hoverTime is valid
      // Set seeking flag
      isSeekingForPreview = true;
      
      // Clear any previous timeout
      if (previewSeekTimeout) {
        clearTimeout(previewSeekTimeout);
      }
      // Set a timeout to handle cases where seeked event doesn't fire
      previewSeekTimeout = setTimeout(() => {
        if (isSeekingForPreview) {
          console.warn("VideoPreview: Seek operation timed out");
          isSeekingForPreview = false;
          // Try to draw frame anyway with current video state
          drawPreviewFrame();
        }
      }, 500); // 500ms timeout for seek operation
      
      // Set the preview video time
      previewVideo.currentTime = hoverTime;
    }
    updatePreviewPosition(e);
    previewSeekId = null; // Reset ID after scheduling
  });
}

/**
 * Handles mouseleave event on the progress bar to hide the preview.
 */
function handleMouseLeave() {
  // Cancel any pending animation frame
  if (previewSeekId) {
    cancelAnimationFrame(previewSeekId);
    previewSeekId = null;
  }
  
  // Clear any timeout
  if (previewSeekTimeout) {
    clearTimeout(previewSeekTimeout);
    previewSeekTimeout = null;
  }
  
  isSeekingForPreview = false; // Reset flag on leave

  // Hide the preview canvas
  if (previewcanvas) {
    previewcanvas.style.opacity = '0';
  }
}

/**
 * Positions the preview canvas near the mouse cursor.
 * @param {MouseEvent} e - The mousemove event object.
 */
function updatePreviewPosition(e) {
  if (!previewcanvas || !progressBar) return;

  const progressRect = progressBar.getBoundingClientRect();
  const cursorX = e.clientX;

  // Position canvas centered below the cursor or within progress bar bounds
  const canvasWidth = previewcanvas.width;
  let leftPos = cursorX - canvasWidth / 2;

  // Boundary checks to keep preview within viewport relative to progress bar
  if (leftPos < progressRect.left) {
    leftPos = progressRect.left;
  } else if (leftPos + canvasWidth > progressRect.right) {
    leftPos = progressRect.right - canvasWidth;
  }

  previewcanvas.style.position = 'fixed'; // Use fixed for viewport positioning
  previewcanvas.style.left = `${leftPos}px`;
  // Position above the progress bar
  previewcanvas.style.top = `${progressRect.top - previewcanvas.height - 10}px`; 
}

/**
 * Draws the current frame of the preview video onto the canvas and displays it.
 */
/**
 * Draws the current frame of the preview video onto the canvas and displays it.
 */
function drawPreviewFrame() {
  if (!previewVideo || !ctx || !previewcanvas) return;

  try {
    // Check if video is ready to be drawn
    if (previewVideo.readyState < 2) { // HAVE_CURRENT_DATA
      console.warn("VideoPreview: Preview video not ready for drawing");
      return;
    }
    
    // Ensure canvas has correct dimensions
    previewcanvas.width = PREVIEW_WIDTH;
    previewcanvas.height = PREVIEW_HEIGHT;
    
    // Draw the video frame onto the canvas, scaling it down
    ctx.drawImage(previewVideo, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    
    // Show the canvas
    previewcanvas.style.display = 'block';
    // Use a timeout to allow the display property to be applied before changing opacity
    setTimeout(() => {
        previewcanvas.style.opacity = '1';
    }, 10);
  } catch (err) {
    console.error("VideoPreview: Error drawing frame to canvas:", err);
    // Hide canvas on error
    if (previewcanvas) {
      previewcanvas.style.display = 'none';
    }
  }
}

// Cleanup function (optional, if needed to remove elements/listeners)
// export function destroyVideoPreview() { ... }