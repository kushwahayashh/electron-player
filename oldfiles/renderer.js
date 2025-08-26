// Import the video preview module
import { initVideoPreview, updatePreviewSource } from './previewcanvas.js';

class VideoPlayerController {
  constructor() {
    this.elements = {};
    this.initializeElements();
    this.initializeState();
    this.bindEvents();
    this.setupInitialState();
    // Initialize video preview after elements are set up
    this.initializeVideoPreview();
  }

  initializeElements() {
    const ids = [
      'player', 'video', 'controls', 'playPause', 'skipBack', 'skipForward',
      'muteBtn', 'fsBtn', 'fitBtn', 'backBtn', 'openFileBtn', 'progress',
      'filled', 'buffered', 'thumb', 'curTime', 'durTime', 'progressTooltip',
      'volume', 'volumeFilled', 'volumeThumb', 'fileInput', 'title', 'controlsOverlay'
    ];
    for (const id of ids) {
      this.elements[id] = document.getElementById(id);
    }
  }

  initializeState() {
    this.hideTimeout = null;
    this.isScrubbing = false;
    this.HIDE_DELAY = 3000;
    this.SKIP_TIME = 10;
    this.KEYBOARD_SKIP_TIME = 5;
  }

  bindEvents() {
    this.bindVideoEvents();
    this.bindControlEvents();
    this.bindVolumeEvents();
    this.bindProgressEvents();
    this.bindFileInputEvents();
    this.bindPlayerInteractionEvents();
    this.bindKeyboardEvents();
    this.bindElectronEvents();
  }

