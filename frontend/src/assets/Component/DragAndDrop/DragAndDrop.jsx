import React, { useState, useEffect } from "react";
import "./DragAndDrop.css";

const DragAndDrop = ({ data }) => {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [droppedWords, setDroppedWords] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [draggedWord, setDraggedWord] = useState(null);
  const [showTip, setShowTip] = useState(false);

  // Parse Drag and Drop data
  let ddData = data;
  if (Array.isArray(data)) ddData = data[0];
  if (ddData && ddData["Json Object"]) ddData = ddData["Json Object"];

  let sentences = [];
  let distractors = [];
  let title = "Drag and Drop";
  
  if (ddData?.AbstractParameter) {
    sentences = ddData.AbstractParameter.Sentences || [];
    distractors = ddData.AbstractParameter.Distractors || [];
    title = ddData.ObjectName || "Drag and Drop";
  }

  const totalSentences = sentences.length;

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
    setTimeLeft(totalSentences * 60);
  };

  const handleDragStart = (e, word) => {
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, sentenceIndex) => {
    e.preventDefault();
    if (draggedWord) {
      setDroppedWords(prev => ({
        ...prev,
        [sentenceIndex]: draggedWord
      }));
      setDraggedWord(null);
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    sentences.forEach((sentence, index) => {
      // Verify the answer by comparing the dropped word with the correct answer
      const droppedWord = droppedWords[index];
      const correctAnswer = sentence._Answer_;
      
      // Case-insensitive comparison for better user experience
      if (droppedWord && droppedWord.toLowerCase() === correctAnswer.toLowerCase()) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentSentence < totalSentences - 1) {
      setCurrentSentence(currentSentence + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSentence > 0) {
      setCurrentSentence(currentSentence - 1);
    }
  };

  const handleRetry = () => {
    setCurrentSentence(0);
    setDroppedWords({});
    setShowResults(false);
    setScore(0);
    setIsStarted(false);
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create word bank with correct answers and distractors (fixed order)
  const createWordBank = () => {
    const allWords = [
      ...sentences.map(s => s._Answer_),
      ...distractors.map(d => d._Distractor_)
    ];
    // Return words in fixed order (not shuffled)
    return allWords;
  };

  if (!sentences || sentences.length === 0) {
    return (
      <div className="dragdrop-container">
        <div className="dragdrop-error">
          <h3>No sentences available</h3>
          <p>Please upload an image and process it to see the Drag and Drop questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="dragdrop-container">
        <div className="dragdrop-start-screen">
          <h1 className="dragdrop-title">{title}</h1>
          <div className="dragdrop-info">
            <p><strong>Total Sentences:</strong> {totalSentences}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalSentences * 60)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Drag words from the word bank to fill in the blanks</li>
              <li>Each sentence has one blank space to fill</li>
              <li>You can navigate between sentences using the buttons</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
          <button className="dragdrop-start-btn" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / totalSentences) * 100);
    const getFeedback = () => {
      if (percentage >= 90) return "Excellent! Great job!";
      if (percentage >= 80) return "Very good! Well done!";
      if (percentage >= 70) return "Good! Keep it up!";
      if (percentage >= 60) return "Fair. You can do better!";
      return "Keep practicing! You'll improve!";
    };

    return (
      <div className="dragdrop-container">
        <div className="dragdrop-results">
          <h1 className="dragdrop-title">Quiz Results</h1>
          <div className="dragdrop-score-card">
            <div className="dragdrop-score-circle">
              <span className="dragdrop-score-number">{score}</span>
              <span className="dragdrop-score-total">/{totalSentences}</span>
            </div>
            <div className="dragdrop-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          <div className="dragdrop-answers-review">
            <h3>Question Review</h3>
            {sentences.map((sentence, index) => {
              const droppedWord = droppedWords[index];
              const correctAnswer = sentence._Answer_;
              const isCorrect = droppedWord && droppedWord.toLowerCase() === correctAnswer.toLowerCase();
              
              return (
                <div key={index} className="dragdrop-review-item">
                  <div className="dragdrop-review-sentence">
                    {sentence._Sentence_} <strong>{droppedWord || "___"}</strong>
                  </div>
                  <div className={`dragdrop-review-answer ${isCorrect ? "dragdrop-correct" : "dragdrop-incorrect"}`}>
                    {isCorrect ? (
                      <>
                        <span className="dragdrop-correct-mark">✓</span>
                        Correct: {correctAnswer}
                      </>
                    ) : (
                      <>
                        <span className="dragdrop-incorrect-mark">✗</span>
                        Your answer: {droppedWord || "No answer"} | Correct: {correctAnswer}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="dragdrop-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentS = sentences[currentSentence];
  const wordBank = createWordBank();

  return (
    <div className="dragdrop-container">
      <div className="dragdrop-header">
        <h1 className="dragdrop-title">{title}</h1>
        <div className="dragdrop-progress">
          <div className="dragdrop-progress-bar">
            <div 
              className="dragdrop-progress-fill" 
              style={{ width: `${((currentSentence + 1) / totalSentences) * 100}%` }}
            ></div>
          </div>
          <span className="dragdrop-progress-text">
            Sentence {currentSentence + 1} of {totalSentences}
          </span>
        </div>
        {timeLeft && (
          <div className="dragdrop-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="dragdrop-sentence-container">
        <div className="dragdrop-sentence">
          <h2>Drag the right Word:</h2>
          <div className="dragdrop-sentence-text">
            {currentS._Sentence_}{" "}
            <span
              className={`dragdrop-blank ${droppedWords[currentSentence] ? "dragdrop-filled" : ""}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, currentSentence)}
            >
              {droppedWords[currentSentence] || "___"}
            </span>
          </div>
          {currentS._Tip_ && (
            <div className="dragdrop-tip-section">
              <button 
                className="dragdrop-tip-btn"
                onClick={() => setShowTip(!showTip)}
              >
                {showTip ? "🔽 Hide Tip" : "💡 Show Tip"}
              </button>
              {showTip && (
                <div className="dragdrop-tip">
                  <strong>Tip:</strong> {currentS._Tip_}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dragdrop-word-bank">
          <h3>Word Bank:</h3>
          <div className="dragdrop-words">
            {wordBank.map((word, index) => (
              <div
                key={index}
                className="dragdrop-word"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, word)}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dragdrop-navigation">
        <button 
          className="dragdrop-nav-btn" 
          onClick={handlePrevious}
          disabled={currentSentence === 0}
        >
          ← Previous
        </button>
        <div className="dragdrop-question-dots">
          {sentences.map((_, index) => (
            <button
              key={index}
              className={`dragdrop-dot ${
                index === currentSentence ? 'dragdrop-dot-active' : ''
              } ${droppedWords[index] ? 'dragdrop-dot-answered' : ''}`}
              onClick={() => setCurrentSentence(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {currentSentence === totalSentences - 1 ? (
          <button 
            className="dragdrop-submit-btn" 
            onClick={handleSubmit}
            disabled={Object.keys(droppedWords).length < totalSentences}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="dragdrop-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default DragAndDrop; 