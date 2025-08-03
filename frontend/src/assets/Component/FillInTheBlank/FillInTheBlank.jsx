import React, { useState, useEffect } from "react";
import "./FillInTheBlank.css";

const FillInTheBlank = ({ data }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Parse Fill in the Blank data
  let fibData = data;
  if (Array.isArray(data)) fibData = data[0];
  if (fibData && fibData["Json Object"]) fibData = fibData["Json Object"];

  let questions = [];
  let title = "Fill in the Blank";
  
  if (fibData?.AbstractParameter?.Questions) {
    questions = fibData.AbstractParameter.Questions;
    title = fibData.ObjectName || "Fill in the Blank";
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

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      const userAnswer = answers[index] || "";
      const correctAnswer = question._Answer_ || "";
      
      // Case-insensitive comparison for better user experience
      if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
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
    setAnswers({});
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
      <div className="fillintheblank-container">
        <div className="fillintheblank-error">
          <h3>No questions available</h3>
          <p>Please upload an image and process it to see the Fill in the Blank questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="fillintheblank-container">
        <div className="fillintheblank-start-screen">
          <h1 className="fillintheblank-title">{title}</h1>
          <div className="fillintheblank-info">
            <p><strong>Total Questions:</strong> {totalQuestions}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalQuestions * 60)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Read each question carefully</li>
              <li>Type the correct word or phrase in the blank space</li>
              <li>You can navigate between questions using the buttons</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
          <button className="fillintheblank-start-btn" onClick={startQuiz}>
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
      <div className="fillintheblank-container">
        <div className="fillintheblank-results">
          <h1 className="fillintheblank-title">Quiz Results</h1>
          <div className="fillintheblank-score-card">
            <div className="fillintheblank-score-circle">
              <span className="fillintheblank-score-number">{score}</span>
              <span className="fillintheblank-score-total">/{totalQuestions}</span>
            </div>
            <div className="fillintheblank-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          <div className="fillintheblank-answers-review">
            <h3>Question Review</h3>
            {questions.map((question, index) => {
              const userAnswer = answers[index] || "";
              const correctAnswer = question._Answer_ || "";
              const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
              
              return (
                <div key={index} className="fillintheblank-review-item">
                  <div className="fillintheblank-review-question">
                    {question._Question_}
                  </div>
                  <div className={`fillintheblank-review-answer ${isCorrect ? "fillintheblank-correct" : "fillintheblank-incorrect"}`}>
                    {isCorrect ? (
                      <>
                        <span className="fillintheblank-correct-mark">✓</span>
                        Your answer: {userAnswer || "No answer"} (Correct)
                      </>
                    ) : (
                      <>
                        <span className="fillintheblank-incorrect-mark">✗</span>
                        Your answer: {userAnswer || "No answer"} | Correct: {correctAnswer}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="fillintheblank-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="fillintheblank-container">
      <div className="fillintheblank-header">
        <h1 className="fillintheblank-title">{title}</h1>
        <div className="fillintheblank-progress">
          <div className="fillintheblank-progress-bar">
            <div 
              className="fillintheblank-progress-fill" 
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <span className="fillintheblank-progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        {timeLeft && (
          <div className="fillintheblank-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="fillintheblank-question-container">
        <div className="fillintheblank-question">
          <h2>Q{currentQuestion + 1}: {currentQ._Question_}</h2>
        </div>

        <div className="fillintheblank-input-container">
          <input
            type="text"
            className="fillintheblank-input"
            placeholder="Type your answer here..."
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
            autoFocus
          />
        </div>

        {currentQ._Tip_ && (
          <div className="fillintheblank-tip-section">
            <button 
              className="fillintheblank-tip-btn"
              onClick={() => setShowTip(!showTip)}
            >
              {showTip ? "🔽 Hide Tip" : "💡 Show Tip"}
            </button>
            {showTip && (
              <div className="fillintheblank-tip">
                <strong>Tip:</strong> {currentQ._Tip_}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fillintheblank-navigation">
        <button 
          className="fillintheblank-nav-btn" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        
        <div className="fillintheblank-question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`fillintheblank-dot ${
                index === currentQuestion ? 'fillintheblank-dot-active' : ''
              } ${answers[index] ? 'fillintheblank-dot-answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === totalQuestions - 1 ? (
          <button 
            className="fillintheblank-submit-btn" 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="fillintheblank-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default FillInTheBlank; 