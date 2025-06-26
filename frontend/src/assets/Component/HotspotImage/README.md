# HotspotImage Component

A React component that displays an image with interactive markers and tooltips using the `react-image-marker` package.

## Features

-   ✅ Interactive markers on images
-   ✅ Hover tooltips with custom content
-   ✅ Responsive design
-   ✅ Customizable styling
-   ✅ Support for multiple markers
-   ✅ JSON data integration
-   ✅ Accessibility features

## Installation

The component requires the `react-image-marker` package:

```bash
npm install react-image-marker
```

## Usage

### Basic Usage

```jsx
import HotspotImage from "./assets/Component/HotspotImage/HotspotImage";

const MyComponent = () => {
	const hotspotData = {
		"Json Object": {
			ObjectType: "Hotspot Image",
			ObjectName: "My Diagram",
			AbstractParameter: {
				_Picture_: "path/to/image.jpg",
				_AltText_: "Description of the image",
				hotSpots: [
					{
						_Xposition_: "25",
						_Yposition_: "30",
						_Header_: "Point 1",
						_HotspotText_: "Description of point 1",
						_HotspotText2_: "Additional info",
					},
				],
			},
		},
	};

	return (
		<HotspotImage
			data={hotspotData}
			imageUrl="path/to/image.jpg" // Optional: override image URL
		/>
	);
};
```

### JSON Data Structure

The component expects data in the following format:

```json
{
	"Json Object": {
		"ObjectType": "Hotspot Image",
		"ObjectName": "Diagram Name",
		"AbstractParameter": {
			"_Picture_": "image.jpg",
			"_AltText_": "Image description",
			"hotSpots": [
				{
					"_Xposition_": "25", // X position as percentage (0-100)
					"_Yposition_": "30", // Y position as percentage (0-100)
					"_Header_": "Marker Title",
					"_HotspotText_": "Main description",
					"_HotspotText2_": "Additional text (optional)"
				}
			]
		}
	}
}
```

## Props

| Prop       | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `data`     | Object | Yes      | JSON data containing hotspot information |
| `imageUrl` | String | No       | Override the image URL from the data     |

## Features

### Interactive Markers

-   Animated red dots with pulse effect
-   Hover animations
-   Click handlers for custom actions

### Tooltips

-   Appear on hover
-   Display header, main text, and optional secondary text
-   Smooth fade-in animation
-   Responsive positioning

### Styling

-   Modern, clean design
-   Responsive layout
-   Customizable CSS classes
-   Mobile-friendly

## Testing

Use the included `HotspotImageTest` component to test the functionality:

```jsx
import HotspotImageTest from "./assets/Component/HotspotImage/HotspotImageTest";

// In your app
<HotspotImageTest />;
```

## Customization

### CSS Classes

The component uses the following CSS classes for styling:

-   `.hotspot-image-container` - Main container
-   `.image-marker-wrapper` - Image wrapper
-   `.custom-marker-point` - Individual marker
-   `.marker-dot` - Marker dot styling
-   `.marker-tooltip` - Tooltip container
-   `.tooltip-header` - Tooltip title
-   `.tooltip-text` - Tooltip main text
-   `.tooltip-text2` - Tooltip secondary text

### Custom Marker Component

You can customize the marker appearance by modifying the `CustomMarker` component in the file.

## Browser Support

-   Modern browsers with ES6+ support
-   React 16.8+ (for hooks)
-   Responsive design for mobile devices

## Dependencies

-   `react-image-marker`: ^1.2.0
-   `react`: ^18.3.1
-   `react-dom`: ^18.3.1
