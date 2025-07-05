import React, { useState } from "react";
import "./Accordion.css";

function parseAccordionData(data) {
  let obj = data;
  if (Array.isArray(data)) obj = data[0];
  if (obj && obj["Json Object"]) obj = obj["Json Object"];
  return obj;
}

// Helper function to convert \n to <br> tags
function formatText(text) {
  if (!text) return text;
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
}

const Accordion = ({ data }) => {
  const obj = parseAccordionData(data);
  const items = obj.ObjectJson || [];
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="accordion-container">
      {items.map((item, idx) => (
        <div className="accordion-item" key={idx}>
          <button
            className={`accordion-title${openIdx === idx ? " open" : ""}`}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            aria-expanded={openIdx === idx}
            aria-controls={`accordion-panel-${idx}`}
          >
            <span>{item._Title_}</span>
            <span className="accordion-arrow">{openIdx === idx ? "▼" : "▶"}</span>
          </button>
          <div
            id={`accordion-panel-${idx}`}
            className={`accordion-panel${openIdx === idx ? " open" : ""}`}
            role="region"
            hidden={openIdx !== idx}
          >
            {item._SubTitle_ && <div className="accordion-subtitle">{formatText(item._SubTitle_)}</div>}
            {item._SubsubTitle_ && <div className="accordion-subsubtitle">{formatText(item._SubsubTitle_)}</div>}
            {item._Text_ && <div className="accordion-text">{formatText(item._Text_)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion; 