import React, { useState, useEffect } from "react";
import "./MCQ.css";

const MCQ = ({ data }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState({});

  // Parse MCQ data
  let mcqData = data;
  if (Array.isArray(data)) mcqData = data[0];
  if (mcqData && mcqData["Json Object"]) mcqData = mcqData["Json Object"];

  // Handle different possible structures
  let questions = [];
  let title = "Multiple Choice Questions";
  
  if (Array.isArray(data)) {
    // Array format: each item is an MCQ object
    questions = data
      .filter(item => item.ObjectType === "MCQ" && item.ObjectJson)
      .map(item => item.ObjectJson);
    title = "Multiple Choice Questions";
  } else if (mcqData?.ObjectJson) {
    // Single question structure
    if (mcqData.ObjectJson._Question_) {
      questions = [mcqData.ObjectJson];
      title = mcqData.ObjectName || "Multiple Choice Question";
    } else {
      // Multiple questions structure
      questions = Array.isArray(mcqData.ObjectJson) ? mcqData.ObjectJson : [];
      title = mcqData.ObjectName || "Multiple Choice Questions";
    }
  } else if (mcqData?.AbstractParameter?.Questions) {
    // Alternative structure
    questions = mcqData.AbstractParameter.Questions;
    title = mcqData.ObjectName || "Multiple Choice Questions";
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
    setTimeLeft(questions.length * 60); // 1 minute per question
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
      // Find the correct answer index - handle both string and boolean values
      const correctIndex = question["Answers  2"]?.findIndex(answer => 
        answer._Correct_ === true || answer._Correct_ === "True"
      ) || 0;
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
      <div className="mcq-container">
        <div className="mcq-error">
          <h3>No questions available</h3>
          <p>Please upload an image and process it to see the MCQ questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="mcq-container">
        <div className="mcq-start-screen">
          <h1 className="mcq-title">{title}</h1>
          <div className="mcq-info">
            <p><strong>Total Questions:</strong> {totalQuestions}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalQuestions * 60)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Read each question carefully</li>
              <li>Select the best answer from the options provided</li>
              <li>You can navigate between questions using the buttons</li>
              <li>Submit when you're ready to see your results</li>
            </ul>
          </div>
          <button className="mcq-start-btn" onClick={startQuiz}>
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
      <div className="mcq-container">
        <div className="mcq-results">
          <h1 className="mcq-title">Quiz Results</h1>
          <div className="mcq-score-card">
            <div className="mcq-score-circle">
              <span className="mcq-score-number">{score}</span>
              <span className="mcq-score-total">/{totalQuestions}</span>
            </div>
            <div className="mcq-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          
          <div className="mcq-answers-review">
            <h3>Question Review</h3>
            {questions.map((question, index) => {
              const correctIndex = question["Answers  2"]?.findIndex(answer => 
                answer._Correct_ === true || answer._Correct_ === "True"
              ) || 0;
              return (
                <div key={index} className="mcq-review-item">
                  <div className="mcq-review-question">
                    {question._Question_}
                  </div>
                  <div className="mcq-review-answers">
                    {question["Answers  2"]?.map((answer, answerIndex) => (
                      <div
                        key={answerIndex}
                        className={`mcq-review-answer ${
                          answerIndex === correctIndex
                            ? 'mcq-correct'
                            : answerIndex === selectedAnswers[index]
                            ? 'mcq-incorrect'
                            : ''
                        }`}
                      >
                        {answer._OptionText_}
                        {answerIndex === correctIndex && (
                          <span className="mcq-correct-mark">✓</span>
                        )}
                        {answerIndex === selectedAnswers[index] && answerIndex !== correctIndex && (
                          <span className="mcq-incorrect-mark">✗</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="mcq-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="mcq-container">
      <div className="mcq-header">
        <h1 className="mcq-title">{title}</h1>
        <div className="mcq-progress">
          <div className="mcq-progress-bar">
            <div 
              className="mcq-progress-fill" 
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <span className="mcq-progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        {timeLeft && (
          <div className="mcq-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="mcq-question-container">
        <div className="mcq-question">
          <h2>Q{currentQuestion + 1}: {currentQ._Question_}</h2>
        </div>

        <div className="mcq-answers">
          {currentQ["Answers  2"]?.map((answer, index) => (
            <div key={index} className="mcq-answer-wrapper">
              <button
                className={`mcq-answer-btn ${
                  selectedAnswers[currentQuestion] === index ? 'mcq-selected' : ''
                }`}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
              >
                <span className="mcq-answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="mcq-answer-text">{answer._OptionText_}</span>
              </button>
              
              {/* {selectedAnswers[currentQuestion] === index && (
                <div className="mcq-feedback-section">
                  <button 
                    className="mcq-feedback-btn"
                    onClick={() => setShowFeedback(prev => ({...prev, [index]: !prev[index]}))}
                  >
                    {showFeedback[index] ? "🔽 Hide Feedback" : "💡 Show Feedback"}
                  </button>
                  {showFeedback[index] && (
                    <div className="mcq-feedback">
                      {answer._ChosenFeedback_ && (
                        <div>
                          <strong>When Chosen:</strong> {answer._ChosenFeedback_}
                        </div>
                      )}
                      {answer._notChosenFeedback_ && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>When Not Chosen:</strong> {answer._notChosenFeedback_}
                        </div>
                      )}
                      {answer._Tip_ && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Tip:</strong> {answer._Tip_}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>

      <div className="mcq-navigation">
        <button 
          className="mcq-nav-btn" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        
        <div className="mcq-question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`mcq-dot ${
                index === currentQuestion ? 'mcq-dot-active' : ''
              } ${selectedAnswers[index] !== undefined ? 'mcq-dot-answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === totalQuestions - 1 ? (
          <button 
            className="mcq-submit-btn" 
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < totalQuestions}
          >
            Submit Quiz
          </button>
        ) : (
          <button 
            className="mcq-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default MCQ; 