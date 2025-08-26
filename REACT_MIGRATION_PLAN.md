# React Migration Plan for Luna Video Player

This document outlines the plan to migrate the Luna video player from vanilla HTML/CSS/JS to React with Vite and Tailwind CSS while preserving all existing functionality.

## Current State Analysis

The current application is built with:
- Electron for desktop app functionality
- Vanilla HTML, CSS, and JavaScript
- Tabler Icons for UI elements
- Space Mono font for typography
- Core files: main.js, preload.js, renderer.js, index.html, previewcanvas.js

## Migration Goals

1. Preserve all existing functionality
2. Migrate to React with Vite for better development experience
3. Integrate Tailwind CSS for styling
4. Keep Electron integration intact
5. Maintain file associations and all existing features
6. Organize old files in an "oldfiles" directory

## Proposed Architecture

### File Structure After Migration
```
D:\qwen\video\
├── main.js                 # Electron main process (unchanged)
├── preload.js              # Electron preload script (unchanged)
├── package.json            # Updated with React/Vite dependencies
├── vite.config.js          # Vite configuration
├── index.html              # Updated to work with Vite/React
├── README.md               # Updated documentation
├── CLAUDE.md               # Updated documentation
├── REACT_MIGRATION_PLAN.md # This file
├── oldfiles\               # Directory containing original vanilla files
│   ├── renderer.js         # Original vanilla JavaScript
│   ├── previewcanvas.js    # Original preview functionality
│   ├── index.html          # Original HTML file
│   └── ...                 # Other original files
├── src\                    # New React source directory
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main App component
│   ├── components\         # React components
│   │   ├── VideoPlayer.jsx # Main video player component
│   │   ├── Controls.jsx    # Video controls component
│   │   ├── ProgressBar.jsx # Progress bar component
│   │   ├── VolumeControl.jsx # Volume control component
│   │   └── ...             # Other UI components
│   ├── hooks\              # Custom React hooks
│   │   ├── useVideoPlayer.js # Hook for video player logic
│   │   └── ...             # Other hooks
│   ├── assets\             # Static assets
│   └── styles\             # Tailwind CSS and other styles
│       └── index.css       # Tailwind directives
├── assets\                 # Icons and resources (unchanged)
│   └── icon.ico
└── dist\                   # Build output directory
```

## Component Breakdown

### 1. VideoPlayer Component
- Encapsulates the main video element
- Manages video state (play/pause, currentTime, duration, volume)
- Handles keyboard shortcuts
- Integrates with Electron APIs

### 2. Controls Component
- Play/Pause button
- Skip forward/backward buttons
- Fullscreen toggle
- Fit-to-screen toggle

### 3. ProgressBar Component
- Current time display
- Duration display
- Progress bar with scrubbing functionality
- Buffered progress indicator
- Video preview on hover (integrated from previewcanvas.js)

### 4. VolumeControl Component
- Mute toggle
- Volume slider
- Volume icon that changes based on level

### 5. TopBar Component
- Back button
- Title display
- Open file button

## Technical Implementation Plan

### 1. Setup React with Vite
- Initialize Vite React project
- Install necessary dependencies (React, ReactDOM, Tailwind CSS)
- Configure Vite for Electron compatibility

### 2. Integrate Tailwind CSS
- Install Tailwind CSS
- Configure tailwind.config.js
- Set up PostCSS
- Create base styles with existing color scheme

### 3. Migrate JavaScript Logic
- Convert VideoPlayerController class to React hooks
- Maintain all existing functionality:
  - Keyboard shortcuts (Space, Arrow keys, F, M)
  - File opening via Electron dialog
  - File associations
  - Video preview on progress bar hover
  - Playback feedback animations
  - Volume control
  - Progress bar scrubbing

### 4. UI Component Implementation
- Recreate UI using React components
- Maintain the same visual design and layout
- Use Tailwind CSS for styling with the same color scheme
- Implement responsive design

### 5. Electron Integration
- Keep main.js and preload.js unchanged
- Update renderer process to work with React
- Maintain all IPC communication channels
- Preserve file association functionality

### 6. Video Preview Feature
- Migrate previewcanvas.js functionality to React component
- Maintain hidden video element and canvas approach
- Ensure preview works on progress bar hover

## Migration Steps

1. Create backup of current files
2. Set up React/Vite environment
3. Install Tailwind CSS
4. Create React component structure
5. Migrate JavaScript logic to React hooks
6. Implement UI components with Tailwind CSS
7. Integrate with Electron APIs
8. Test all existing functionality
9. Move old files to "oldfiles" directory
10. Update documentation

## Risk Mitigation

1. Preserve all existing functionality - extensive testing required
2. Keep Electron integration intact - minimal changes to main.js/preload.js
3. Maintain file associations - no changes to package.json file associations
4. Preserve keyboard shortcuts - implement identical key handling
5. Keep video preview feature - migrate logic exactly

## Dependencies to Install

```json
{
  "devDependencies": {
    "vite": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^3.0.0"
  },
  "dependencies": {
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Testing Plan

1. Verify all keyboard shortcuts work
2. Test file opening via all methods (menu, drag/drop, file association)
3. Check video playback controls
4. Validate progress bar scrubbing
5. Test volume control functionality
6. Verify fullscreen and fit-to-screen toggles
7. Confirm video preview on progress bar hover
8. Test playback feedback animations
9. Verify file associations still work after build
10. Check build process still works correctly

## Expected Outcomes

1. Modern development experience with React and Vite
2. Improved maintainability with component-based architecture
3. Enhanced styling capabilities with Tailwind CSS
4. Preserved functionality and user experience
5. Better code organization and scalability