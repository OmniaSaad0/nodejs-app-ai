// backend/server.js
require('dotenv').config();
console.log('Gemini API Key Loaded:', !!process.env.GEMINI_API_KEY);

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert file to Gemini-compatible part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(filePath, { encoding: 'base64' }),
      mimeType,
    },
  };
}

// Prompt templates
const promptTemplates = {
  TrueFalse: `This image contains True/False questions. Return each as:
{
  "ObjectType": "TrueFalse",
  "ObjectJson": {
    "_Question_": "Statement",
    "_Correct_": true
  }
}`,

  MCQ: `This image contains multiple-choice questions. Return each as:
{
  "ObjectType": "MCQ",
  "ObjectJson": {
    "_Question_": "text",
    "Answers": [
      {
        "_OptionText_": "text",
        "_Correct_": true,
        "_ChosenFeedback_": "text",
        "_notChosenFeedback_": "text",
        "_Tip_": "text"
      }
    ]
  }
}`,

  FillBlank: `This image contains fill-in-the-blank questions. Return each as:
{
  "ObjectType": "FillBlank",
  "ObjectJson": {
    "_Question_": "text with blanks",
    "Answers": [
      {
        "_Answer_": "text",
        "_Tip_": "text"
      }
    ]
  }
}`,

  DragWords: `This image contains drag-the-words questions. Return each as:
{
  "ObjectType": "DragWords",
  "ObjectJson": {
    "Sentences": [
      {
        "_Sentence_": "text",
        "_Answer_": "text",
        "_Tip_": "text"
      }
    ],
    "Distractors": [
      {
        "_Distractor_": "text"
      }
    ]
  }
}`,

  Essay: `This image contains essay questions. Return each as:
{
  "ObjectType": "Essay",
  "ObjectJson": {
    "_EssayQuestion_": "text",
    "_EssayModelAnswer_": "text",
    "_Help_": "text"
  }
}`,

  ImageMCQ: `This image contains image-based multiple-choice questions. Return each as:
{
  "ObjectType": "ImageMCQ",
  "ObjectJson": {
    "_Question_": "text",
    "Options": [
      {
        "_Picture_": "image",
        "_AltText_": "text",
        "_HoverText_": "text",
        "_Correct_": true
      }
    ]
  }
}`
};

// Validate input
function validateInput(req, res, next) {
  if (!req.file) return res.status(400).json({ error: 'Image file is required.' });
  if (!req.body.promptType) return res.status(400).json({ error: 'promptType is required.' });
  if (!promptTemplates[req.body.promptType]) return res.status(400).json({ error: `Unsupported promptType: ${req.body.promptType}` });
  next();
}

app.post('/analyze-image', upload.single('image'), validateInput, async (req, res) => {
  const { promptType } = req.body;
  const imageFilePath = req.file.path;
  const mimeType = req.file.mimetype;
  const prompt = promptTemplates[promptType];

  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  const imagePart = fileToGenerativePart(imageFilePath, mimeType);

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ result: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to process the image with Gemini.' });
  } finally {
    fs.unlink(imageFilePath, () => {});
  }
});

// check gemini endpoint

app.get('/test-gemini', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent("Say Hello from Gemini.");
    const response = await result.response;
    const text = response.text();

    console.log("Gemini reply:", text);
    res.json({ reply: text });

  } catch (err) {
    console.error("Gemini API Failed:", err);
    res.status(500).json({ error: err.message || "Unknown Gemini error" });
  }
});


// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('Backend is running');
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
