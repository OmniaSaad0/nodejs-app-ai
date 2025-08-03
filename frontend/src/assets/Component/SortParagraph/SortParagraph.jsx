import React, { useState, useEffect } from "react";
import "./SortParagraph.css";

const SortParagraph = ({ data }) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [paragraphs, setParagraphs] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Parse Sort Paragraph data with improved logic
  let sortData = data;
  
  if (Array.isArray(data)) {
    sortData = data[0];
  }
  
  if (sortData && sortData["Json Object"]) {
    sortData = sortData["Json Object"];
  } else if (sortData && sortData["JsonObject"]) {
    sortData = sortData["JsonObject"];
  }

  let tasks = [];
  let title = "Sort Paragraph";
  
  if (sortData?.AbstractParameter) {
    // Handle single task
    if (sortData.AbstractParameter.TaskDescription) {
      tasks = [sortData.AbstractParameter];
      title = sortData.ObjectName || "Sort Paragraph";
    } else if (sortData.AbstractParameter.Tasks) {
      // Handle multiple tasks
      tasks = Array.isArray(sortData.AbstractParameter.Tasks) ? sortData.AbstractParameter.Tasks : [];
      title = sortData.ObjectName || "Sort Paragraph";
    } else if (sortData.AbstractParameter.Paragraphs) {
      // Direct paragraphs in AbstractParameter
      tasks = [sortData.AbstractParameter];
      title = sortData.ObjectName || "Sort Paragraph";
    } else {
      tasks = Array.isArray(sortData.AbstractParameter) ? sortData.AbstractParameter : [];
      title = sortData.ObjectName || "Sort Paragraph";
    }
  } else if (sortData?.ObjectJson) {
    // Alternative structure with ObjectJson
    if (sortData.ObjectJson.TaskDescription) {
      tasks = [sortData.ObjectJson];
      title = sortData.ObjectName || "Sort Paragraph";
    } else if (sortData.ObjectJson.Tasks) {
      tasks = Array.isArray(sortData.ObjectJson.Tasks) ? sortData.ObjectJson.Tasks : [];
      title = sortData.ObjectName || "Sort Paragraph";
    } else if (sortData.ObjectJson.Paragraphs) {
      tasks = [sortData.ObjectJson];
      title = sortData.ObjectName || "Sort Paragraph";
    } else {
      tasks = Array.isArray(sortData.ObjectJson) ? sortData.ObjectJson : [];
      title = sortData.ObjectName || "Sort Paragraph";
    }
  } else if (sortData?.TaskDescription) {
    // Direct structure
    tasks = [sortData];
    title = sortData.ObjectName || "Sort Paragraph";
  } else if (sortData?.Paragraphs) {
    // Direct paragraphs structure
    tasks = [sortData];
    title = sortData.ObjectName || "Sort Paragraph";
  } else if (Array.isArray(sortData)) {
    // Direct array of tasks
    tasks = sortData;
    title = "Sort Paragraph";
  } else {
    // Try to find any structure with paragraphs
    if (sortData) {
      for (const key in sortData) {
        if (sortData[key] && typeof sortData[key] === 'object') {
          if (sortData[key].Paragraphs || sortData[key].TaskDescription) {
            tasks = [sortData[key]];
            title = sortData.ObjectName || sortData[key].ObjectName || "Sort Paragraph";
            break;
          }
        }
      }
    }
  }

  const totalTasks = tasks.length;

  // Timer effect
  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isStarted]);

  const startQuiz = () => {
    setIsStarted(true);
    setTimeLeft(totalTasks * 120); // 2 minutes per task
    initializeCurrentTask();
  };

  const initializeCurrentTask = () => {
    const currentTaskData = tasks[currentTask];
    if (currentTaskData?.Paragraphs) {
      // Shuffle paragraphs for random order
      const shuffledParagraphs = [...currentTaskData.Paragraphs]
        .sort(() => Math.random() - 0.5)
        .map((paragraph, index) => ({
          ...paragraph,
          id: index,
          originalIndex: currentTaskData.Paragraphs.indexOf(paragraph)
        }));
      
      setParagraphs(shuffledParagraphs);
      
      // Create drop zones based on number of paragraphs
      const zones = Array.from({ length: shuffledParagraphs.length }, (_, index) => ({
        id: index,
        paragraph: null,
        correctIndex: null
      }));
      setDropZones(zones);
    }
  };

  const handleDragStart = (e, paragraph) => {
    setDraggedItem(paragraph);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropZoneId) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Check if paragraph is already in a drop zone
    const existingZoneIndex = dropZones.findIndex(zone => zone.paragraph?.id === draggedItem.id);
    
    // Check if drop zone is already occupied
    const targetZoneIndex = dropZones.findIndex(zone => zone.id === dropZoneId);
    
    if (existingZoneIndex !== -1) {
      // Remove from existing zone
      const updatedZones = [...dropZones];
      updatedZones[existingZoneIndex].paragraph = null;
      updatedZones[existingZoneIndex].correctIndex = null;
      
      // Add to new zone
      updatedZones[targetZoneIndex].paragraph = draggedItem;
      updatedZones[targetZoneIndex].correctIndex = draggedItem.originalIndex;
      
      setDropZones(updatedZones);
    } else {
      // Add to new zone
      const updatedZones = [...dropZones];
      updatedZones[targetZoneIndex].paragraph = draggedItem;
      updatedZones[targetZoneIndex].correctIndex = draggedItem.originalIndex;
      setDropZones(updatedZones);
    }
    
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    dropZones.forEach(zone => {
      if (zone.paragraph && zone.correctIndex === zone.id) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentTask < totalTasks - 1) {
      setCurrentTask(currentTask + 1);
      initializeCurrentTask();
    }
  };

  const handlePrevious = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1);
      initializeCurrentTask();
    }
  };

  const handleRetry = () => {
    setCurrentTask(0);
    setParagraphs([]);
    setDropZones([]);
    setShowResults(false);
    setScore(0);
    setIsStarted(false);
    setTimeLeft(null);
    setDraggedItem(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="sortparagraph-container">
        <div className="sortparagraph-error">
          <h3>No sort paragraph tasks available</h3>
          <p>Please upload an image and process it to see the sort paragraph tasks.</p>
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem' }}>
            <h4>Debug Information:</h4>
            <p><strong>Data received:</strong> {data ? 'Yes' : 'No'}</p>
            <p><strong>Data type:</strong> {typeof data}</p>
            <p><strong>Is array:</strong> {Array.isArray(data) ? 'Yes' : 'No'}</p>
            <p><strong>Available keys:</strong> {data ? Object.keys(data).join(', ') : 'None'}</p>
            <details style={{ marginTop: '1rem' }}>
              <summary>Full data structure (click to expand)</summary>
              <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto', maxHeight: '300px', fontSize: '0.8rem' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="sortparagraph-container">
        <div className="sortparagraph-start-screen">
          <h1 className="sortparagraph-title">{title}</h1>
          <div className="sortparagraph-info">
            <p><strong>Total Tasks:</strong> {totalTasks}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalTasks * 120)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Read the task description carefully</li>
              <li>Drag and drop paragraphs into the correct order</li>
              <li>Arrange paragraphs in the proper sequence</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
          <button className="sortparagraph-start-btn" onClick={startQuiz}>
            Start Sorting
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / dropZones.length) * 100);
    const getFeedback = () => {
      if (percentage >= 90) return "Excellent! Perfect sorting!";
      if (percentage >= 80) return "Very good! Well done!";
      if (percentage >= 70) return "Good! Keep it up!";
      if (percentage >= 60) return "Fair. You can do better!";
      return "Keep practicing! You'll improve!";
    };

    return (
      <div className="sortparagraph-container">
        <div className="sortparagraph-results">
          <h1 className="sortparagraph-title">Sorting Results</h1>
          <div className="sortparagraph-score-card">
            <div className="sortparagraph-score-circle">
              <span className="sortparagraph-score-number">{score}</span>
              <span className="sortparagraph-score-total">/{dropZones.length}</span>
            </div>
            <div className="sortparagraph-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          
          <div className="sortparagraph-answers-review">
            <h3>Sorting Review</h3>
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#e8f4fd', borderRadius: '8px', border: '2px solid #3498db' }}>
              <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>📅 Correct Chronological Order:</h4>
              <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#2c3e50' }}>
                {tasks[currentTask]?.Paragraphs?.map((paragraph, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <strong>{paragraph.ParagraphText}</strong>
                  </li>
                ))}
              </ol>
            </div>
            {dropZones.map((zone, index) => {
              const isCorrect = zone.correctIndex === zone.id;
              return (
                <div key={index} className="sortparagraph-review-item">
                  <div className="sortparagraph-review-zone">
                    <div className="sortparagraph-review-zone-title">
                      Position {index + 1}:
                    </div>
                    {zone.paragraph ? (
                      <div className={`sortparagraph-review-paragraph ${isCorrect ? 'sortparagraph-correct' : 'sortparagraph-incorrect'}`}>
                        {zone.paragraph.ParagraphText}
                        {isCorrect && <span style={{ marginLeft: '0.5rem', color: '#28a745' }}>✓</span>}
                        {!isCorrect && <span style={{ marginLeft: '0.5rem', color: '#dc3545' }}>✗</span>}
                      </div>
                    ) : (
                      <div className="sortparagraph-review-paragraph sortparagraph-incorrect">
                        No paragraph placed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="sortparagraph-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentTaskData = tasks[currentTask];

  return (
    <div className="sortparagraph-container">
      <div className="sortparagraph-header">
        <h1 className="sortparagraph-title">{title}</h1>
        <div className="sortparagraph-progress">
          <div className="sortparagraph-progress-bar">
            <div 
              className="sortparagraph-progress-fill" 
              style={{ width: `${((currentTask + 1) / totalTasks) * 100}%` }}
            ></div>
          </div>
          <span className="sortparagraph-progress-text">
            Task {currentTask + 1} of {totalTasks}
          </span>
        </div>
        {timeLeft && (
          <div className="sortparagraph-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="sortparagraph-task-container">
        <div className="sortparagraph-task-description">
          {currentTaskData?.TaskDescription || "Sort the paragraphs in the correct order"}
        </div>

        <div className="sortparagraph-paragraphs-section">
          <div className="sortparagraph-paragraphs-title">
            Available Paragraphs:
          </div>
          <div className="sortparagraph-paragraphs-list">
            {paragraphs
              .filter(paragraph => !dropZones.some(zone => zone.paragraph?.id === paragraph.id))
              .map((paragraph, index) => (
                <div
                  key={paragraph.id}
                  className="sortparagraph-paragraph-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, paragraph)}
                >
                  <div className="sortparagraph-paragraph-number">
                    {index + 1}
                  </div>
                  {paragraph.ParagraphText}
                </div>
              ))}
          </div>
        </div>

        <div className="sortparagraph-drop-zones">
          <div className="sortparagraph-drop-zones-title">
            Drop Zones (Arrange in order):
          </div>
          <div className="sortparagraph-drop-zones-grid">
            {dropZones.map((zone, index) => (
              <div
                key={zone.id}
                className={`sortparagraph-drop-zone ${zone.paragraph ? 'sortparagraph-filled' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, zone.id)}
              >
                <div className="sortparagraph-position-indicator">
                  Position {index + 1}
                </div>
                {zone.paragraph ? (
                  <div className="sortparagraph-drop-zone-content">
                    <div className="sortparagraph-paragraph-number">
                      {index + 1}
                    </div>
                    {zone.paragraph.ParagraphText}
                  </div>
                ) : (
                  <div className="sortparagraph-drop-zone-placeholder">
                    Drop paragraph here for position {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sortparagraph-navigation">
        <button 
          className="sortparagraph-nav-btn" 
          onClick={handlePrevious}
          disabled={currentTask === 0}
        >
          ← Previous
        </button>
        
        {currentTask === totalTasks - 1 ? (
          <button 
            className="sortparagraph-submit-btn" 
            onClick={handleSubmit}
            disabled={dropZones.some(zone => !zone.paragraph)}
          >
            Submit Sorting
          </button>
        ) : (
          <button 
            className="sortparagraph-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default SortParagraph; 