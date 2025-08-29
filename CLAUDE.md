# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luna is a modern, professional video player application built using Electron with a React frontend powered by Vite and styled with Tailwind CSS. It provides a clean interface with features like file associations, keyboard shortcuts, video preview on progress bar hover, and a responsive design.

### Key Technologies

- **Electron**: Framework for building cross-platform desktop apps
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Tabler Icons**: Icon library used for UI elements
- **Space Mono Font**: Custom font used in the UI

## Project Structure

```
D:\qwen\video\
├── main.js                 # Electron main process
├── preload.js              # Electron preload script
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── index.html              # Main HTML file for the React app
├── package.json            # Project metadata, dependencies, and build scripts
├── README.md               # Project documentation
├── REACT_MIGRATION_PLAN.md # Migration plan documentation
├── oldfiles\               # Directory containing original vanilla files
│   ├── renderer.js         # Original vanilla JavaScript
│   ├── previewcanvas.js    # Original preview functionality
│   ├── index.html          # Original HTML file
│   └── playback-feedback.html # Original playback feedback demo
├── src\                    # React source directory
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main App component
│   ├── components\         # React components
│   │   ├── VideoPlayer.jsx # Main video player component
│   │   ├── TitleOverlay.jsx # Title bar component with open file button
│   │   ├── ProgressBar.jsx # Progress bar component with time display and scrubbing functionality
│   │   ├── VolumeControl.jsx # Volume control component with mute toggle
│   │   ├── VideoPreview.jsx # Video preview component for progress bar hover
│   ├── hooks\              # Custom React hooks
│   │   ├── useVideoPlayer.js # Hook for video player logic
│   ├── styles\             # CSS styles
│   │   └── index.css       # Tailwind directives and custom styles
│   ├── utils\              # Utility functions and constants
│   │   ├── constants.js    # Application constants
│   │   ├── fileUtils.js    # File handling utilities
│   │   └── videoFeedback.js # Visual feedback utilities
├── assets\                 # Icons and resources
│   └── icon.ico
└── dist\                   # Build output directory
```

### Core Files

- **`main.js`**: The Electron main process script. It creates the application window, handles file associations (command line arguments), manages the application menu, and sets up IPC communication channels with the renderer process.
- **`preload.js`**: The Electron preload script. It uses `contextBridge` to securely expose specific IPC methods (`openFileDialog`, `showMessageBox`, `onLoadVideoFile`) to the renderer process (`window.electronAPI`).
- **`src/main.jsx`**: The React entry point that renders the App component.
- **`src/App.jsx`**: The main App component that renders the VideoPlayer component and TitleOverlay component.
- **`src/components/VideoPlayer.jsx`**: Contains the main video player UI and integrates with the useVideoPlayer hook. Handles video playback, controls, and user interactions.
- **`src/hooks/useVideoPlayer.js`**: Custom React hook that encapsulates video player logic and state management.
- **`src/components/TitleOverlay.jsx`**: Component for the title bar with video title display and open file button.
- **`src/components/ProgressBar.jsx`**: Component for the progress bar with time display, scrubbing functionality, and hover preview.
- **`src/components/VolumeControl.jsx`**: Component for volume control with mute toggle and visual feedback.
- **`src/components/VideoPreview.jsx`**: Component that shows video preview when hovering over the progress bar.
- **`src/utils/constants.js`**: Contains application constants like keyboard shortcuts, UI constants, and default values.
- **`src/utils/fileUtils.js`**: Utility functions for file handling and video URL creation.
- **`src/utils/videoFeedback.js`**: Utility functions for showing visual feedback during playback actions.

## Common Development Tasks

### Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run React app in development mode**:
   ```bash
   npm run dev
   ```

3. **Run Electron app in development mode**:
   ```bash
   npm start
   ```

4. **Run both React and Electron in development mode concurrently**:
   ```bash
   npm run dev-all
   ```

### Building the Application

1. **Build the React app**:
   ```bash
   npm run build
   ```

2. **Build the Windows application**:
   ```bash
   npm run build-win
   ```

3. **Build the Windows application without code signing**:
   ```bash
   npm run build-win-nosign
   ```

4. **Build application for distribution**:
   ```bash
   npm run dist
   ```

5. The built application will be located in the `dist` folder for web builds and `release` folder for desktop builds.

## Architecture Overview

The application follows a modern Electron architecture with React/Vite frontend:

- **Main Process**: Handles application lifecycle, window creation, file associations, and system-level operations
- **Renderer Process**: React/Vite application that manages the UI and user interactions
- **Preload Script**: Securely bridges the main and renderer processes

UI logic is encapsulated within React components and custom hooks. IPC (Inter-Process Communication) is used for communication between the main and renderer processes, facilitated by the `preload.js` script.

The UI is built with React components and styled with Tailwind CSS, providing a component-based architecture with utility-first styling.

File associations for common video formats (mp4, avi, mkv, mov, wmv, webm, m4v, flv, 3gp) are configured in `package.json` for the built application.

## Key Features

- **Video Preview**: Hover over the progress bar to preview video frames
- **Keyboard Shortcuts**: 
  - Space: Play/Pause
  - Arrow Keys: Skip forward/backward
  - F: Toggle fullscreen
  - M: Toggle mute
- **Custom Title Bar**: Draggable title bar with open file button
- **Visual Feedback**: On-screen feedback for playback actions
- **Responsive Design**: Adapts to different window sizes
- **Fit to Screen**: Toggle between contain and cover video display modes