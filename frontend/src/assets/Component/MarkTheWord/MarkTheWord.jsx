import React, { useState, useEffect } from "react";
import "./MarkTheWord.css";

const MarkTheWord = ({ data }) => {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [marked, setMarked] = useState({}); // { [sentenceIndex]: selectedOption }
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Parse Mark the Word data
  let mtData = data;
  if (Array.isArray(data)) mtData = data[0];
  if (mtData && mtData["Json Object"]) mtData = mtData["Json Object"];

  let sentences = [];
  let title = "Mark the Word";
  let taskDescription = "";
  if (Array.isArray(data)) {
    sentences = data.filter(item => item.ObjectType === "Mark the Word" && item.AbstractParameter).map(item => item.AbstractParameter);
    title = "Mark the Word";
  } else if (mtData?.AbstractParameter) {
    if (mtData.AbstractParameter._TaskDescription_) {
      taskDescription = mtData.AbstractParameter._TaskDescription_;
      sentences = mtData.AbstractParameter.Sentences || [];
      title = mtData.ObjectName || "Mark the Word";
    } else {
      sentences = Array.isArray(mtData.AbstractParameter) ? mtData.AbstractParameter : [];
      title = mtData.ObjectName || "Mark the Word";
    }
  } else if (mtData?.ObjectJson) {
    if (mtData.ObjectJson._TaskDescription_) {
      taskDescription = mtData.ObjectJson._TaskDescription_;
      sentences = mtData.ObjectJson.Sentences || [];
      title = mtData.ObjectName || "Mark the Word";
    } else {
      sentences = Array.isArray(mtData.ObjectJson) ? mtData.ObjectJson : [];
      title = mtData.ObjectName || "Mark the Word";
    }
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

  const handleMark = (sentenceIndex, option) => {
    if (marked[sentenceIndex]) return;
    setMarked(prev => {
      const newMarked = { ...prev, [sentenceIndex]: option };
      return newMarked;
    });
    if (option === sentences[sentenceIndex]._Answer_) {
      setScore(prev => prev + 1);
      setShowHelp(false);
    } else {
      setShowHelp(true);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleNext = () => {
    setCurrentSentence(currentSentence + 1);
    setShowHelp(false);
  };

  const handlePrevious = () => {
    setCurrentSentence(currentSentence - 1);
    setShowHelp(false);
  };

  const handleRetry = () => {
    setCurrentSentence(0);
    setMarked({});
    setShowResults(false);
    setScore(0);
    setIsStarted(false);
    setTimeLeft(null);
    setShowHelp(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sentences || sentences.length === 0) {
    return (
      <div className="marktheword-container">
        <div className="marktheword-error">
          <h3>No sentences available</h3>
          <p>Please upload an image and process it to see the Mark the Word questions.</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="marktheword-container">
        <div className="marktheword-start-screen">
          <h1 className="marktheword-title">{title}</h1>
          <div className="marktheword-info">
            <p><strong>Total Sentences:</strong> {totalSentences}</p>
            <p><strong>Time Limit:</strong> {formatTime(totalSentences * 60)}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>حدد الكلمة الصحيحة التي تكمل الجملة بالنقر عليها مباشرة.</li>
              <li>يمكنك الانتقال بين الجمل باستخدام الأزرار.</li>
              <li>سيتم احتساب درجة لكل إجابة صحيحة.</li>
            </ul>
          </div>
          <button className="marktheword-start-btn" onClick={startQuiz}>
            ابدأ الاختبار
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / totalSentences) * 100);
    const getFeedback = () => {
      if (percentage >= 90) return "ممتاز! عمل رائع!";
      if (percentage >= 80) return "جيد جدًا! أحسنت!";
      if (percentage >= 70) return "جيد! استمر!";
      if (percentage >= 60) return "مقبول. يمكنك التحسن!";
      return "تابع التدريب! ستتحسن!";
    };
    return (
      <div className="marktheword-container">
        <div className="marktheword-results">
          <h1 className="marktheword-title">النتيجة النهائية</h1>
          <div className="marktheword-score-card">
            <div className="marktheword-score-circle">
              <span className="marktheword-score-number">{score}</span>
              <span className="marktheword-score-total">/{totalSentences}</span>
            </div>
            <div className="marktheword-score-details">
              <h3>{percentage}%</h3>
              <p>{getFeedback()}</p>
            </div>
          </div>
          <div className="marktheword-answers-review">
            <h3>مراجعة الجمل</h3>
            {sentences.map((sentence, index) => (
              <div key={index} className="marktheword-review-item">
                <div className="marktheword-review-sentence">
                  {sentence._Sentence_} <strong>{sentence._Answer_}</strong> {sentence._RestSentence_}
                </div>
                <div className={`marktheword-review-answer ${marked[index] === sentence._Answer_ ? "marktheword-correct" : "marktheword-incorrect"}`}>
                  {marked[index] === sentence._Answer_
                    ? "✔️ تم التحديد بشكل صحيح"
                    : marked[index] ? `❌ اخترت: ${marked[index]}` : "لم يتم التحديد"}
                </div>
                {sentence._Help_ && (
                  <div className="marktheword-help">مساعدة: {sentence._Help_}</div>
                )}
              </div>
            ))}
          </div>
          <button className="marktheword-retry-btn" onClick={handleRetry}>
            أعد المحاولة
          </button>
        </div>
      </div>
    );
  }

  const currentS = sentences[currentSentence];

  return (
    <div className="marktheword-container">
      <div className="marktheword-header">
        <h1 className="marktheword-title">{title}</h1>
        <div className="marktheword-progress">
          <div className="marktheword-progress-bar">
            <div 
              className="marktheword-progress-fill" 
              style={{ width: `${((currentSentence + 1) / totalSentences) * 100}%` }}
            ></div>
          </div>
          <span className="marktheword-progress-text">
            الجملة {currentSentence + 1} من {totalSentences}
          </span>
        </div>
        {timeLeft && (
          <div className="marktheword-timer">
            الوقت: {formatTime(timeLeft)}
          </div>
        )}
      </div>
      {taskDescription && (
        <div className="marktheword-task-description">
          <h3>وصف المهمة</h3>
          <p>{taskDescription}</p>
        </div>
      )}
      <div className="marktheword-sentence-container" style={{ textAlign: "right", fontSize: "1.5rem", direction: "rtl" }}>
        {currentS._Sentence_} {" "}
        {currentS._Options_ && currentS._Options_.map((option, idx) => (
          <span
            key={idx}
            className={`marktheword-option ${marked[currentSentence] ? (option === currentS._Answer_ ? "marked-correct" : marked[currentSentence] === option ? "marked-wrong" : "") : ""}`}
            style={{
              display: "inline-block",
              padding: "0.2em 0.7em",
              margin: "0 0.2em",
              borderRadius: "8px",
              background: marked[currentSentence]
                ? option === currentS._Answer_ && marked[currentSentence] === option
                  ? "#d4edda"
                  : marked[currentSentence] === option
                  ? "#f8d7da"
                  : "#f0f0f0"
                : "#f0f0f0",
              color: marked[currentSentence]
                ? option === currentS._Answer_ && marked[currentSentence] === option
                  ? "#155724"
                  : marked[currentSentence] === option
                  ? "#721c24"
                  : "#333"
                : "#333",
              border: marked[currentSentence]
                ? option === currentS._Answer_ && marked[currentSentence] === option
                  ? "2px solid #27ae60"
                  : marked[currentSentence] === option
                  ? "2px solid #dc3545"
                  : "2px solid #ccc"
                : "2px solid #ccc",
              cursor: marked[currentSentence] ? "default" : "pointer",
              fontWeight: "bold",
              position: "relative",
              transition: "all 0.2s"
            }}
            onClick={() => handleMark(currentSentence, option)}
          >
            {option}
            {marked[currentSentence] && option === currentS._Answer_ && marked[currentSentence] === option && (
              <span style={{
                marginRight: "0.5em",
                color: "#27ae60",
                fontWeight: "bold",
                fontSize: "1.2em"
              }}>✔️</span>
            )}
            {marked[currentSentence] && option === currentS._Answer_ && marked[currentSentence] === option && (
              <span style={{
                position: "absolute",
                top: "-1.7em",
                right: "-2.5em",
                background: "#27ae60",
                color: "#fff",
                borderRadius: "12px",
                padding: "0.1em 0.7em",
                fontSize: "1.1em",
                fontWeight: "bold"
              }}>+1</span>
            )}
            {marked[currentSentence] && marked[currentSentence] === option && option !== currentS._Answer_ && (
              <span style={{
                marginRight: "0.5em",
                color: "#dc3545",
                fontWeight: "bold",
                fontSize: "1.2em"
              }}>❌</span>
            )}
          </span>
        ))}
        {" "}{currentS._RestSentence_}
        {showHelp && currentS._Help_ && (
          <div className="marktheword-help">مساعدة: {currentS._Help_}</div>
        )}
      </div>
      <div className="marktheword-navigation">
        <button 
          className="marktheword-nav-btn" 
          onClick={handlePrevious}
          disabled={currentSentence === 0}
        >
          السابق
        </button>
        <div className="marktheword-question-dots">
          {sentences.map((_, index) => (
            <button
              key={index}
              className={`marktheword-dot ${
                index === currentSentence ? 'marktheword-dot-active' : ''
              } ${marked[index] ? 'marktheword-dot-answered' : ''}`}
              onClick={() => setCurrentSentence(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        {currentSentence === totalSentences - 1 ? (
          <button 
            className="marktheword-submit-btn" 
            onClick={handleSubmit}
            disabled={Object.keys(marked).length < totalSentences}
          >
            إنهاء الاختبار
          </button>
        ) : (
          <button 
            className="marktheword-nav-btn" 
            onClick={handleNext}
            disabled={!marked[currentSentence]}
          >
            التالي
          </button>
        )}
      </div>
    </div>
  );
};

export default MarkTheWord; 