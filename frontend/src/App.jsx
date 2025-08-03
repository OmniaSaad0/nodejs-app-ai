import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import ImageSlider from "./assets/Component/ImageSlider/ImageSlider";
import HotspotImage from "./assets/Component/HotspotImage/HotspotImage";
import ImageBlinder from "./assets/Component/ImageBlinder/ImageBlinder";
import ImageJuxtaposition from "./assets/Component/ImageJuxtaposition/ImageJuxtaposition";
import Chart from "./assets/Component/Chart/Chart";
import Accordion from "./assets/Component/Accordion/Accordion";

import MCQ from "./assets/Component/MCQ/MCQ";
import TrueFalse from "./assets/Component/TrueFalse/TrueFalse";
import MarkTheWord from "./assets/Component/MarkTheWord/MarkTheWord";
import ImageMCQ from "./assets/Component/ImageMCQ/ImageMCQ";
import DragAndDrop from "./assets/Component/DragAndDrop/DragAndDrop";
import FillInTheBlank from "./assets/Component/FillInTheBlank/FillInTheBlank";
import Essay from "./assets/Component/Essay/Essay";
import SortParagraph from "./assets/Component/SortParagraph/SortParagraph";


function ResultPage() {
	const [result, setResult] = useState(null);
	const [type, setType] = useState("");
	const [name, setName] = useState("");
	const [previewImage, setPreviewImage] = useState("")

	useEffect(() => {
		const stored = sessionStorage.getItem("resultData");
		const imgStr = sessionStorage.getItem("previewImage");
		if (stored) {
			const parsed = JSON.parse(stored);
			setResult(parsed.result);
			setType(parsed.type);
			setName(parsed.name);

			// Hotspot Image fallback: use _Picture_ from JSON if previewImage is missing
			if (
				parsed.type === "Hotspot Image" &&
				!imgStr &&
				parsed.result &&
				parsed.result["Json Object"] &&
				parsed.result["Json Object"].AbstractParameter &&
				parsed.result["Json Object"].AbstractParameter._Picture_
			) {
				setPreviewImage(parsed.result["Json Object"].AbstractParameter._Picture_);
			}
		}
		if (imgStr) {
			setPreviewImage(atob(imgStr));
		}
	}, []);



	if (!result) return <div className="results-section"><h3>لا توجد نتائج</h3></div>;

	return (
		<div className="results-section">
			<h3>Processed Results</h3>
			{type === "Image Blinder" && (
				<ImageBlinder
					slides={result["Json Object"].AbstractParameter["Slides 2"] || []}
					title={result["Json Object"].AbstractParameter._Title_ || name}
				/>
			)}
			{type === "Image Slider" && (
				<ImageSlider
					slides={result["Json Object"].AbstractParameter["Slides 2"] || []}
					title={result["Json Object"].AbstractParameter["_Title_"] || name}
				/>
			)}
			{type === "Hotspot Image" && previewImage && (
				<HotspotImage
					data={result}
					imageUrl={previewImage}
				/>

			)}
			{type === "Image Juxtaposition" && (
				<ImageJuxtaposition data={result} />
			)}
			{type === "Chart" && (
				<>
					{console.log("Chart type detected, result:", result)}
					<Chart data={result} />
				</>
			)}
			{type === "Accordion" && (
				<Accordion data={result} />
			)}

			{type === "MCQ" && (
				<MCQ data={result} />
			)}
			{type === "True False" && (
				<TrueFalse data={result} />
			)}
			{type === "Mark the Word" && (
				<MarkTheWord data={result} />
			)}
			{type === "Image MCQ" && (
				<ImageMCQ data={result} />
			)}
			{type === "Text Drag Word" && (
				<DragAndDrop data={result} />
			)}
			{type === "Fill in the Blank" && (
				<FillInTheBlank data={result} />
			)}
			{type === "Essay" && (
				<Essay data={result} />
			)}
			{type === "Sort Paragraph" && (
				<SortParagraph data={result} />
			)}
		</div>
	);
}

