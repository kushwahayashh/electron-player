# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luna is a modern, professional video player application built using Electron with a React frontend powered by Vite and styled with Tailwind CSS. It provides a clean interface with features like file associations, keyboard shortcuts, and a responsive design.

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
│   │   ├── TopBar.jsx      # Top bar component
│   │   ├── Controls.jsx    # Video controls component
│   │   ├── ProgressBar.jsx # Progress bar component
│   │   ├── VolumeControl.jsx # Volume control component
│   ├── hooks\              # Custom React hooks
│   │   ├── useVideoPlayer.js # Hook for video player logic
│   ├── styles\             # CSS styles
│   │   └── index.css       # Tailwind directives and custom styles
├── assets\                 # Icons and resources
│   └── icon.ico
└── dist\                   # Build output directory
```

### Core Files

- **`main.js`**: The Electron main process script. It creates the application window, handles file associations (command line arguments), manages the application menu, and sets up IPC communication channels with the renderer process.
- **`preload.js`**: The Electron preload script. It uses `contextBridge` to securely expose specific IPC methods (`openFileDialog`, `showMessageBox`, `onLoadVideoFile`) to the renderer process (`window.electronAPI`).
- **`src/main.jsx`**: The React entry point that renders the App component.
- **`src/App.jsx`**: The main App component that renders the VideoPlayer component.
- **`src/components/VideoPlayer.jsx`**: Contains the main video player UI and integrates with the useVideoPlayer hook.
- **`src/hooks/useVideoPlayer.js`**: Custom React hook that encapsulates video player logic and state management.
- **`src/components/TopBar.jsx`**: Component for the top bar with back button, title, and open file button.
- **`src/components/Controls.jsx`**: Component for video playback controls.
- **`src/components/ProgressBar.jsx`**: Component for the progress bar with time display and scrubbing functionality.
- **`src/components/VolumeControl.jsx`**: Component for volume control with mute toggle.

## Common Development Tasks

### Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Run Electron app in development mode**:
   ```bash
   npm start
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

3. The built application will be located in the `dist` folder.

## Architecture Overview

The application follows a modern Electron architecture with React/Vite frontend:

- **Main Process**: Handles application lifecycle, window creation, and system-level operations
- **Renderer Process**: React/Vite application that manages the UI and user interactions
- **Preload Script**: Securely bridges the main and renderer processes

UI logic is encapsulated within React components and custom hooks. IPC (Inter-Process Communication) is used for communication between the main and renderer processes, facilitated by the `preload.js` script.

The UI is built with React components and styled with Tailwind CSS, providing a component-based architecture with utility-first styling.

File associations for common video formats (mp4, avi, mkv, mov, wmv, webm) are configured in `package.json` for the built application.