import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('Explanation');
  const [type, setType] = useState('');
  const [jsonResponseText, setJsonResponseText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
                  _NormalizedCoordinates: "(x = 0.0, y = 0.0, h = 1.0, w = 1.0)"
                },
                _AltText_: "نص بديل للصورة",
                _HoverText_: "نص يظهر عند تمرير المؤشر"
              }
            ]
          }
        }
      };
      setJsonResponseText(JSON.stringify(jsonOutput, null, 2));
    } else {
      setJsonResponseText('');
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
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              <option value="BarChart">BarChart : Chart</option>
              <option value="PieChart">PieChart : Chart</option>
              <option value="NumericTable">NumericTable : Chart</option>
              <option value="Analytics">Analytics : Chart</option>
              <option value="Classification"> ImageSlider</option>
              
              <option value="Phases">Phases : Aggamotto</option>
              <option value="Cycle">Cycle : Aggamotto</option>
              <option value="LifeCycle">LifeCycle : Aggamotto</option>
              <option value="ChemicalReaction">ChemicalReaction : Aggamotto</option>
              <option value="ChemicalEquation">ChemicalEquation : Aggamotto</option>
              <option value="Before&After">Before&After : Juxtaposition</option>
              <option value="2Events">2Events : Juxtaposition</option>
              <option value="2StepExperiment">2StepExperiment : Juxtaposition</option>
            </select>
          </div>
        </div>

        <div className="upload-actions">
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            className="visually-hidden"
          />
          <button
            className="upload-images-button"
            onClick={() => document.getElementById('imageUpload').click()}
          >
            📤 UPLOAD IMAGE
          </button>
          {!previewImage && (
            <button
              className="display-image-button"
              onClick={() => setPreviewImage(previewImage)}
            >
              👁️ DISPLAY IMAGE
            </button>
          )}
        </div>

        {previewImage && (
          <div className="image-preview">
            <h3>معاينة الصورة:</h3>
            <img src={previewImage} alt="معاينة" />
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

        <div className="intermediate-actions">
          <button
            className="create-object-button"
            onClick={() => console.log("Create Object clicked")}
          >
            🧩 Create Object
          </button>
        </div>

        <div className="submit-section">
          <button
            className="submit-button"
            onClick={() => console.log('Submitted')}
          >
            ✅ SUBMIT
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;