// backend/server.js

// Use require('dotenv').config({ path: '../.env' }) to correctly locate the .env file
// when running the script from the 'backend' directory.
require('dotenv').config({path: '../.env'});

const express = require('express');
const multer = require('multer');
const fs = require('fs');
// const path = path;
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
console.log("Key being used by the app ends with:", process.env.API_KEY);

// --- Basic Setup ---
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

// --- Gemini API Initialization ---
if (!process.env.API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the .env file.");
}
console.log('Gemini API Key Loaded successfully.');
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Helper function to convert file buffer to a Gemini-compatible part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(filePath, { encoding: 'base64' }),
      mimeType,
    },
  };
}

// --- Prompt Templates ---
// *** ENHANCEMENT: Added a more explicit instruction to ONLY return JSON. ***
const basePromptInstruction = `
Analyze the following image. Extract the requested information and format it *exclusively* as a clean JSON object.
Do not add any introductory text, closing remarks, or markdown formatting like \`\`\`json.
Your entire response should be only the JSON object itself.
Based on the image content, provide the output in the following structure:
`;

const promptTemplates = {
  TrueFalse: `${basePromptInstruction}
[
  {
    "ObjectType": "TrueFalse",
    "ObjectJson": {
      "Question": "The full text of the true/false statement.",
      "IsCorrect": true
    }
  }
]`,

  MCQ: `${basePromptInstruction}
[
  {
    "ObjectType": "MCQ",
    "ObjectJson": {
      "Question": "The full text of the question.",
      "Answers": [
        { "OptionText": "Text for option A.", "IsCorrect": true, "Feedback": "Explanation for why this is correct." },
        { "OptionText": "Text for option B.", "IsCorrect": false, "Feedback": "Explanation for why this is incorrect." }
      ]
    }
  }
]`,
  // Add other templates here following the same robust pattern...
  FillBlank: `${basePromptInstruction}
[
  {
    "ObjectType": "FillBlank",
    "ObjectJson": {
      "Question": "Text with [BLANK] placeholders.",
      "Answers": [
        { "BlankIndex": 1, "CorrectAnswer": "text" }
      ]
    }
  }
]`,
};


// --- Middleware for Input Validation ---
function validateInput(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }
  const { promptType } = req.body;
  if (!promptType) {
    return res.status(400).json({ error: 'promptType is required in the request body.' });
  }
  if (!promptTemplates[promptType]) {
    return res.status(400).json({ error: `Unsupported promptType: ${promptType}. Supported types are: ${Object.keys(promptTemplates).join(', ')}` });
  }
  next();
}


// --- Main API Endpoint ---
app.post('/analyze-image', upload.single('image'), validateInput, async (req, res) => {
  const { promptType } = req.body;
  const imageFilePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    // MODIFICATION: Switched to 'gemini-1.5-flash-latest'.
    // This is a fast, multimodal, and cost-effective model that is part of Google's free tier.
    // It's a great modern alternative to 'gemini-pro-vision'.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = promptTemplates[promptType];
    const imagePart = fileToGenerativePart(imageFilePath, mimeType);

    // *** FIX: Added safety settings to reduce chances of content being blocked ***
    const generationConfig = {
      temperature: 0.2, // Lower temperature for more predictable, structured output
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [imagePart, {text: prompt}] }],
        generationConfig,
        safetySettings
    });

    const response = result.response;
    // The 'text()' method may not exist on all response types, check for candidates first.
    if (!response.candidates || !response.candidates[0].content.parts[0].text) {
        console.error('Unexpected Gemini response structure:', JSON.stringify(response, null, 2));
        return res.status(500).json({ error: 'Could not extract text from AI response.' });
    }
    const rawText = response.candidates[0].content.parts[0].text;

    // *** CRITICAL FIX: Clean and parse the JSON response from Gemini ***
    let jsonResponse;
    try {
      // Clean the response to remove markdown fences if they exist
      const cleanedText = rawText.replace(/```json\n?/, '').replace(/```$/, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON.', parseError);
      // Return the raw text for debugging purposes if parsing fails
      return res.status(500).json({
        error: 'The AI response was not valid JSON.',
        rawResponse: rawText
      });
    }

    res.status(200).json({ result: jsonResponse });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the image with the Gemini API.' });
  } finally {
    // *** ENHANCEMENT: Added error handling for file cleanup ***
    fs.unlink(imageFilePath, (err) => {
      if (err) {
        console.error(`Failed to delete temporary file: ${imageFilePath}`, err);
      }
    });
  }
});


// --- Health and Test Routes ---
app.get('/health', (req, res) => {
  res.status(200).send('Backend is running and healthy');
});

app.get('/test-gemini', async (req, res) => {
  try {
    // MODIFICATION: Updated the test route to use a modern, free-tier model for consistency.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say Hello from Gemini.");
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini API Failed:", err);
    res.status(500).json({ error: err.message || "Unknown Gemini error" });
  }
});


// --- 404 and Server Start ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});