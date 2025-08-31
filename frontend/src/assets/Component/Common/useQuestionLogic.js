import { useState } from 'react';

const useQuestionLogic = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const handleAnswerSelect = (answer) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
    }
  };

  const handleCheck = () => {
    if (selectedAnswer !== null) {
      setIsAnswered(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowCorrectAnswer(false);
  };

  const handleShowCorrectAnswer = () => {
    setShowCorrectAnswer(!showCorrectAnswer);
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowCorrectAnswer(false);
  };

  return {
    // State
    selectedAnswer,
    isAnswered,
    showCorrectAnswer,
    
    // Functions
    handleAnswerSelect,
    handleCheck,
    handleRetry,
    handleShowCorrectAnswer,
    resetQuestion,
    
    // Setters (if needed)
    setSelectedAnswer,
    setIsAnswered,
    setShowCorrectAnswer
  };
};

export default useQuestionLogic; 