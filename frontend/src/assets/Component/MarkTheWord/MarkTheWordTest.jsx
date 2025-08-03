import React from "react";
import MarkTheWord from "./MarkTheWord";

const MarkTheWordTest = () => {
  // Sample data matching the JSON structure from the prompt template
  const testData = {
    result: {
      "Json Object": {
        ObjectType: "Mark the Word",
        ObjectName: "Vocabulary Practice",
        AbstractParameter: {
          "_TaskDescription_": "Mark the correct word that fits in the blank space in each sentence.",
          "Sentences": [
            {
              "_Sentence_": "The sun is",
              "_Answer_": "bright",
              "_RestSentence_": "today."
            },
            {
              "_Sentence_": "She likes to",
              "_Answer_": "read",
              "_RestSentence_": "books."
            },
            {
              "_Sentence_": "The cat is",
              "_Answer_": "sleeping",
              "_RestSentence_": "on the sofa."
            },
            {
              "_Sentence_": "We will",
              "_Answer_": "go",
              "_RestSentence_": "to the park tomorrow."
            }
          ]
        }
      }
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>Mark the Word Component Test</h1>

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h3>Test Instructions:</h3>
        <ul>
          <li>Read each sentence with a blank space</li>
          <li>Select the word that best fits in the blank</li>
          <li>Navigate between sentences using the buttons</li>
          <li>Submit when you're ready to see your results</li>
        </ul>
      </div>

      <MarkTheWord data={testData.result} />

      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#e9ecef", borderRadius: "8px" }}>
        <h3>JSON Data Used:</h3>
        <pre style={{ overflow: "auto", maxHeight: "300px" }}>{JSON.stringify(testData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default MarkTheWordTest; 