import React, { useState } from "react";
import "./InfoButton.css";

const InfoButton = ({ tip, position = "right" }) => {
  const [showTip, setShowTip] = useState(false);

  if (!tip) return null;

  const handleToggleTip = (e) => {
    e.stopPropagation();
    setShowTip(!showTip);
  };

  return (
    <div className="info-button-container">
      <button
        className={`info-btn info-btn-${position}`}
        onClick={handleToggleTip}
        title="Click for tip"
      >
        <span className="info-icon">ℹ️</span>
      </button>
      
      {showTip && (
        <div className="tip-display">
          <div className="tip-content">
            <strong>Tip:</strong> {tip}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoButton; 