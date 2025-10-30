import React, { useEffect, useRef, useState } from 'react';
import '../styles/SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      setIsClosing(false);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`settings-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        ref={modalRef}
        className={`settings-modal ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button className="settings-modal-close" onClick={handleClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="settings-modal-content">
          <div className="settings-sidebar">
            <div className="settings-nav-item active">
              <i className="ti ti-player-play" />
              <span>Playback</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-video" />
              <span>Video</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-volume" />
              <span>Audio</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-subtask" />
              <span>Subtitles</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-keyboard" />
              <span>Shortcuts</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-palette" />
              <span>Appearance</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-adjustments" />
              <span>Advanced</span>
            </div>
            <div className="settings-nav-item">
              <i className="ti ti-info-circle" />
              <span>About</span>
            </div>
          </div>

          <div className="settings-main">
            <div className="settings-section">
              <h3>Playback Settings</h3>
              
              <div className="settings-group">
                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Auto-play on file open</label>
                    <p>Automatically start playback when opening a video file</p>
                  </div>
                  <div className="settings-toggle">
                    <input type="checkbox" id="autoplay" defaultChecked />
                    <label htmlFor="autoplay"></label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Resume playback</label>
                    <p>Continue from where you left off when reopening a file</p>
                  </div>
                  <div className="settings-toggle">
                    <input type="checkbox" id="resume" />
                    <label htmlFor="resume"></label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Loop playback</label>
                    <p>Automatically restart video when it reaches the end</p>
                  </div>
                  <div className="settings-toggle">
                    <input type="checkbox" id="loop" />
                    <label htmlFor="loop"></label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Default playback speed</label>
                    <p>Set the default speed for video playback</p>
                  </div>
                  <select className="settings-select">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1" selected>1x (Normal)</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Skip duration</label>
                    <p>Time to skip forward/backward with arrow keys</p>
                  </div>
                  <select className="settings-select">
                    <option value="5">5 seconds</option>
                    <option value="10" selected>10 seconds</option>
                    <option value="15">15 seconds</option>
                    <option value="30">30 seconds</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Video Settings</h3>
              
              <div className="settings-group">
                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Default fit mode</label>
                    <p>How video should fit in the player window</p>
                  </div>
                  <select className="settings-select">
                    <option value="contain" selected>Contain (Fit to screen)</option>
                    <option value="cover">Cover (Fill screen)</option>
                  </select>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Hardware acceleration</label>
                    <p>Use GPU for video decoding (requires restart)</p>
                  </div>
                  <div className="settings-toggle">
                    <input type="checkbox" id="hwaccel" defaultChecked />
                    <label htmlFor="hwaccel"></label>
                  </div>
                </div>

                <div className="settings-item">
                  <div className="settings-item-info">
                    <label>Show preview on hover</label>
                    <p>Display video preview when hovering over progress bar</p>
                  </div>
                  <div className="settings-toggle">
                    <input type="checkbox" id="preview" defaultChecked />
                    <label htmlFor="preview"></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-btn settings-btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="settings-btn settings-btn-primary" onClick={handleClose}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
