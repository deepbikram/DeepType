import React, { useState } from "react";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";
import GroupsIcon from "@mui/icons-material/Groups";
import Tooltip from "@mui/material/Tooltip";

const Logo = ({ isFocusedMode, handleNavigateHome, handleMultiplayerClick, showControls = true }) => {
  const [showMultiplayerTooltip, setShowMultiplayerTooltip] = useState(false);

  const handleMultiplayerButtonClick = () => {
    if (handleMultiplayerClick) {
      handleMultiplayerClick();
    } else {
      // Fallback if handler not provided
      alert('Multiplayer mode coming soon! 🎮\n\nFollow the setup instructions in QUICKSTART.md to enable multiplayer.');
    }
  };

  const handleLogoClick = () => {
    if (handleNavigateHome) {
      handleNavigateHome();
    }
  };

  return (
    <div 
      className="header" 
      style={{
        visibility: isFocusedMode ? 'hidden' : 'visible',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
      }}
    >
      <h1 
        onClick={handleLogoClick}
        style={{ 
          cursor: 'pointer', 
          userSelect: 'none',
          fontSize: '1.5rem',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0',
          color: '#a78bfa',
        }}
        title="Go to home"
      >
        DeepType <KeyboardAltIcon fontSize="medium" style={{ color: '#a78bfa' }} />
      </h1>

      {/* Multiplayer Icon */}
      <Tooltip 
        title="Join Multiplayer Race" 
        arrow
        open={showMultiplayerTooltip}
        onOpen={() => setShowMultiplayerTooltip(true)}
        onClose={() => setShowMultiplayerTooltip(false)}
      >
        <button
          onClick={handleMultiplayerButtonClick}
          style={{
            background: 'rgba(167, 139, 250, 0.1)',
            border: '2px solid #a78bfa',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#a78bfa',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <GroupsIcon style={{ fontSize: '20px' }} />
          <span>Multiplayer</span>
        </button>
      </Tooltip>
    </div>
  );
};

export default Logo;