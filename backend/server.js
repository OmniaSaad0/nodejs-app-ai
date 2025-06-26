// backend/server.js

// Use require('dotenv').config({ path: '../.env' }) to correctly locate the .env file
// when running the script from the 'backend' directory.
require("dotenv").config({ path: "../.env" });
 
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
 
// const path = path;
const cors = require("cors");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
console.log("Key being used by the app ends with:", process.env.API_KEY);

// --- Basic Setup ---
const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());

// Create processed images directory
const processedImagesDir = path.join(__dirname, "processed-images");
if (!fs.existsSync(processedImagesDir)) {
	fs.mkdirSync(processedImagesDir, { recursive: true });
}

// Serve static files from processed-images directory
app.use("/processed-images", express.static(processedImagesDir));

// --- Gemini API Initialization ---
if (!process.env.API_KEY) {
	throw new Error("GEMINI_API_KEY is not set in the .env file.");
}
console.log("Gemini API Key Loaded successfully.");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Helper function to convert file buffer to a Gemini-compatible part
function fileToGenerativePart(filePath, mimeType) {
	return {
		inlineData: {
			data: fs.readFileSync(filePath, { encoding: "base64" }),
			mimeType,
		},
	};
}

// Helper function to parse normalized coordinates
function parseNormalizedCoordinates(coordString) {
	const match = coordString.match(/\(x\s*=\s*([\d.]+),\s*y\s*=\s*([\d.]+),\s*h\s*=\s*([\d.]+),\s*w\s*=\s*([\d.]+)\)/);
	if (!match) {
		throw new Error("Invalid coordinate format");
	}
	return {
		x: parseFloat(match[1]),
		y: parseFloat(match[2]),
		h: parseFloat(match[3]),
		w: parseFloat(match[4]),
	};
}

// Helper function to crop image based on normalized coordinates
async function cropImage(imagePath, normalizedCoords, outputPath) {
	try {
		const image = sharp(imagePath);
		const metadata = await image.metadata();

		const { width: imageWidth, height: imageHeight } = metadata;
		const { x: X, y: Y, h: H, w: W } = parseNormalizedCoordinates(normalizedCoords);

		const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

		const rawLeft = X * imageWidth;
		const rawTop = Y * imageHeight;
		const rawWidth = W * imageWidth;
		const rawHeight = H * imageHeight;

		// Clamp so no negative crop and stays within image
		const left = clamp(Math.round(rawLeft), 0, imageWidth - 1);
		const top = clamp(Math.round(rawTop), 0, imageHeight - 1);

		// Ensure width and height don't go beyond image bounds
		const width = clamp(Math.round(rawWidth), 1, imageWidth - left);
		const height = clamp(Math.round(rawHeight), 1, imageHeight - top);

		await image.extract({ left, top, width, height }).toFile(outputPath);

		return {
			success: true,
			path: outputPath,
			dimensions: { width, height },
		};
	} catch (error) {
		console.error("Error cropping image:", error);
		return { success: false, error: error.message };
	}
}

// processing for slider type
async function processImageSlider(jsonResponse, originalImagePath) {
	const processedSlides = [];
	const slides = jsonResponse["Json Object"]?.AbstractParameter?.["Slides 2"] || [];

	for (let i = 0; i < slides.length; i++) {
		const slide = slides[i];
		const photo = slide.Photo;

		if (photo?.["_NormalizedCoordinates_"]) {
			const uniqueId = uuidv4();
			const outputFileName = `slide_${uniqueId}.jpg`;
			const outputPath = path.join(processedImagesDir, outputFileName);

			const cropResult = await cropImage(originalImagePath, photo._NormalizedCoordinates_, outputPath);

			if (cropResult.success) {
				processedSlides.push({
					...slide,
					Photo: {
						...photo,
						_Picture_: `http://localhost:3001/processed-images/${outputFileName}`,
						_ProcessedPath_: outputPath,
					},
				});
			} else {
				console.error(`Failed to crop slide ${i}:`, cropResult.error);
				processedSlides.push(slide);
			}
		} else {
			processedSlides.push(slide);
		}
	}

	return {
		...jsonResponse,
		"Json Object": {
			...jsonResponse["Json Object"],
			AbstractParameter: {
				...jsonResponse["Json Object"].AbstractParameter,
				"Slides 2": processedSlides,
			},
		},
	};
}

// processing for image blinder type
async function processImageBlinder(jsonResponse, originalImagePath) {
	const processedSlides = [];
	const slides = jsonResponse["Json Object"]?.AbstractParameter?.["Slides 2"] || [];

	for (let i = 0; i < slides.length; i++) {
		const slide = slides[i];

		if (slide?.["_NormalizedCoordinates_"]) {
			const uniqueId = uuidv4();
			const outputFileName = `blinder_${uniqueId}.jpg`;
			const outputPath = path.join(processedImagesDir, outputFileName);

			const cropResult = await cropImage(originalImagePath, slide._NormalizedCoordinates_, outputPath);

			if (cropResult.success) {
				processedSlides.push({
					...slide,
					_Picture_: `http://localhost:3001/processed-images/${outputFileName}`,
					_ProcessedPath_: outputPath,
				});
			} else {
				console.error(`Failed to crop blinder slide ${i}:`, cropResult.error);
				processedSlides.push(slide);
			}
		} else {
			processedSlides.push(slide);
		}
	}

	return {
		...jsonResponse,
		"Json Object": {
			...jsonResponse["Json Object"],
			AbstractParameter: {
				...jsonResponse["Json Object"].AbstractParameter,
				"Slides 2": processedSlides,
			},
		},
	};
}