  bindVideoEvents() {
    this.elements.video.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
    this.elements.video.addEventListener('timeupdate', () => this.updateProgress());
    this.elements.video.addEventListener('play', () => this.updatePlayUI());
    this.elements.video.addEventListener('pause', () => this.updatePlayUI());
    this.elements.video.addEventListener('progress', () => this.updateBuffered());
    this.elements.video.addEventListener('ended', () => this.updatePlayUI());
    this.elements.video.addEventListener('click', () => this.togglePlay());
    this.elements.video.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  bindControlEvents() {
    this.elements.playPause.addEventListener('click', () => this.togglePlay());
    this.elements.skipBack.addEventListener('click', () => this.handleSkipBackward());
    this.elements.skipForward.addEventListener('click', () => this.handleSkipForward());
    this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
    this.elements.fsBtn.addEventListener('click', () => this.toggleFullscreen());
    this.elements.fitBtn.addEventListener('click', () => this.toggleFitToScreen());
    this.elements.backBtn.addEventListener('click', () => this.handleBack());
    this.elements.openFileBtn.addEventListener('click', () => this.openFile());
  }

  bindVolumeEvents() {
    this.elements.volume.addEventListener('input', (e) => this.handleVolumeChange(e));
  }

  bindProgressEvents() {
    this.elements.progress.addEventListener('click', (e) => this.handleProgressClick(e));
    this.elements.progress.addEventListener('mousemove', (e) => this.handleProgressHover(e));
    this.elements.progress.addEventListener('mouseenter', (e) => this.showProgressTooltip(e));
    this.elements.progress.addEventListener('mouseleave', () => this.hideProgressTooltip());
    this.elements.thumb.addEventListener('pointerdown', (e) => this.startScrubbing(e));
  }

  bindFileInputEvents() {
    this.elements.fileInput.addEventListener('change', (e) => this.handleFileChange(e));
  }

  bindPlayerInteractionEvents() {
    this.elements.player.addEventListener('mousemove', () => this.showControls());
    this.elements.player.addEventListener('mouseenter', () => this.showControls());
    this.elements.player.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  bindElectronEvents() {
    if (window.electronAPI) {
      window.electronAPI.onLoadVideoFile((event, filePath) => {
        this.loadVideoFile(filePath);
      });
    }
  }

  setupInitialState() {
    this.elements.video.volume = parseFloat(this.elements.volume.value);
    this.updateVolIcon();
    this.updateVolumeUI();
    this.showControls();
    setTimeout(() => this.updatePlayUI(), 50);
  }

  // Initialize the video preview feature
  initializeVideoPreview() {
    // Wait for the next tick to ensure the DOM is fully ready and elements are populated
    setTimeout(() => {
      if (this.elements.video && this.elements.progress) {
        // Create a container for the preview, appended to the player for correct positioning
        const previewContainer = document.createElement('div');
        previewContainer.id = 'video-preview-container';
        // Basic styles to ensure it's positioned correctly, can be overridden by main CSS
        previewContainer.style.position = 'fixed';
        previewContainer.style.zIndex = '14'; // Below tooltip
        this.elements.player.appendChild(previewContainer);

        // Initialize the preview feature
        initVideoPreview(this.elements.video, this.elements.progress, previewContainer);
        
        // Update preview video source when main video source changes
        const updatePreviewSourceHandler = () => {
          updatePreviewSource(this.elements.video.src);
        };
        
        // Listen for source changes on the main video
        this.elements.video.addEventListener('loadstart', updatePreviewSourceHandler);
      } else {
        console.warn('VideoPlayerController: Could not initialize video preview, required elements missing.');
      }
    }, 0);
  }

  formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  togglePlay() {
    if (this.elements.video.paused) {
      this.elements.video.play().catch(() => {});
      this.showPlaybackFeedback(true);
    } else {
      this.elements.video.pause();
      this.showPlaybackFeedback(false);
    }
  }

  handleSkipBackward() {
    this.elements.video.currentTime = Math.max(0, this.elements.video.currentTime - this.SKIP_TIME);
    this.updateProgress();
  }

  handleSkipForward() {
    this.elements.video.currentTime = Math.min(
      this.elements.video.duration || Infinity,
      this.elements.video.currentTime + this.SKIP_TIME
    );
    this.updateProgress();
  }

  toggleMute() {
    this.elements.video.muted = !this.elements.video.muted;
    if (!this.elements.video.muted && this.elements.video.volume === 0) {
      this.elements.video.volume = 0.6;
      this.elements.volume.value = 0.6;
    }
    this.updateVolIcon();
    this.showVolumeFeedback(this.elements.video.muted);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.elements.player.requestFullscreen?.() || this.elements.player.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  toggleFitToScreen() {
    const currentFit = this.elements.video.style.objectFit || 'contain';
    if (currentFit === 'contain') {
      this.elements.video.style.objectFit = 'cover';
      this.elements.video.style.height = '100%';
      this.elements.fitBtn.style.opacity = '1';
      this.elements.fitBtn.title = 'Show Full Video (with bars)';
    } else {
      this.elements.video.style.objectFit = 'contain';
      this.elements.video.style.height = 'auto';
      this.elements.fitBtn.style.opacity = '0.8';
      this.elements.fitBtn.title = 'Toggle Fit to Screen';
    }
  }

  updatePlayUI() {
    const playEl = document.getElementById('playIcon');
    const pauseEl = document.getElementById('pauseIcon');

    if (this.elements.video.paused) {
      if (playEl) playEl.style.display = 'inline-block';
      if (pauseEl) pauseEl.style.display = 'none';
    } else {
      if (playEl) playEl.style.display = 'none';
      if (pauseEl) pauseEl.style.display = 'inline-block';
    }
  }

  updateVolIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    const muteIcon = document.getElementById('muteIcon');
    
    if (this.elements.video.muted || this.elements.video.volume === 0) {
      if (volumeIcon) volumeIcon.style.display = 'none';
      if (muteIcon) muteIcon.style.display = 'inline-block';
    } else {
      if (volumeIcon) volumeIcon.style.display = 'inline-block';
      if (muteIcon) muteIcon.style.display = 'none';
    }
  }

  updateVolumeUI() {
    const volume = this.elements.video.volume || 0;
    const percentage = volume * 100;

    if (this.elements.volumeFilled) {
      this.elements.volumeFilled.style.width = `${percentage}%`;
    }
    if (this.elements.volumeThumb) {
      this.elements.volumeThumb.style.left = `${percentage}%`;
    }
  }

  updateProgress() {
    if (this.isScrubbing) return;

    const current = this.elements.video.currentTime || 0;
    const duration = this.elements.video.duration || 0;
    const percentage = duration ? (current / duration) * 100 : 0;

    this.elements.filled.style.width = `${percentage}%`;
    this.elements.thumb.style.left = `${percentage}%`;
    this.elements.curTime.textContent = this.formatTime(current);
  }

  updateBuffered() {
    try {
      const buffered = this.elements.video.buffered;
      const duration = this.elements.video.duration || 0;

      if (!buffered || buffered.length === 0 || !duration) {
        this.elements.buffered.style.width = '0%';
        return;
      }

      const end = buffered.end(buffered.length - 1);
      const percentage = Math.min(100, (end / duration) * 100);
      this.elements.buffered.style.width = `${percentage}%`;
    } catch (error) {
      console.warn('Error updating buffered progress:', error);
    }
  }

  handleLoadedMetadata() {
    this.elements.durTime.textContent = this.formatTime(this.elements.video.duration);
    this.updateBuffered();
    this.updateProgress();
    // Update preview source when metadata is loaded
    updatePreviewSource(this.elements.video.src);
  }

  handleVolumeChange(event) {
    const newVolume = parseFloat(event.target.value);
    this.elements.video.volume = newVolume;
    this.elements.video.muted = newVolume === 0;
    this.updateVolIcon();
    this.updateVolumeUI();
  }

  handleProgressClick(event) {
    const rect = this.elements.progress.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = this.clamp(x / rect.width, 0, 1);

    if (this.elements.video.duration) {
      this.elements.video.currentTime = ratio * this.elements.video.duration;
      this.updateProgress();
    }
  }

  handleProgressHover(event) {
    const rect = this.elements.progress.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = this.clamp(x / rect.width, 0, 1);
    const time = (this.elements.video.duration || 0) * ratio;

    this.elements.progressTooltip.textContent = this.formatTime(time);
    this.elements.progressTooltip.style.left = `${ratio * 100}%`;
  }

  showProgressTooltip(event) {
    this.elements.progressTooltip.classList.add('visible');
    this.handleProgressHover(event);
  }

  hideProgressTooltip() {
    this.elements.progressTooltip.classList.remove('visible');
  }

  startScrubbing(event) {
    this.isScrubbing = true;
    this.elements.thumb.setPointerCapture(event.pointerId);

    const onDrag = (e) => this.handleScrubbing(e);
    const onDrop = (e) => this.endScrubbing(e, onDrag, onDrop);

    document.addEventListener('pointermove', onDrag);
    document.addEventListener('pointerup', onDrop);
  }

  handleScrubbing(event) {
    const rect = this.elements.progress.getBoundingClientRect();
    const x = this.clamp(event.clientX - rect.left, 0, rect.width);
    const ratio = x / rect.width;

    this.elements.filled.style.width = `${ratio * 100}%`;
    this.elements.thumb.style.left = `${ratio * 100}%`;
    this.elements.curTime.textContent = this.formatTime((this.elements.video.duration || 0) * ratio);
  }

  endScrubbing(event, onDrag, onDrop) {
    document.removeEventListener('pointermove', onDrag);
    document.removeEventListener('pointerup', onDrop);

    const rect = this.elements.progress.getBoundingClientRect();
    const x = this.clamp(event.clientX - rect.left, 0, rect.width);
    const ratio = x / rect.width;

    if (this.elements.video.duration) {
      this.elements.video.currentTime = ratio * this.elements.video.duration;
    }
    this.isScrubbing = false;
  }

  handleKeyboard(event) {
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowRight':
        this.handleSkipForward();
        break;
      case 'ArrowLeft':
        this.handleSkipBackward();
        break;
      case 'KeyF':
        this.toggleFullscreen();
        break;
      case 'KeyM':
        this.toggleMute();
        break;
    }
  }

  handleBack() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      console.log('Back button pressed - not in fullscreen mode');
    }
  }

  async openFile() {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openFileDialog();
        if (!result.canceled && result.filePaths.length > 0) {
          this.loadVideoFile(result.filePaths[0]);
        }
      } catch (error) {
        console.error('Error opening file dialog:', error);
        this.elements.fileInput.click();
      }
    } else {
      this.elements.fileInput.click();
    }
  }

  loadVideoFile(filePath) {
    if (this.elements.video.src && this.elements.video.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.elements.video.src);
    }

    this.elements.video.src = filePath;
    this.elements.video.load();

    const filename = filePath.split(/[\\/]/).pop() || 'Unknown';
    const baseName = filename.replace(/\.[^/.]+$/, '');
    if (this.elements.title) {
      this.elements.title.textContent = baseName;
    }

    this.elements.video.addEventListener('loadeddata', () => {
      this.elements.video.play().catch((error) => {
        console.log('Autoplay prevented by browser:', error);
      });
      // Update preview source when video data is loaded
      updatePreviewSource(this.elements.video.src);
    }, { once: true });

    this.updatePlayUI();
    this.updateBuffered();
    this.updateProgress();
    this.showControls();
  }

  handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (this.elements.video.src && this.elements.video.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.elements.video.src);
    }

    this.elements.video.src = URL.createObjectURL(file);
    this.elements.video.load();

    const filename = file.name || 'Unknown';
    const baseName = filename.replace(/\.[^/.]+$/, '');
    if (this.elements.title) {
      this.elements.title.textContent = baseName;
    }

    this.elements.video.addEventListener('loadeddata', () => {
      this.elements.video.play().catch((error) => {
        console.log('Autoplay prevented by browser:', error);
      });
      // Update preview source when video data is loaded
      updatePreviewSource(this.elements.video.src);
    }, { once: true });

    this.updatePlayUI();
    this.updateBuffered();
    this.updateProgress();
    this.showControls();
  }

  handleMouseLeave() {
    if (!this.elements.video.paused) {
      this.hideControls();
    }
  }

  showControls() {
    this.elements.controls.classList.remove('hidden');
    this.elements.title?.classList.remove('top-hidden');
    this.elements.openFileBtn?.classList.remove('top-hidden');
    this.elements.backBtn?.classList.remove('top-hidden');
    this.elements.controlsOverlay?.classList.add('visible');

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      this.hideControls();
    }, this.HIDE_DELAY);
  }

  hideControls() {
    this.elements.controls.classList.add('hidden');
    this.elements.title?.classList.add('top-hidden');
    this.elements.openFileBtn?.classList.add('top-hidden');
    this.elements.backBtn?.classList.add('top-hidden');
    this.elements.controlsOverlay?.classList.remove('visible');
  }

  showPlaybackFeedback(isPlaying) {
    this.showFeedback(isPlaying ? 'ti ti-player-play-filled' : 'ti ti-player-pause-filled');
  }

  showVolumeFeedback(isMuted) {
    this.showFeedback(isMuted ? 'ti ti-volume-off' : 'ti ti-volume');
  }

  showFeedback(iconClass) {
    // Create or get the feedback overlay
    let overlay = this.elements.player.querySelector('.playback-feedback-overlay');
    
    // If overlay doesn't exist, create it
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'playback-feedback-overlay';
      this.elements.player.appendChild(overlay);
    }
    
    // Create or get the feedback icon
    let icon = overlay.querySelector('.feedback-icon');
    if (!icon) {
      icon = document.createElement('i');
      icon.className = 'feedback-icon';
      overlay.appendChild(icon);
    }
    
    // Set the icon class
    icon.className = 'feedback-icon ' + iconClass;
    
    // Reset and trigger animation
    icon.classList.remove('animate');
    void icon.offsetWidth; // Trigger reflow
    icon.classList.add('animate');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new VideoPlayerController();
});
