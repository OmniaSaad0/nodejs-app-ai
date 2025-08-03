import React, { useState, useEffect } from "react";
import "./Essay.css";

const Essay = ({ data }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [essayAnswers, setEssayAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showWritingTips, setShowWritingTips] = useState(false);

  // Parse Essay data
  let essayData = data;
  if (Array.isArray(data)) essayData = data[0];
  if (essayData && essayData["Json Object"]) essayData = essayData["Json Object"];

  let questions = [];
  let title = "Essay Writing";
  
  // Try multiple possible data structures
  if (essayData?.AbstractParameter) {
    // Handle single essay question
    if (essayData.AbstractParameter._EssayQuestion_) {
      questions = [essayData.AbstractParameter];
      title = essayData.ObjectName || "Essay Writing";
    } else if (essayData.AbstractParameter.Questions) {
      // Handle multiple essay questions in Questions array
      questions = Array.isArray(essayData.AbstractParameter.Questions) ? essayData.AbstractParameter.Questions : [];
      title = essayData.ObjectName || "Essay Writing";
    } else if (essayData.AbstractParameter._Question_) {
      // Handle single question with _Question_ field
      questions = [essayData.AbstractParameter];
      title = essayData.ObjectName || "Essay Writing";
    } else {
      // Handle multiple essay questions
      questions = Array.isArray(essayData.AbstractParameter) ? essayData.AbstractParameter : [];
      title = essayData.ObjectName || "Essay Writing";
    }
  } else if (essayData?.ObjectJson) {
    // Alternative structure with ObjectJson
    if (essayData.ObjectJson._EssayQuestion_) {
      questions = [essayData.ObjectJson];
      title = essayData.ObjectName || "Essay Writing";
    } else if (essayData.ObjectJson.Questions) {
      questions = Array.isArray(essayData.ObjectJson.Questions) ? essayData.ObjectJson.Questions : [];
      title = essayData.ObjectName || "Essay Writing";
    } else if (essayData.ObjectJson._Question_) {
      questions = [essayData.ObjectJson];
      title = essayData.ObjectName || "Essay Writing";
    } else {
      questions = Array.isArray(essayData.ObjectJson) ? essayData.ObjectJson : [];
      title = essayData.ObjectName || "Essay Writing";
    }
  } else if (essayData?._EssayQuestion_) {
    // Direct structure
    questions = [essayData];
    title = essayData.ObjectName || "Essay Writing";
  } else if (essayData?._Question_) {
    // Direct structure with _Question_
    questions = [essayData];
    title = essayData.ObjectName || "Essay Writing";
  } else if (Array.isArray(essayData)) {
    // Direct array of questions
    questions = essayData;
    title = "Essay Writing";
  }

  const totalQuestions = questions.length;

  // Debug logging to help identify data structure
  console.log("Essay Component Debug:", {
    originalData: data,
    parsedEssayData: essayData,
    questions: questions,
    totalQuestions: totalQuestions
  });

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
    setTimeLeft(totalQuestions * 1800); // 30 minutes per essay
  };

  const handleEssayChange = (questionIndex, value) => {
    setEssayAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleSubmit = () => {
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
    setEssayAnswers({});
    setShowResults(false);
    setIsStarted(false);
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const countWords = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="essay-container">
        <div className="essay-error">
          <h3>No essay questions available</h3>
          <p>Please upload an image and process it to see the essay questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="essay-container">
        <div className="essay-start-screen">
          <h1 className="essay-title">{title}</h1>
          <div className="essay-info">
            <p><strong>Total Essays:</strong> {totalQuestions}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalQuestions * 1800)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Read each essay question carefully</li>
              <li>Write a well-structured essay response</li>
              <li>You can navigate between questions using the buttons</li>
              <li>Submit when you're ready to see the model answers</li>
            </ul>
          </div>
          <button className="essay-start-btn" onClick={startQuiz}>
            Start Writing
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="essay-container">
        <div className="essay-results">
          <h1 className="essay-title">Essay Review</h1>
          <div className="essay-score-card">
            <div className="essay-score-circle">
              <span className="essay-score-number">{totalQuestions}</span>
              <span className="essay-score-total">Essays</span>
            </div>
            <div className="essay-score-details">
              <h3>Completed</h3>
              <p>Review your essays and compare with model answers</p>
            </div>
          </div>
          
          <div className="essay-answers-review">
            <h3>Essay Review</h3>
            {questions.map((question, index) => (
              <div key={index} className="essay-review-item">
                <div className="essay-review-question">
                  <strong>Question {index + 1}:</strong> {question._EssayQuestion_ || question.Question || question.question}
                </div>
                <div className="essay-review-answer">
                  <strong>Your Answer:</strong>
                  <br />
                  {essayAnswers[index] || "No answer provided"}
                </div>
                {(question._EssayModelAnswer_ || question.ModelAnswer || question.modelAnswer) && (
                  <div className="essay-model-answer">
                    <h4>Model Answer:</h4>
                    {question._EssayModelAnswer_ || question.ModelAnswer || question.modelAnswer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button className="essay-retry-btn" onClick={handleRetry}>
            Write Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = essayAnswers[currentQuestion] || "";
  const wordCount = countWords(currentAnswer);

  return (
    <div className="essay-container">
      <div className="essay-header">
        <h1 className="essay-title">{title}</h1>
        <div className="essay-progress">
          <div className="essay-progress-bar">
            <div 
              className="essay-progress-fill" 
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <span className="essay-progress-text">
            Essay {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        {timeLeft && (
          <div className="essay-timer">
            Time: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="essay-question-container">
        <div className="essay-question">
          <h2>Essay Question {currentQuestion + 1}:</h2>
          <p>{currentQ._EssayQuestion_ || currentQ.Question || currentQ.question}</p>
        </div>

        <div className="essay-textarea-container">
          <textarea
            className="essay-textarea"
            placeholder="Write your essay here... Start with an introduction, develop your main points, and conclude with a summary of your arguments."
            value={currentAnswer}
            onChange={(e) => handleEssayChange(currentQuestion, e.target.value)}
            autoFocus
          />
          <div className="essay-word-count">
            Word Count: {wordCount} words
          </div>
        </div>

        {(currentQ._Help_ || currentQ.Help || currentQ.help) && (
          <div className="essay-help-section">
            <button 
              className="essay-help-btn"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? "🔽 Hide Writing Tips" : "💡 Show Writing Tips"}
            </button>
            {showHelp && (
              <div className="essay-help">
                <strong>Writing Tips:</strong> {currentQ._Help_ || currentQ.Help || currentQ.help}
              </div>
            )}
          </div>
        )}

      </div>

      <div className="essay-navigation">
        <button 
          className="essay-nav-btn" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        
        {currentQuestion === totalQuestions - 1 ? (
          <button 
            className="essay-submit-btn" 
            onClick={handleSubmit}
          >
            Submit Essays
          </button>
        ) : (
          <button 
            className="essay-nav-btn" 
            onClick={handleNext}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default Essay; 