// ----------------------------------

// --- Prompt Templates ---

const promptTemplates = require("./promptTemp");

// --- Middleware for Input Validation ---
function validateInput(req, res, next) {
	if (!req.file) {
		return res.status(400).json({ error: "Image file is required." });
	}
	const { promptType } = req.body;
	if (!promptType) {
		return res.status(400).json({ error: "promptType is required in the request body." });
	}
	if (!promptTemplates[promptType]) {
		return res.status(400).json({
			error: `Unsupported promptType: ${promptType}. Supported types are: ${Object.keys(promptTemplates).join(
				", "
			)}`,
		});
	}
	next();
}

// generic endpoint
app.post("/process-images", upload.single("file"), async (req, res) => {
	const { type } = req.body; // e.g. "image-slider", "product-labels", etc.
	console.log("the type is : ", type);

	if (!req.file) {
		return res.status(400).json({ error: "File is required." });
	}
	if (!type) {
		return res.status(400).json({ error: "Type is required." });
	}

	const filePath = req.file.path;
	const mimeType = req.file.mimetype;

	try {
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		// Dynamically get prompt template based on type
		const prompt = promptTemplates[type];
		// const prompt = promptTemplates.imageSlider
		if (!prompt) {
			return res.status(400).json({ error: `Unknown processing type: ${type}` });
		}

		const filePart = fileToGenerativePart(filePath, mimeType);

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
			contents: [{ role: "user", parts: [filePart, { text: prompt }] }],
			generationConfig,
			safetySettings,
		});

		const rawText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!rawText) {
			console.error("Unexpected Gemini response structure:", JSON.stringify(result.response, null, 2));
			return res.status(500).json({ error: "Could not extract text from AI response." });
		}

		console.log("------------------------Gemini Response----------------------------");
		console.log(rawText);
		console.log("----------------------------------------------------");

		// let jsonResponse;
		// try {
		// 	const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/i);
		// 	if (!jsonMatch) throw new Error("No valid ```json block found.");
		// 	jsonResponse = JSON.parse(jsonMatch[1].trim());
		// } catch (parseError) {
		// 	console.error("Failed to parse Gemini response as JSON.", parseError);
		// 	return res.status(500).json({
		// 		error: "The AI response was not valid JSON.",
		// 		rawResponse: rawText,
		// 	});
		// }
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
			console.error("Failed to parse Gemini response as JSON.", parseError);
			return res.status(500).json({
				error: "The AI response was not valid JSON.",
				rawResponse: rawText,
			});
		}

		// Optional type-specific processing
		let finalResponse = jsonResponse;
		if (type === "Image Slider" || type === "Image Blinder") {
			finalResponse = await processImageSlider(jsonResponse, filePath);
		} else if (type === "Image Blinder") {
			finalResponse = await processImageBlinder(jsonResponse, filePath);
		}

		res.status(200).json({ result: finalResponse });
	} catch (error) {
		console.error(`Error processing content of type '${req.body.type}':`, error);
		res.status(500).json({ error: "An error occurred while processing the content." });
	} finally {
		setTimeout(() => {
			fs.unlink(filePath, (err) => {
				if (err) console.error(`Failed to delete temporary file: ${filePath}`, err);
				else console.log(`Deleted temporary file: ${filePath}`);
			});
		}, 500);
	}
});

// -----------------------
// --- Image Processing Endpoint ---
// app.post("/process-image-slider", upload.single("image"), async (req, res) => {
// 	if (!req.file) {
// 		return res.status(400).json({ error: "Image file is required." });
// 	}

// 	const imageFilePath = req.file.path;
// 	const mimeType = req.file.mimetype;

// 	try {
// 		// Use Gemini multimodal model
// 		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// 		const prompt = promptTemplates.imageSlider;
// 		const imagePart = fileToGenerativePart(imageFilePath, mimeType);

// 		const generationConfig = {
// 			temperature: 0.2,
// 			topK: 1,
// 			topP: 1,
// 			maxOutputTokens: 2048,
// 		};

// 		const safetySettings = [
// 			{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
// 			{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
// 			{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
// 			{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
// 		];

// 		const result = await model.generateContent({
// 			contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
// 			generationConfig,
// 			safetySettings,
// 		});

// 		const response = result.response;
// 		if (!response.candidates || !response.candidates[0].content.parts[0].text) {
// 			console.error("Unexpected Gemini response structure:", JSON.stringify(response, null, 2));
// 			return res.status(500).json({ error: "Could not extract text from AI response." });
// 		}

