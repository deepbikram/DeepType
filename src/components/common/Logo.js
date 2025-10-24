import React from "react";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";

const Logo = ({ isFocusedMode, handleNavigateHome }) => {

  const handleLogoClick = () => {
    if (handleNavigateHome) {
      handleNavigateHome();
    }
  };

  return (
    <div className="header" style={{visibility: isFocusedMode ? 'hidden' : 'visible' }}>
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
          margin: '10px 0'
        }}
        title="Go to home"
      >
        DeepType <KeyboardAltIcon fontSize="medium" />
      </h1>
    </div>
  );
};

export default Logo;