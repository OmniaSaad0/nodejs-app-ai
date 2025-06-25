# Image Processing and Slider System

This project provides a complete solution for processing images using AI to extract coordinates, cropping images based on those coordinates, and displaying them in an interactive slider.

## Features

-   **AI-Powered Image Analysis**: Uses Google Gemini AI to analyze images and extract normalized coordinates
-   **Image Cropping**: Automatically crops images based on AI-provided coordinates using Sharp
-   **Interactive Slider**: Displays processed images in a modern, responsive carousel
-   **Real-time Processing**: Upload images and see results immediately
-   **JSON Response**: Provides structured JSON output with all slide information

## Project Structure

```
nodejs-app-ai/
├── backend/
│   ├── server-enhanced.js    # Enhanced server with image processing
│   ├── package.json          # Backend dependencies
│   └── processed-images/     # Generated cropped images
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── assets/
│   │   │   └── Component/
│   │   │       └── ImageSlider/
│   │   │           ├── ImageSlider.jsx
│   │   │           └── ImageSlider.css
│   │   └── App.css
│   └── package.json          # Frontend dependencies
└── README.md
```

## Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   Google Gemini API key

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
API_KEY=your_gemini_api_key_here
PORT=3001
```

### 4. Start the Backend Server

```bash
cd backend
node server-enhanced.js
```

The server will start on port 3001 and create a `processed-images` directory for storing cropped images.

### 5. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

### 1. Upload an Image

-   Click the "📤 UPLOAD IMAGE" button
-   Select an image file (JPG, PNG, etc.)
-   The image will be previewed

### 2. Process the Image

-   Click "PROCESS IMAGE" to send the image to the AI
-   The system will:
    -   Analyze the image using Gemini AI
    -   Extract normalized coordinates for different sections
    -   Crop the image into multiple slides
    -   Generate JSON response with slide information

### 3. View Results

-   The processed images will be displayed in an interactive slider
-   Each slide shows:
    -   Cropped image section
    -   Alt text (description)
    -   Hover text (additional information)
-   Navigate through slides using arrow buttons or dots
-   View the complete JSON response below the slider

## API Endpoints

### POST /process-image-slider

Processes an image and returns cropped slides with coordinates.

**Request:**

-   Content-Type: multipart/form-data
-   Body: image file

**Response:**

```json
{
	"result": {
		"Json Object": {
			"ObjectType": "Image Slider",
			"ObjectName": "Example",
			"AbstractParameter": {
				"Title": "Example",
				"Slides 2": [
					{
						"Photo": {
							"_Picture_": "/processed-images/slide_uuid.jpg",
							"_NormalizedCoordinates": "(x = 0.0, y = 0.0, h = 0.5, w = 0.5)"
						},
						"_AltText_": "Description of the image",
						"_HoverText_": "Additional information"
					}
				]
			}
		}
	}
}
```

### GET /health

Health check endpoint.

### GET /test-gemini

Test Gemini API connection.

## Technical Details

### Image Processing

-   Uses **Sharp** library for high-performance image processing
-   Converts normalized coordinates (0-1 range) to pixel coordinates
-   Crops images based on AI-provided coordinates
-   Stores processed images with unique UUIDs

### AI Integration

-   Uses **Google Gemini 2.0 Flash** model for image analysis
-   Processes images to extract meaningful sections
-   Generates structured JSON with coordinates and descriptions

### Frontend Components

-   **React Slick** for carousel functionality
-   Responsive design with mobile support
-   Error handling and loading states
-   Real-time image preview

## Dependencies

### Backend

-   `express`: Web framework
-   `multer`: File upload handling
-   `sharp`: Image processing
-   `uuid`: Unique ID generation
-   `@google/generative-ai`: Gemini AI integration
-   `cors`: Cross-origin resource sharing

### Frontend

-   `react`: UI framework
-   `react-slick`: Carousel component
-   `slick-carousel`: Carousel styles
-   `bootstrap`: CSS framework

## Troubleshooting

### Common Issues

1. **API Key Error**

    - Ensure your Gemini API key is correctly set in the `.env` file
    - Verify the API key has proper permissions

2. **Image Processing Fails**

    - Check that the image format is supported (JPG, PNG, etc.)
    - Ensure the image file is not corrupted
    - Verify the backend server is running

3. **CORS Errors**

    - Make sure the backend CORS configuration is correct
    - Check that the frontend is making requests to the correct backend URL

4. **Slider Not Displaying**
    - Verify that `react-slick` and `slick-carousel` are installed
    - Check browser console for JavaScript errors

### Debug Mode

To enable debug logging, add this to your backend:

```javascript
console.log("Debug mode enabled");
// Add more detailed logging throughout the code
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