// 		const rawText = response.candidates[0].content.parts[0].text;

// 		// Clean and parse the JSON response from Gemini
// 		let jsonResponse;
// 		try {
// 			// Try to extract the actual JSON block between ```json and ```
// 			const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/i);

// 			if (!jsonMatch) {
// 				throw new Error("No valid ```json block found in the response.");
// 			}

// 			const cleanedText = jsonMatch[1].trim();

// 			// Optionally fix field names if necessary
// 			const correctedText = cleanedText.replace(/"Slides"\s*:/, '"Slides 2":');

// 			jsonResponse = JSON.parse(correctedText);
// 		} catch (parseError) {
// 			console.error("Failed to parse Gemini response as JSON.", parseError);
// 			return res.status(500).json({
// 				error: "The AI response was not valid JSON.",
// 				rawResponse: rawText,
// 			});
// 		}

// 		// Process the slides and crop images
// 		const processedSlides = [];
// 		const slides = jsonResponse["Json Object"].AbstractParameter["Slides 2"] || [];

// 		for (let i = 0; i < slides.length; i++) {
// 			const slide = slides[i];
// 			const photo = slide.Photo;

// 			if (photo && photo._NormalizedCoordinates_) {
// 				const uniqueId = uuidv4();
// 				const outputFileName = `slide_${uniqueId}.jpg`;
// 				const outputPath = path.join(processedImagesDir, outputFileName);

// 				const cropResult = await cropImage(imageFilePath, photo._NormalizedCoordinates_, outputPath);

// 				if (cropResult.success) {
// 					processedSlides.push({
// 						...slide,
// 						Photo: {
// 							...photo,
// 							_Picture_: `processed-images/${outputFileName}`,
// 							_ProcessedPath_: outputPath,
// 						},
// 					});
// 				} else {
// 					console.error(`Failed to crop slide ${i}:`, cropResult.error);
// 					processedSlides.push(slide);
// 				}
// 			} else {
// 				processedSlides.push(slide);
// 			}
// 		}

// 		// Update the response with processed slides
// 		const finalResponse = {
// 			...jsonResponse,
// 			"Json Object": {
// 				...jsonResponse["Json Object"],
// 				AbstractParameter: {
// 					...jsonResponse["Json Object"].AbstractParameter,
// 					"Slides 2": processedSlides,
// 				},
// 			},
// 		};

// 		res.status(200).json({ result: finalResponse });
// 	} catch (error) {
// 		console.error("Error processing image slider:", error);
// 		res.status(500).json({ error: "An error occurred while processing the image slider." });
// 	} finally {
// 		// Delete uploaded file after processing

// 		// fs.unlink(imageFilePath, (err) => {
// 		// 	if (err) {
// 		// 		console.error(`Failed to delete temporary file: ${imageFilePath}`, err);
// 		// 	}
// 		// });
// 		setTimeout(() => {
// 			fs.unlink(imageFilePath, (err) => {
// 				if (err) {
// 					console.error(`Failed to delete temporary file: ${imageFilePath}`, err);
// 				} else {
// 					console.log(`Deleted temporary file: ${imageFilePath}`);
// 				}
// 			});
// 		}, 500);

// 	}
// });

// --- Main API Endpoint (keeping for backward compatibility) ---
app.post("/analyze-image", upload.single("image"), validateInput, async (req, res) => {
	const { promptType } = req.body;
	const imageFilePath = req.file.path;
	const mimeType = req.file.mimetype;

	try {
		// Use Gemini multimodal model
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
			safetySettings,
		});

		const response = result.response;
		if (!response.candidates || !response.candidates[0].content.parts[0].text) {
			console.error("Unexpected Gemini response structure:", JSON.stringify(response, null, 2));
			return res.status(500).json({ error: "Could not extract text from AI response." });
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
			console.error("Failed to parse Gemini response as JSON.", parseError);
			return res.status(500).json({
				error: "The AI response was not valid JSON.",
				rawResponse: rawText,
			});
		}

		res.status(200).json({ result: jsonResponse });
	} catch (error) {
		console.error("Gemini API Error:", error);
		res.status(500).json({ error: "An error occurred while processing the image with the Gemini API." });
	} finally {
		// Delete uploaded file after processing
		// fs.unlink(imageFilePath, (err) => {
		// 	if (err) {
		// 		console.error(`Failed to delete temporary file: ${imageFilePath}`, err);
		// 	}
		// });
		setTimeout(() => {
			fs.unlink(imageFilePath, (err) => {
				if (err) {
					console.error(`Failed to delete temporary file: ${imageFilePath}`, err);
				} else {
					console.log(`Deleted temporary file: ${imageFilePath}`);
				}
			});
		}, 500);
	}
});

// --- Health and Test Routes ---
app.get("/health", (req, res) => {
	res.status(200).send("Backend is running and healthy");
});

app.get("/test-gemini", async (req, res) => {
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
	res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
