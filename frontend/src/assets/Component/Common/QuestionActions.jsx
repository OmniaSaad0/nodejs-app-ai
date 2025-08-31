import React from "react";
import "./QuestionActions.css";

const QuestionActions = ({ 
  isAnswered, 
  onCheck, 
  onRetry, 
  onShowCorrectAnswer, 
  showCorrectAnswer,
  checkDisabled = false,
  checkButtonText = "Check",
  retryButtonText = "Retry",
  showAnswerButtonText = "Show Correct Answer"
}) => {
  if (!isAnswered) {
    return (
      <div className="question-actions">
        <button 
          className="check-btn"
          onClick={onCheck}
          disabled={checkDisabled}
        >
          <span className="check-icon">✓</span>
          {checkButtonText}
        </button>
      </div>
    );
  }

  return (
    <div className="question-actions">
      <div className="post-answer-actions">
        <button 
          className="retry-btn"
          onClick={onRetry}
        >
          <span className="retry-icon">🔄</span>
          {retryButtonText}
        </button>
        <button 
          className="show-correct-btn"
          onClick={onShowCorrectAnswer}
        >
          <span className="show-icon">👁️</span>
          {showCorrectAnswer ? 'Hide' : showAnswerButtonText}
        </button>
      </div>
    </div>
  );
};

export default QuestionActions; 