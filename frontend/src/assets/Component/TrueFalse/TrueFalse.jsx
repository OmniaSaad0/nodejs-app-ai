import React, { useState, useEffect } from "react";
import "./TrueFalse.css";

const TrueFalse = ({ data }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  // Parse True/False data
  let tfData = data;
  if (Array.isArray(data)) tfData = data[0];
  if (tfData && tfData["Json Object"]) tfData = tfData["Json Object"];

  // Handle different possible structures
  let questions = [];
  let title = "True/False Questions";
  
  if (Array.isArray(data)) {
    // Array format: each item is a True/False object
    questions = data
      .filter(item => (item.ObjectType === "True False" || item.ObjectType === "True or False") && item.AbstractParameter)
      .map(item => item.AbstractParameter);
    title = "True/False Questions";
  } else if (tfData?.AbstractParameter) {
    // Single question structure with AbstractParameter
    if (tfData.AbstractParameter._Question_) {
      questions = [tfData.AbstractParameter];
      title = tfData.ObjectName || "True/False Question";
    } else {
      // Multiple questions structure
      questions = Array.isArray(tfData.AbstractParameter) ? tfData.AbstractParameter : [];
      title = tfData.ObjectName || "True/False Questions";
    }
  } else if (tfData?.ObjectJson) {
    // Alternative structure with ObjectJson
    if (tfData.ObjectJson._Question_) {
      questions = [tfData.ObjectJson];
      title = tfData.ObjectName || "True/False Question";
    } else {
      questions = Array.isArray(tfData.ObjectJson) ? tfData.ObjectJson : [];
      title = tfData.ObjectName || "True/False Questions";
    }
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
    setTimeLeft(questions.length * 45); // 45 seconds per question
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      // Check if selected answer matches the correct answer
      const correctAnswer = question._Correct_;
      const selectedAnswer = selectedAnswers[index];
      
      // Convert boolean to string for comparison
      const correctString = correctAnswer === true ? 'True' : 'False';
      
      if (selectedAnswer === correctString) {
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
      <div className="truefalse-container">
        <div className="truefalse-error">
          <h3>No questions available</h3>
          <p>Please upload an image and process it to see the True/False questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="truefalse-container">
        <div className="truefalse-start-screen">
          <h1 className="truefalse-title">{title}</h1>
          <div className="truefalse-info">
            <p><strong>Total Questions:</strong> {totalQuestions}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalQuestions * 45)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Read each statement carefully</li>
              <li>Decide if the statement is True or False</li>
              <li>You can navigate between questions using the buttons</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
          <button className="truefalse-start-btn" onClick={startQuiz}>
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
      <div className="truefalse-container">
        <div className="truefalse-results">
          <h1 className="truefalse-title">Quiz Results</h1>
          <div className="truefalse-score-card">
            <div className="truefalse-score-circle">
              <span className="truefalse-score-number">{score}</span>
              <span className="truefalse-score-total">/{totalQuestions}</span>
            </div>
            <div className="truefalse-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          
          <div className="truefalse-answers-review">
            <h3>Question Review</h3>
            {questions.map((question, index) => {
              const correctAnswer = question._Correct_;
              const correctString = correctAnswer === true ? 'True' : 'False';
              const selectedAnswer = selectedAnswers[index];
              
              return (
                <div key={index} className="truefalse-review-item">
                  <div className="truefalse-review-question">
                    {question._Question_}
                  </div>
                  <div className="truefalse-review-answers">
                    <div
                      className={`truefalse-review-answer ${
                        'True' === correctString
                          ? 'truefalse-correct'
                          : selectedAnswer === 'True'
                          ? 'truefalse-incorrect'
                          : ''
                      }`}
                    >
                      True
                      {'True' === correctString && (
                        <span className="truefalse-correct-mark">✓</span>
                      )}
                      {selectedAnswer === 'True' && 'True' !== correctString && (
                        <span className="truefalse-incorrect-mark">✗</span>
                      )}
                    </div>
                    <div
                      className={`truefalse-review-answer ${
                        'False' === correctString
                          ? 'truefalse-correct'
                          : selectedAnswer === 'False'
                          ? 'truefalse-incorrect'
                          : ''
                      }`}
                    >
                      False
                      {'False' === correctString && (
                        <span className="truefalse-correct-mark">✓</span>
                      )}
                      {selectedAnswer === 'False' && 'False' !== correctString && (
                        <span className="truefalse-incorrect-mark">✗</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="truefalse-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="truefalse-container">
      <div className="truefalse-header">
        <h1 className="truefalse-title">{title}</h1>
        <div className="truefalse-progress">
          <div className="truefalse-progress-bar">
            <div 
              className="truefalse-progress-fill" 
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <span className="truefalse-progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        {timeLeft && (
          <div className="truefalse-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="truefalse-question-container">
        <div className="truefalse-question">
          <h2>Q{currentQuestion + 1}: {currentQ._Question_}</h2>
        </div>

        <div className="truefalse-answers">
          <button
            className={`truefalse-answer-btn ${
              selectedAnswers[currentQuestion] === 'True' ? 'truefalse-selected' : ''
            }`}
            onClick={() => handleAnswerSelect(currentQuestion, 'True')}
          >
            <span className="truefalse-answer-icon">✓</span>
            <span className="truefalse-answer-text">True</span>
          </button>
          <button
            className={`truefalse-answer-btn ${
              selectedAnswers[currentQuestion] === 'False' ? 'truefalse-selected' : ''
            }`}
            onClick={() => handleAnswerSelect(currentQuestion, 'False')}
          >
            <span className="truefalse-answer-icon">✗</span>
            <span className="truefalse-answer-text">False</span>
          </button>
        </div>
      </div>

      <div className="truefalse-navigation">
        <button 
          className="truefalse-nav-btn" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        
        <div className="truefalse-question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`truefalse-dot ${
                index === currentQuestion ? 'truefalse-dot-active' : ''
              } ${selectedAnswers[index] !== undefined ? 'truefalse-dot-answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === totalQuestions - 1 ? (
          <button 
            className="truefalse-submit-btn" 
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < totalQuestions}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="truefalse-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default TrueFalse; 