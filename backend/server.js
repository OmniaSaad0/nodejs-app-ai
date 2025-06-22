// backend/server.js

// Use require('dotenv').config({ path: '../.env' }) to correctly locate the .env file
// when running the script from the 'backend' directory.
require('dotenv').config({ path: '../.env' });

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

const promptTemplates = {
  imageSlider: `
The uploaded image is a crop from a book page.  It is required to represent it as an interactive <”Category”: “Illustrative Object”> of type <”typeName”: “Image Slider”> that <”description”: “Displays a series of images/slides in a rotating or sliding manner”>.  Hence, would you please represent it in the following Json format, so that our system can convert it into an interactive object.  

Very important Notes:

Note1: Please give each object an appropriate expressive name in the field “ObjectName”, 

Note2: All the Json fields must be in the same language of the book,

Note3: fill ALL the given fields of the Json (do not use null/empty), 

{“Json Object”: 
“ObjectType” : <”typeName”: “Image Slider”>
“ObjectName”: “text”,
“AbstractParameter”: 
{“_Title_”:”text”, "Slides 2":[{{“Photo”: { “_Picture_”: "image", “_NormalizedCoordinates_”: “(x = X, y=Y, h=H, w=W)”}},"_AltText_":"text","_HoverText_":"text "}]}
}

Very specific notes: 

1) Each image and its description together with all other related fields compose a separate slide 
2) You need to split the uploaded picture into images each represents a slide, 
3) Crop the image and save it, then provide its URL in the Json field “_Picture_”
4) The field “_AltText_” represents a description of the image
5) The field “_HoverText_”, represent a property/description/a clue.
6) Try to make as reasonable number of slides as possible
7) The “_NormalizedCoordinates_” are calculated as follows:

X= (x + w/2) / image_width
Y = (y + h/2) / image_height
W = w / image_width
H = h / image_height

return x,y,w,h
`,
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
    // Use Gemini multimodal model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = promptTemplates[promptType];
    const imagePart = fileToGenerativePart(imageFilePath, mimeType);

    const generationConfig = {
      temperature: 0.2,
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
      contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
      generationConfig,
      safetySettings
    });

    const response = result.response;
    if (!response.candidates || !response.candidates[0].content.parts[0].text) {
      console.error('Unexpected Gemini response structure:', JSON.stringify(response, null, 2));
      return res.status(500).json({ error: 'Could not extract text from AI response.' });
    }

    const rawText = response.candidates[0].content.parts[0].text;

    // Clean and parse the JSON response from Gemini
    let jsonResponse;
    try {
      // Try to extract the actual JSON block between ```json and ```
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/i);

      if (!jsonMatch) {
        throw new Error("No valid ```json block found in the response.");
      }

      const cleanedText = jsonMatch[1].trim();

      // Optionally fix field names if necessary
      const correctedText = cleanedText.replace(/"Slides"\s*:/, '"Slides 2":');

      jsonResponse = JSON.parse(correctedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON.', parseError);
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
    // Delete uploaded file after processing
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

app.post('/crop-slider', express.json(), async (req, res) => {
  const { imagePath, jsonData } = req.body;

  if (!imagePath || !jsonData) {
    return res.status(400).json({ error: 'imagePath and jsonData are required' });
  }

  try {
    const fullImagePath = path.join(__dirname, imagePath);
    const image = sharp(fullImagePath);
    const metadata = await image.metadata();

    const slides = jsonData["Json Object"]?.AbstractParameter?.["Slides 2"];
    if (!Array.isArray(slides)) {
      return res.status(400).json({ error: 'Invalid Image Slider JSON format' });
    }

    await cropAndSaveSlides(fullImagePath, slides, path.basename(imagePath), metadata.width, metadata.height);

    res.status(200).json({
      message: 'Slides cropped successfully.',
      result: jsonData
    });
  } catch (error) {
    console.error('Cropping error:', error);
    res.status(500).json({ error: 'An error occurred while cropping images.' });
  }
});

