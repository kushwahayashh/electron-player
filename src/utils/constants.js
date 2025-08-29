// Video file extensions
export const SUPPORTED_VIDEO_FORMATS = [
  '.mp4', '.mkv', '.avi', '.mov', '.wmv', 
  '.webm', '.m4v', '.flv', '.3gp', 'video/*'
].join(',')

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SPACE: 'Space',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_LEFT: 'ArrowLeft',
  KEY_F: 'KeyF',
  KEY_M: 'KeyM'
}

// UI constants
export const UI_CONSTANTS = {
  CONTROLS_HIDE_DELAY: 3000,
  MOUSE_MOVE_THROTTLE: 100,
  PROGRESS_UPDATE_THROTTLE: 100,
  SKIP_SECONDS: 10
}

// Default values
export const DEFAULTS = {
  VOLUME: 0.8,
  TITLE: 'Luna',
  WELCOME_MESSAGE: 'Welcome to Luna'
}

// Playback speed options for the mini menu
export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]