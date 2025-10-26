import React from "react";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";

const Logo = ({ isFocusedMode, handleNavigateHome, showControls = true }) => {

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
        // Logo always visible - don't hide it during typing
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
          margin: '10px 0',
          color: '#a78bfa',
        }}
        title="Go to home"
      >
        DeepType <KeyboardAltIcon fontSize="medium" style={{ color: '#a78bfa' }} />
      </h1>
    </div>
  );
};

export default Logo;