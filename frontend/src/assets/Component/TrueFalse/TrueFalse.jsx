import React from "react";
import InfoButton from "../Common/InfoButton";
import QuestionActions from "../Common/QuestionActions";
import useQuestionLogic from "../Common/useQuestionLogic";
import "./TrueFalse.css";

const TrueFalse = ({ data }) => {
  const {
    selectedAnswer,
    isAnswered,
    showCorrectAnswer,
    handleAnswerSelect,
    handleCheck,
    handleRetry,
    handleShowCorrectAnswer
  } = useQuestionLogic();

  // Parse True/False data to get the question
  let question = null;
  let title = "True or False Question";
  
  if (Array.isArray(data) && data.length > 0) {
    const tfData = data[0];
    if (tfData["Json Object"]) {
      question = tfData["Json Object"];
      title = tfData.ObjectName || "True or False Question";
    } else if (tfData.ObjectJson) {
      question = tfData.ObjectJson;
      title = tfData.ObjectName || "True or False Question";
    } else if (tfData.AbstractParameter) {
      question = tfData.AbstractParameter;
      title = tfData.ObjectName || "True or False Question";
    }
  } else if (data?.["Json Object"]) {
    question = data["Json Object"];
    title = data.ObjectName || "True or False Question";
  } else if (data?.ObjectJson) {
    question = data.ObjectJson;
    title = data.ObjectName || "True or False Question";
  } else if (data?.AbstractParameter) {
    question = data.AbstractParameter;
    title = data.ObjectName || "True or False Question";
  }

  if (!question || question._Question_ === undefined) {
    return (
      <div className="truefalse-container">
        <div className="truefalse-error">
          <h3>No question available</h3>
          <p>Please provide valid True/False data.</p>
          <div style={{ textAlign: 'left', marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <strong>Debug Info:</strong>
            <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const getCorrectAnswer = () => {
    // Handle both boolean 
    if (question._Correct_ === true || question._Correct_ === "True") {
      return true;
    } else if (question._Correct_ === false || question._Correct_ === "False") {
      return false;
    }
    return true; // Default fallback
  };

  const correctAnswer = getCorrectAnswer();
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="truefalse-container">
      <div className="truefalse-header">
        <h1 className="truefalse-title">{title}</h1>
      </div>

      <div className="truefalse-question-container">
        <div className="truefalse-question">
          <h2>{question._Question_}</h2>
        </div>

        <div className="truefalse-answers">
          <div className="truefalse-answer-wrapper">
            <button
              className={`truefalse-answer-btn ${
                selectedAnswer === true ? 'truefalse-selected' : ''
              } ${showCorrectAnswer ? 
                (correctAnswer === true ? 'truefalse-correct-answer' : selectedAnswer === true ? 'truefalse-wrong-answer' : '') : ''
              }`}
              onClick={() => handleAnswerSelect(true)}
              disabled={isAnswered}
            >
              <span className="truefalse-answer-letter">T</span>
              <span className="truefalse-answer-text">True</span>
              {/* Only show marks when explicitly showing the answer */}
              {showCorrectAnswer && correctAnswer === true && (
                <span className="truefalse-correct-mark">✓</span>
              )}
              {showCorrectAnswer && selectedAnswer === true && correctAnswer !== true && (
                <span className="truefalse-wrong-mark">✗</span>
              )}
            </button>
            
            {/* Info button for True option */}
            <InfoButton tip={question._TrueTip_} position="right" />
          </div>

          <div className="truefalse-answer-wrapper">
            <button
              className={`truefalse-answer-btn ${
                selectedAnswer === false ? 'truefalse-selected' : ''
              } ${showCorrectAnswer ? 
                (correctAnswer === false ? 'truefalse-correct-answer' : selectedAnswer === false ? 'truefalse-wrong-answer' : '') : ''
              }`}
              onClick={() => handleAnswerSelect(false)}
              disabled={isAnswered}
            >
              <span className="truefalse-answer-letter">F</span>
              <span className="truefalse-answer-text">False</span>
              {/* Only show marks when explicitly showing the answer */}
              {showCorrectAnswer && correctAnswer === false && (
                <span className="truefalse-correct-mark">✓</span>
              )}
              {showCorrectAnswer && selectedAnswer === false && correctAnswer !== false && (
                <span className="truefalse-wrong-mark">✗</span>
              )}
            </button>
            
            {/* Info button for False option */}
            <InfoButton tip={question._FalseTip_} position="right" />
          </div>
        </div>

        {/* Use reusable QuestionActions component */}
        <QuestionActions
          isAnswered={isAnswered}
          onCheck={handleCheck}
          onRetry={handleRetry}
          onShowCorrectAnswer={handleShowCorrectAnswer}
          showCorrectAnswer={showCorrectAnswer}
          checkDisabled={selectedAnswer === null}
          checkButtonText="check"
          retryButtonText="Try Again"
          showAnswerButtonText="Show Answer"
        />

        {/* Correct Answer Display */}
        {isAnswered && showCorrectAnswer && (
          <div className="truefalse-correct-answer-display">
            <h4>Correct Answer:</h4>
            <div className="truefalse-correct-answer-content">
              <div className="truefalse-correct-answer-text">
                <strong>The statement is {correctAnswer ? 'True' : 'False'}.</strong>
                {question._Explanation_ && (
                  <div className="truefalse-explanation-text">
                    <em>Explanation:</em> {question._Explanation_}
                  </div>
                )}
                {question._Tip_ && (
                  <div className="truefalse-tip-text">
                    <em>Tip:</em> {question._Tip_}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Status - Only show if not revealing the answer */}
        {isAnswered && !showCorrectAnswer && (
          <div className="truefalse-question-status">
            <div className="truefalse-status-message truefalse-status-neutral">
              <span className="truefalse-info-icon">ℹ️</span>
              <span>Answer verified! Use the buttons above to try again or see the correct answer.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrueFalse; 