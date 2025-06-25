import React, { useState, useEffect } from "react";
import "./App.css";
import ImageSlider from "./assets/Component/ImageSlider/ImageSlider";

function App() {
	const [name, setName] = useState("Explanation");
	const [type, setType] = useState("");
	const [jsonResponseText, setJsonResponseText] = useState("");
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [processedData, setProcessedData] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState("");

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

			setProcessedData(data.result);
			setJsonResponseText(JSON.stringify(data.result, null, 2));
		} catch (error) {
			console.error("Error processing image:", error);
			setError(`Error processing image: ${error.message}`);
		} finally {
			setIsProcessing(false);
		}
	};

	useEffect(() => {
		if (type && name && selectedImage) {
			const jsonOutput = {
				"Json Object": {
					ObjectType: type,
					ObjectName: name,
					AbstractParameter: {
						Title: name,
						"Slides 2": [
							{
								Photo: {
									_Picture_: selectedImage.name || "image.png",
									_NormalizedCoordinates: "(x = 0.0, y = 0.0, h = 1.0, w = 1.0)",
								},
								_AltText_: "نص بديل للصورة",
								_HoverText_: "نص يظهر عند تمرير المؤشر",
							},
						],
					},
				},
			};
			setJsonResponseText(JSON.stringify(jsonOutput, null, 2));
		}
	}, [type, name, selectedImage]);

	return (
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
							<option value="Interactive Video">Interactive Video</option>
							<option value="Phases">Phases</option>
							<option value="Pie Chart">Pie Chart</option>
							<option value="Lifecycles">Lifecycles</option>
							<option value="Numeric Table">Numeric Table</option>
							<option value="Two Events">Two Events</option>
							<option value="Two Step Experiment">Two Step Experiment</option>
							<option value="Number Line">Number Line</option>
							<option value="Ordering">Ordering</option>
							<option value="Flashcards">Flashcards</option>
							<option value="Matching">Matching</option>
							<option value="Labeling">Labeling</option>
							<option value="Sequencing">Sequencing</option>
							<option value="Categorization">Categorization</option>
							<option value="Cause and Effect">Cause and Effect</option>
							<option value="Analogy">Analogy</option>
							<option value="Multiple Choice">Multiple Choice</option>
							<option value="True False">True False</option>
							<option value="Short Answer">Short Answer</option>
							<option value="Fill in the Blanks">Fill in the Blanks</option>
							<option value="Drag and Drop">Drag and Drop</option>
							<option value="Mark the Words">Mark the Words</option>
							<option value="Point on Image">Point on Image</option>
							<option value="Image Zoom">Image Zoom</option>
							<option value="Virtual Tour">Virtual Tour</option>
							<option value="3D Model">3D Model</option>
							<option value="Simulation">Simulation</option>
							<option value="Game">Game</option>
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

				{previewImage && (
					<div className="image-preview">
						<h3>معاينة الصورة:</h3>
						<img src={previewImage} alt="معاينة" />
					</div>
				)}

				{error && (
					<div className="error-message">
						<p>{error}</p>
					</div>
				)}

				<div className="submit-section">
					<button className="submit-button" onClick={processImage} disabled={isProcessing || !selectedImage}>
						{isProcessing ? "Processing..." : "PROCESS IMAGE"}
					</button>
				</div>

				{processedData && (
					<div className="results-section">
						<h3>Processed Results</h3>
						<ImageSlider
							slides={processedData["Json Object"].AbstractParameter["Slides 2"] || []}
							title={processedData["Json Object"].AbstractParameter.Title || name}
						/>
					</div>
				)}

				<div className="gpt-section">
					<div className="json-response-control">
						<label htmlFor="jsonResponse">Json Response</label>
						<textarea
							id="jsonResponse"
							value={jsonResponseText}
							onChange={(e) => setJsonResponseText(e.target.value)}
							placeholder="Json Response"
							readOnly
						/>
					</div>
				</div>
			</main>
		</div>
	);
}

export default App;
