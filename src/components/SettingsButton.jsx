import React, { useState, useRef, useEffect } from 'react';
import { SPEED_OPTIONS } from '../utils/constants';
import '../styles/SettingsButton.css';

const SettingsButton = ({ playbackRate, onPlaybackRateChange, videoRef, previewEnabled, onPreviewToggle }) => {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('main'); // 'main' or 'speed'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const settingsBtnRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const justClosedMenuRef = useRef(false);

  // Close settings menu on outside click
  useEffect(() => {
    const onDocMouseDown = (e) => {
      // If we've recently suppressed clicks, ignore further mousedowns
      if (justClosedMenuRef.current) return;

      if (
        settingsMenuOpen &&
        !settingsBtnRef.current?.contains(e.target) &&
        !settingsMenuRef.current?.contains(e.target)
      ) {
        // Prevent the original event from reaching underlying handlers
        try {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        } catch (err) {
          // ignore
        }

        // Close the menu
        setSettingsMenuOpen(false);
        setCurrentMenu('main');

        // Mark suppression and install a one-time click blocker to ensure the
        // subsequent click event doesn't trigger underlying handlers.
        justClosedMenuRef.current = true;

        const onceClickBlocker = (ev) => {
          try {
            ev.preventDefault();
            ev.stopPropagation();
            if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
          } catch (err) {
            // ignore
          }
          // remove after handling
          document.removeEventListener('click', onceClickBlocker, true);
          // give a tiny delay before clearing suppression flag to avoid races
          setTimeout(() => {
            justClosedMenuRef.current = false;
          }, 0);
        };

        document.addEventListener('click', onceClickBlocker, true);
      }
    };

    // Use capturing phase so this runs before other handlers
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [settingsMenuOpen]);

  const handleSpeedClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMenu('speed');
      setIsTransitioning(false);
    }, 150);
  };

  const handleBackClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMenu('main');
      setIsTransitioning(false);
    }, 150);
  };

  const handleSpeedSelect = (speed) => {
    onPlaybackRateChange(speed);
    setSettingsMenuOpen(false);
    setCurrentMenu('main');
  };

  const handleMenuItemClick = (option) => {
    if (option === 'speed') {
      handleSpeedClick();
    } else {
      console.log(`Settings option clicked: ${option}`);
      // Mock functionality for other options
      setSettingsMenuOpen(false);
      setCurrentMenu('main');
    }
  };

  const renderMainMenu = () => (
    <div className={`settings-menu-content ${isTransitioning ? 'transitioning' : ''}`}>
      <button
        role="menuitem"
        className="settings-item"
        onClick={() => handleMenuItemClick('speed')}
      >
        <i className="ti ti-clock" />
        <span>Speed</span>
        <span className="settings-value">{playbackRate}x</span>
        <i className="ti ti-chevron-right settings-arrow" />
      </button>
      <div className="settings-item preview-item" style={{ alignItems: 'center', gap: '8px' }}>
        <i className="ti ti-eye" />
        <span>Preview</span>
        <label className="toggle-switch" style={{ marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={previewEnabled !== undefined ? !!previewEnabled : true}
            onChange={(e) => onPreviewToggle(!!e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );

  const renderSpeedMenu = () => (
    <div className={`settings-menu-content ${isTransitioning ? 'transitioning' : ''}`}>
      <button
        role="menuitem"
        className="settings-item back-item"
        onClick={handleBackClick}
      >
        <i className="ti ti-arrow-left" />
        <span>Speed</span>
      </button>
      
      <div className="settings-separator" />
      
      {SPEED_OPTIONS.map((rate) => (
        <button
          key={rate}
          role="menuitem"
          className={`settings-item speed-option ${rate === playbackRate ? 'active' : ''}`}
          onClick={() => handleSpeedSelect(rate)}
        >
          <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
          {rate === playbackRate && <i className="ti ti-check" />}
        </button>
      ))}
    </div>
  );

  const renderCurrentMenu = () => {
    switch (currentMenu) {
      case 'speed':
        return renderSpeedMenu();
      default:
        return renderMainMenu();
    }
  };

  return (
    <div className="settings-control relative">
      <button
        ref={settingsBtnRef}
        className="control-btn"
        onClick={() => setSettingsMenuOpen((v) => !v)}
        title="Settings"
        aria-haspopup="menu"
        aria-expanded={settingsMenuOpen}
      >
        <i className="ti ti-settings small-icon" />
      </button>
      
      {settingsMenuOpen && (
        <div ref={settingsMenuRef} className="settings-menu" role="menu">
          {renderCurrentMenu()}
        </div>
      )}
    </div>
  );
};

export default SettingsButton;
