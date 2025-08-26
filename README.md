# Luna

A modern, professional video player built with Electron, React, Vite, and Tailwind CSS.

## Features

- **Modern UI**: Clean, professional interface with Space Mono font
- **File Associations**: Automatically opens video files when double-clicked in Windows
- **Keyboard Shortcuts**: 
  - Space: Play/Pause
  - Arrow Keys: Skip forward/backward
  - F: Toggle fullscreen
  - M: Toggle mute
  - Ctrl+O: Open file
- **Supported Formats**: MP4, AVI, MKV, MOV, WMV, WebM, and more
- **Professional Controls**: Progress scrubbing, volume control, fit-to-screen toggle
- **Video Preview**: Hover over progress bar to preview video frames

## Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run React app in development mode:**
   ```bash
   npm run dev
   ```

3. **Run Electron app in development mode:**
   ```bash
   npm start
   ```

### Building for Windows

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Build the Windows application:**
   ```bash
   npm run build-win
   ```

3. **The installer will be created in the `dist` folder**

### File Associations

Once installed, the app will automatically register file associations for common video formats:
- MP4, AVI, MKV, MOV, WMV, WebM

You can right-click any video file and select "Open with Luna" or set it as the default application.

## Usage

### Opening Videos
- **File Menu**: Use File → Open Video... or Ctrl+O
- **Drag & Drop**: Drag video files directly onto the player
- **File Association**: Double-click video files in Windows Explorer
- **Open Button**: Click the folder icon in the top-right corner

### Controls
- **Play/Pause**: Click the play button or press Space
- **Skip**: Use the skip buttons or arrow keys
- **Volume**: Hover over volume icon to reveal slider
- **Progress**: Click anywhere on the progress bar to jump to that position
- **Fullscreen**: Click fullscreen button or press F
- **Fit Mode**: Toggle between contain and cover modes
- **Video Preview**: Hover over progress bar to see video frame preview

## Development

### Project Structure
```
├── main.js          # Electron main process
├── preload.js       # Electron preload script
├── vite.config.js   # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── src/             # React source files
│   ├── main.jsx     # React entry point
│   ├── App.jsx      # Main App component
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   └── styles/      # CSS styles
├── oldfiles/        # Original vanilla files
├── package.json     # Dependencies and build config
└── assets/          # Icons and resources
```

### Customization
- Modify React components in `src/components/` for UI changes
- Update `main.js` for Electron-specific features
- Edit `package.json` for build configuration
- Customize Tailwind CSS in `tailwind.config.js`

## Troubleshooting

### Common Issues
1. **Video won't play**: Check if the video format is supported by Chromium
2. **File associations not working**: Reinstall the application
3. **Performance issues**: Try enabling hardware acceleration in settings

### Supported Video Formats
The player supports all formats that Chromium/Chrome supports natively:
- MP4 (H.264, H.265)
- WebM (VP8, VP9, AV1)
- OGG Theora
- And more depending on system codecs

## License

MIT License - feel free to modify and distribute.