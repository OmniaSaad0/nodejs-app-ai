import React from "react";
import InfoButton from "../Common/InfoButton";
import QuestionActions from "../Common/QuestionActions";
import useQuestionLogic from "../Common/useQuestionLogic";
import "./MCQ.css";

const MCQ = ({ data }) => {
  const {
    selectedAnswer,
    isAnswered,
    showCorrectAnswer,
    handleAnswerSelect,
    handleCheck,
    handleRetry,
    handleShowCorrectAnswer
  } = useQuestionLogic();

  // Parse MCQ data to get the question
  let question = null;
  let title = "Multiple Choice Question";
  
  if (Array.isArray(data) && data.length > 0) {
    const mcqData = data[0];
    if (mcqData.ObjectJson) {
      question = mcqData.ObjectJson;
      title = mcqData.ObjectName || "Multiple Choice Question";
    }
  } else if (data?.ObjectJson) {
    question = data.ObjectJson;
    title = data.ObjectName || "Multiple Choice Question";
  }

  if (!question || !question["Answers  2"]) {
    return (
      <div className="mcq-container">
        <div className="mcq-error">
          <h3>No question available</h3>
          <p>Please provide valid MCQ data.</p>
        </div>
      </div>
    );
  }

  const getCorrectAnswerIndex = () => {
    return question["Answers  2"].findIndex(answer => 
      answer._Correct_ === true || answer._Correct_ === "True"
    );
  };

  const correctAnswerIndex = getCorrectAnswerIndex();
  const isCorrect = selectedAnswer === correctAnswerIndex;

  return (
    <div className="mcq-container">
      <div className="mcq-header">
        <h1 className="mcq-title">{title}</h1>
      </div>

      <div className="mcq-question-container">
        <div className="mcq-question">
          <h2>{question._Question_}</h2>
        </div>

        <div className="mcq-answers">
          {question["Answers  2"].map((answer, index) => {
            const isSelected = selectedAnswer === index;
            // Only show correct/incorrect styling when explicitly showing the answer
            const isCorrectAnswer = showCorrectAnswer && index === correctAnswerIndex;
            const isWrongAnswer = showCorrectAnswer && isAnswered && isSelected && !isCorrectAnswer;
            
            return (
              <div key={index} className="mcq-answer-wrapper">
                <button
                  className={`mcq-answer-btn ${
                    isSelected ? 'mcq-selected' : ''
                  } ${showCorrectAnswer ? 
                    (isCorrectAnswer ? 'mcq-correct-answer' : isWrongAnswer ? 'mcq-wrong-answer' : '') : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                >
                  <span className="mcq-answer-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="mcq-answer-text">{answer._OptionText_}</span>
                  {/* Only show marks when explicitly showing the correct answer */}
                  {showCorrectAnswer && isCorrectAnswer && (
                    <span className="mcq-correct-mark">✓</span>
                  )}
                  {showCorrectAnswer && isWrongAnswer && (
                    <span className="mcq-wrong-mark">✗</span>
                  )}
                </button>
                
                {/* Use reusable InfoButton component */}
                <InfoButton tip={answer._Tip_} position="right" />
              </div>
            );
          })}
        </div>

        {/* Use reusable QuestionActions component */}
        <QuestionActions
          isAnswered={isAnswered}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onShowCorrectAnswer={handleShowCorrectAnswer}
          showCorrectAnswer={showCorrectAnswer}
          checkDisabled={selectedAnswer === null}
          checkButtonText="Check"
          retryButtonText="Retry"
          showAnswerButtonText="Show Correct Answer"
        />

        {/* Correct Answer Display */}
        {isAnswered && showCorrectAnswer && (
          <div className="mcq-correct-answer-display">
            <h4>Correct Answer:</h4>
            <div className="mcq-correct-answer-content">
              {(() => {
                const correctAnswer = question["Answers  2"][correctAnswerIndex];
                return (
                  <div className="mcq-correct-answer-text">
                    <strong>{String.fromCharCode(65 + correctAnswerIndex)}. {correctAnswer._OptionText_}</strong>
                    {correctAnswer._ChosenFeedback_ && (
                      <div className="mcq-feedback-text">
                        <em>Feedback:</em> {correctAnswer._ChosenFeedback_}
                      </div>
                    )}
                    {correctAnswer._Tip_ && (
                      <div className="mcq-tip-text">
                        <em>Tip:</em> {correctAnswer._Tip_}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Question Status - Only show if not revealing the answer */}
        {isAnswered && !showCorrectAnswer && (
          <div className="mcq-question-status">
            <div className="mcq-status-message mcq-status-neutral">
              <span className="mcq-info-icon">ℹ️</span>
              <span>Answer checked! Use the buttons above to retry or see the correct answer.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQ; 