function App() {
	const [name, setName] = useState("Explanation");
	const [type, setType] = useState("");
	const [jsonResponseText, setJsonResponseText] = useState("");
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");
	const [selectedJson, setSelectedJson] = useState(null);
	const [jsonError, setJsonError] = useState("");
	const [inputMode, setInputMode] = useState("image"); // 'image' or 'json'
	const [pastedJsonText, setPastedJsonText] = useState("");
	const navigate = useNavigate();

	const handleImageChange = (event) => {
		if (event.target.files && event.target.files[0]) {
			const imageFile = event.target.files[0];
			setSelectedImage(imageFile);
			const reader = new FileReader();
			reader.onload = () => {
				setPreviewImage(reader.result);
			};
			reader.readAsDataURL(imageFile);
		} else {
			setPreviewImage(null);
		}
	};

	// const handleJsonChange = (event) => {
	// 	const file = event.target.files && event.target.files[0];
	// 	if (!file) {
	// 		setSelectedJson(null);
	// 		setJsonError("");
	// 		return;
	// 	}
	// 	const reader = new FileReader();
	// 	reader.onload = (e) => {
	// 		try {
	// 			const parsed = JSON.parse(e.target.result);
	// 			// Basic validation: must have at least 'Json Object' or 'slides' key
	// 			if (
	// 				parsed["Json Object"] || parsed["slides"]
	// 			) {
	// 				setSelectedJson(parsed);
	// 				setJsonError("");
	// 				setInputMode("json");
	// 			} else {
	// 				setSelectedJson(null);
	// 				setJsonError("JSON must contain 'Json Object' or 'slides' key.");
	// 			}
	// 		} catch (err) {
	// 			setSelectedJson(null);
	// 			setJsonError("Invalid JSON file.");
	// 		}
	// 	};
	// 	reader.readAsText(file);
	// };

	const handlePastedJson = () => {
		try {
			const parsed = JSON.parse(pastedJsonText);
			// if (parsed["Json Object"]) {
				setSelectedJson(parsed);
				setJsonError("");
				setInputMode("json");
			// } else {
			// 	setSelectedJson(null);
			// 	setJsonError("JSON must contain 'Json Object'.");
			// }
		} catch (err) {
			setSelectedJson(null);
			setJsonError("Invalid JSON in text field.");
		}
	};

	const processImage = async () => {
		if (!selectedImage) {
			setError("Please select an image first");
			return;
		}
		if (!type) {
			setError("Please select a type");
			return;
		}

		setIsProcessing(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("file", selectedImage);
			formData.append("type", type);

			const response = await fetch("http://localhost:3001/process-images", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			// Store result in sessionStorage and open result page in new tab
			const resultId = Date.now();
			sessionStorage.setItem(
				"resultData",
				JSON.stringify({ result: data.result, type, name })
			);
			sessionStorage.setItem("previewImage", btoa(previewImage))
			const url = `/result/${encodeURIComponent(type)}/${resultId}`;
			window.open(url, '_blank');

			// Set the final JSON for display
			setJsonResponseText(JSON.stringify(data.result, null, 2));
		} catch (error) {
			console.error("Error processing image:", error);
			setError(`Error processing image: ${error.message}`);
		} finally {
			setIsProcessing(false);
		}
	};

	const processJsonDirect = () => {
		if (!selectedJson) {
			setJsonError("No valid JSON selected.");
			return;
		}
		if (!type) {
			setJsonError("Please select a type.");
			return;
		}

		// Store result in sessionStorage and open result page in new tab
		const resultId = Date.now();
		sessionStorage.setItem(
			"resultData",
			JSON.stringify({ result: selectedJson, type, name })
		);
		sessionStorage.removeItem("previewImage");
		const url = `/result/${encodeURIComponent(type)}/${resultId}`;
		window.open(url, '_blank');
		setJsonResponseText(JSON.stringify(selectedJson, null, 2));
	};

	return (
		<Routes>
			<Route
				path="/"
				element={
					<div className="app-container">
						<header className="app-header">
							<div className="learning-objects-logo">
								LEARNING OBJECTS <span className="book-icon">📖</span>
							</div>
							<button className="hamburger-menu">☰</button>
						</header>

						<main className="app-main">
							<div className="form-header">
								<div className="name-section">
									<label htmlFor="name">NAME:</label>
									<input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
								</div>

								<div className="type-section">
									<label htmlFor="type">TYPE:</label>
									<select
										id="type"
										value={type}
										onChange={(e) => setType(e.target.value)}
										className="type-select"
									>
										<option value="">-- Select an option --</option>
										<option value="Hotspot Image">Hotspot Image</option>
										<option value="Image Blinder">Image Blinder</option>
										<option value="Image Juxtaposition">Image Juxtaposition</option>
										<option value="Image Slider">Image Slider</option>
										<option value="Chart">Chart</option>
										<option value="Accordion">Accordion</option>
										<option value="MCQ">MCQ</option>
										<option value="Image MCQ">Image MCQ</option>
										<option value="Fill in the Blank">Fill in the Blank</option>
										<option value="Text Drag Word">Text Drag Word</option>
										<option value="Sort Paragraph">Sort Paragraph</option>
										<option value="True False">True False</option>
										<option value="Mark the Word">Mark the Word</option>
										<option value="Essay">Essay</option>
									</select>
								</div>
							</div>

							<div className="upload-actions">
								<input
									type="file"
									id="imageUpload"
									accept="image/*"
									onChange={handleImageChange}
									style={{ display: "none" }}
									className="visually-hidden"
								/>
								<button
									className="upload-images-button"
									onClick={() => document.getElementById("imageUpload").click()}
								>
									📤 UPLOAD IMAGE
								</button>
								
							</div>
							<div className="json-paste-section">
								<label htmlFor="jsonPaste">Paste JSON here:</label>
								<textarea
									id="jsonPaste"
									rows={6}
									value={pastedJsonText}
									onChange={e => setPastedJsonText(e.target.value)}
									placeholder="Paste your JSON here..."
									style={{ width: "100%", fontFamily: "monospace" }}
								/>
								<button className="upload-images-button" onClick={handlePastedJson} style={{ marginTop: 8 }}>
									Use Direct JSON
								</button>
							</div>
							{(selectedImage && selectedJson) && (
								<div className="input-mode-select">
									<label>
										<input
											type="radio"
											name="inputMode"
											value="image"
											checked={inputMode === "image"}
											onChange={() => setInputMode("image")}
										/>
										Use Image
									</label>
									<label>
										<input
											type="radio"
											name="inputMode"
											value="json"
											checked={inputMode === "json"}
											onChange={() => setInputMode("json")}
										/>
										Use JSON
									</label>
								</div>
							)}
							{selectedJson && (
								<div className="json-preview-block">
									<label>Uploaded JSON Preview</label>
									<pre className="json-block"><code>{JSON.stringify(selectedJson, null, 2)}</code></pre>
								</div>
							)}
							{jsonError && (
								<div className="error-message">
									<p>{jsonError}</p>
								</div>
							)}
							{previewImage && inputMode === "image" && (
								<div className="image-preview">
									<h3>Preview Image</h3>
									<img src={previewImage} alt="Preview" />
								</div>
							)}
							{error && (
								<div className="error-message">
									<p>{error}</p>
								</div>
							)}

							<div className="submit-section">
								{inputMode === "image" ? (
									<button className="submit-button" onClick={processImage} disabled={isProcessing || !selectedImage}>
										{isProcessing ? "Creating..." : "Create Object from Image"}
									</button>
								) : (
									<button className="submit-button" onClick={processJsonDirect} disabled={!selectedJson}>
										Create Object from JSON
									</button>
								)}
							</div>

							{jsonResponseText && inputMode === "image" && (
								<div className="json-preview-block">
									<label>Final JSON</label>
									<pre className="json-block"><code>{jsonResponseText}</code></pre>
								</div>
							)}
						</main>
					</div>
				}
			/>
			<Route path="/result/:type/:id" element={<ResultPage />} />
		</Routes>
	);
}

export default App;
