import React from 'react';

const SettingsButton = ({ onClick }) => {
  return (
    <button
      className="control-btn"
      onClick={onClick}
    >
      <i className="ti ti-settings small-icon" />
    </button>
  );
};

export default SettingsButton;
