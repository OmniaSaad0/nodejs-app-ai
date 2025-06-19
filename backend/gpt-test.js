require('dotenv').config();

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

// --- OpenAI API Initialization ---
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in the .env file.");
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Prompt Templates ---
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
  if (!promptType || !promptTemplates[promptType]) {
    return res.status(400).json({
      error: `Invalid or missing promptType. Supported types: ${Object.keys(promptTemplates).join(', ')}`,
    });
  }
  next();
}

// --- Main Endpoint ---
app.post('/analyze-image', upload.single('image'), validateInput, async (req, res) => {
  const { promptType } = req.body;
  const imageFilePath = req.file.path;
  const prompt = promptTemplates[promptType];

  try {
    const imageBuffer = fs.readFileSync(imageFilePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // You must use GPT-4o for image input
      messages,
      temperature: 0.2,
      max_tokens: 2048,
    });

    const rawText = completion.choices[0].message.content;

    let jsonResponse;
    try {
      const cleanedText = rawText.replace(/```json\n?/, '').replace(/```$/, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON.', parseError);
      return res.status(500).json({
        error: 'The AI response was not valid JSON.',
        rawResponse: rawText,
      });
    }

    res.status(200).json({ result: jsonResponse });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the image with the OpenAI API.' });
  } finally {
    fs.unlink(imageFilePath, (err) => {
      if (err) console.error(`Failed to delete temp file: ${imageFilePath}`, err);
    });
  }
});

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).send('Backend running with OpenAI GPT-4o');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/test-openai', async (req, res) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Say Hello from ChatGPT." }],
      });
      res.json({ reply: response.choices[0].message.content });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  