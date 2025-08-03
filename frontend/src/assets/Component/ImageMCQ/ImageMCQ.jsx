import React, { useState, useEffect } from "react";
import "./ImageMCQ.css";

const ImageMCQ = ({ data }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  // Parse ImageMCQ data
  let mcqData = data;
  if (Array.isArray(data)) mcqData = data[0];
  if (mcqData && mcqData["Json Object"]) mcqData = mcqData["Json Object"];

  let questions = [];
  let title = "Image MCQ";
  if (mcqData?.AbstractParameter?.Options2) {
    questions = [
      {
        _Question_: mcqData.AbstractParameter._Question_ || "",
        Options: mcqData.AbstractParameter.Options2.map(opt => ({
          ...opt,
          _Picture_: opt.Picture?._Picture_ || "",
          _NormalizedCoordinates_: opt.Picture?._NormalizedCoordinates_ || "",
        }))
      }
    ];
    title = mcqData.ObjectName || "Image MCQ";
  }

  const totalQuestions = questions.length;

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
    setTimeLeft(totalQuestions * 60); // 1 minute per question
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const correctIndex = question.Options?.findIndex(opt => opt._Correct_ === true || opt._Correct_ === "True") || 0;
      if (selectedAnswers[index] === correctIndex) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
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

  if (!questions || questions.length === 0) {
    return (
      <div className="imagemcq-container">
        <div className="imagemcq-error">
          <h3>No questions available</h3>
          <p>Please upload an image and process it to see the Image MCQ questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="imagemcq-container">
        <div className="imagemcq-start-screen">
          <h1 className="imagemcq-title">{title}</h1>
          <div className="imagemcq-info">
            <p><strong>Total Questions:</strong> {totalQuestions}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalQuestions * 60)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Read each question carefully</li>
              <li>Select the correct image from the options</li>
              <li>You can navigate between questions using the buttons</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
          <button className="imagemcq-start-btn" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const getFeedback = () => {
      if (percentage >= 90) return "Excellent! Great job!";
      if (percentage >= 80) return "Very good! Well done!";
      if (percentage >= 70) return "Good! Keep it up!";
      if (percentage >= 60) return "Fair. You can do better!";
      return "Keep practicing! You'll improve!";
    };
    return (
      <div className="imagemcq-container">
        <div className="imagemcq-results">
          <h1 className="imagemcq-title">Quiz Results</h1>
          <div className="imagemcq-score-card">
            <div className="imagemcq-score-circle">
              <span className="imagemcq-score-number">{score}</span>
              <span className="imagemcq-score-total">/{totalQuestions}</span>
            </div>
            <div className="imagemcq-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          <div className="imagemcq-answers-review">
            <h3>Question Review</h3>
            {questions.map((question, index) => {
              const correctIndex = question.Options?.findIndex(opt => opt._Correct_ === true || opt._Correct_ === "True") || 0;
              return (
                <div key={index} className="imagemcq-review-item">
                  <div className="imagemcq-review-question">
                    {question._Question_}
                  </div>
                  <div className="imagemcq-review-options">
                    {question.Options?.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`imagemcq-review-option ${
                          optIdx === correctIndex
                            ? 'imagemcq-correct'
                            : optIdx === selectedAnswers[index]
                            ? 'imagemcq-incorrect'
                            : ''
                        }`}
                      >
                        <img src={option._Picture_} alt={`Option ${optIdx + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        {optIdx === correctIndex && (
                          <span className="imagemcq-correct-mark">✓</span>
                        )}
                        {optIdx === selectedAnswers[index] && optIdx !== correctIndex && (
                          <span className="imagemcq-incorrect-mark">✗</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="imagemcq-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="imagemcq-container">
      <div className="imagemcq-header">
        <h1 className="imagemcq-title">{title}</h1>
        <div className="imagemcq-progress">
          <div className="imagemcq-progress-bar">
            <div 
              className="imagemcq-progress-fill" 
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <span className="imagemcq-progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        {timeLeft && (
          <div className="imagemcq-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>
      <div className="imagemcq-question-container">
        <div className="imagemcq-question">
          <h2>Q{currentQuestion + 1}: {currentQ._Question_}</h2>
        </div>
        <div className="imagemcq-options">
          {currentQ.Options?.map((option, idx) => (
            <button
              key={idx}
              className={`imagemcq-option-btn ${
                selectedAnswers[currentQuestion] === idx ? 'selected' : ''
              }`}
              onClick={() => handleAnswerSelect(currentQuestion, idx)}
            >
              <img src={option._Picture_} alt={`Option ${idx + 1}`} />
              {showResults && (
                <span className="imagemcq-option-feedback">
                  {option._Correct_ === true || option._Correct_ === "True"
                    ? "✓"
                    : selectedAnswers[currentQuestion] === idx
                    ? "✗"
                    : ""}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="imagemcq-navigation">
        <button 
          className="imagemcq-nav-btn" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        <div className="imagemcq-question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`imagemcq-dot ${
                index === currentQuestion ? 'imagemcq-dot-active' : ''
              } ${selectedAnswers[index] !== undefined ? 'imagemcq-dot-answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {currentQuestion === totalQuestions - 1 ? (
          <button 
            className="imagemcq-submit-btn" 
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < totalQuestions}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="imagemcq-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageMCQ; 