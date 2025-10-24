import React from "react";
import KeyboardAltIcon from "@mui/icons-material/KeyboardAlt";

const Logo = ({ isFocusedMode }) => {

  return (
    <div className="header" style={{visibility: isFocusedMode ? 'hidden' : 'visible' }}>
      <h1>
        DeepType <KeyboardAltIcon fontSize="large" />
      </h1>
    </div>
  );
};

export default Logo;
