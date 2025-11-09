import React, { useEffect, useRef, useState } from 'react';
import '../styles/ContextMenu.css';

const ContextMenu = ({ x, y, onClose, actions, repeatMode }) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y });
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position after mount to prevent jittering
  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    setPosition({ x: adjustedX, y: adjustedY });
    setIsPositioned(true);
  }, [x, y]);

  const menuItems = [
    { id: 'play-pause', label: 'Play/Pause', icon: 'ti-player-play', shortcut: 'Space' },
    { id: 'divider-1', type: 'divider' },
    { id: 'open-file', label: 'Open File...', icon: 'ti-folder-open', shortcut: 'Ctrl+O' },
    { id: 'open-url', label: 'Open URL...', icon: 'ti-link', shortcut: 'Ctrl+U' },
    { id: 'divider-2', type: 'divider' },
    { id: 'fullscreen', label: 'Fullscreen', icon: 'ti-maximize', shortcut: 'F' },
    { id: 'fit-screen', label: 'Fit to Screen', icon: 'ti-arrows-maximize' },
    { id: 'divider-3', type: 'divider' },
    { id: 'repeat', label: 'Repeat', icon: 'ti-repeat', dynamicLabel: true },
    { id: 'playback-speed', label: 'Playback Speed', icon: 'ti-gauge', submenu: true },
    { id: 'audio-track', label: 'Audio Track', icon: 'ti-volume', submenu: true },
    { id: 'subtitle', label: 'Subtitles', icon: 'ti-subtask', submenu: true },
    { id: 'divider-4', type: 'divider' },
    { id: 'settings', label: 'Settings', icon: 'ti-settings' },
  ];

  const handleItemClick = (item) => {
    if (item.type === 'divider') return;
    
    // Don't close for submenu items (audio-track, subtitle)
    if (item.submenu) return;
    
    // Execute the action if it exists
    if (actions && actions[item.id]) {
      actions[item.id]();
    }
    
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isPositioned ? 1 : 0,
      }}
    >
      {menuItems.map((item) => {
        if (item.type === 'divider') {
          return <div key={item.id} className="context-menu-divider" />;
        }

        const getLabel = () => {
          if (item.dynamicLabel && item.id === 'repeat') {
            return repeatMode === 'one' ? 'Repeat: On' : 'Repeat: Off';
          }
          return item.label;
        };

        return (
          <div
            key={item.id}
            className={`context-menu-item ${item.submenu ? 'has-submenu' : ''} ${item.id === 'repeat' && repeatMode === 'one' ? 'active' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="context-menu-item-content">
              <i className={`ti ${item.icon}`} />
              <span className="context-menu-item-label">{getLabel()}</span>
            </div>
            {item.submenu && (
              <i className="ti ti-chevron-right context-menu-item-arrow" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ContextMenu;
