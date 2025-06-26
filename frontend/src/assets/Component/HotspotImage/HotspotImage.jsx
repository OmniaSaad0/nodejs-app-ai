import React, { useState, useEffect } from "react";
import ImageMarker from "react-image-marker";
import "./HotspotImage.css";

const HotspotImage = ({ data, imageUrl }) => {
	const [markers, setMarkers] = useState([]);

	// Sample data for testing
	const sampleData = {
		"Json Object": {
			ObjectType: "Hotspot Image",
			ObjectName: "Sample Diagram",
			AbstractParameter: {
				_Picture_: "https://via.placeholder.com/600x400/007bff/ffffff?text=Sample+Image",
				_AltText_: "A sample diagram for testing hotspot functionality",
				hotSpots: [
					{
						_Xposition_: "25",
						_Yposition_: "30",
						_Header_: "Sample Point 1",
						_HotspotText_: "This is a sample hotspot point for testing purposes.",
						_HotspotText2_: "Additional information can be displayed here.",
					},
					{
						_Xposition_: "75",
						_Yposition_: "60",
						_Header_: "Sample Point 2",
						_HotspotText_: "Another sample hotspot point with different content.",
						_HotspotText2_: " ",
					},
				],
			},
		},
	};

	// Use provided data or fallback to sample data
	const displayData = data || sampleData;

	// Convert JSON data to markers format
	useEffect(() => {
		if (displayData && displayData["Json Object"]?.AbstractParameter?.hotSpots) {
			const hotspotMarkers = displayData["Json Object"].AbstractParameter.hotSpots.map((hotspot, index) => ({
				id: index,
				top: parseFloat(hotspot._Yposition_),
				left: parseFloat(hotspot._Xposition_),
				header: hotspot._Header_,
				text: hotspot._HotspotText_,
				text2: hotspot._HotspotText2_,
			}));
			setMarkers(hotspotMarkers);
		}
	}, [displayData]);

	const handleMarkerClick = (marker) => {
		console.log("Marker clicked:", marker);
	};

	const handleMarkerHover = (marker) => {
		console.log("Marker hovered:", marker);
		setHoveredMarker(marker);
	};

	const handleMarkerLeave = () => {
		setHoveredMarker(null);
	};

	if (!displayData || !displayData["Json Object"]?.AbstractParameter?._Picture_) {
		return <div>No hotspot image data available</div>;
	}

	const imageSource = imageUrl || displayData["Json Object"].AbstractParameter._Picture_;

	return (
		<div className="hotspot-image-container">
			<h3>{displayData["Json Object"].ObjectName || "Hotspot Image"}</h3>
			{markers.length > 0 && (
				<div className="image-marker-wrapper">
					<ImageMarker
						src={imageSource}
						markers={markers}
						onMarkerClick={handleMarkerClick}
						onMarkerHover={handleMarkerHover}
						onMarkerLeave={handleMarkerLeave}
						markerComponent={CustomMarker}
						extraClass="custom-marker"
					/>
				</div>
			)}
			<div className="image-alt-text">
				<p>
					<strong>Alt Text:</strong> {displayData["Json Object"].AbstractParameter._AltText_}
				</p>
			</div>
		</div>
	);
};

// Custom marker component
const CustomMarker = React.memo(({ marker, onClick, onMouseEnter, onMouseLeave, ...props }) => {
	const [hoveredMarker, setHoveredMarker] = useState(null);

	return (
		<div
			className="custom-marker-point"
			onClick={() => onClick(marker)}
			onMouseEnter={() => setHoveredMarker({ marker, ...props })}
			onMouseLeave={() => setHoveredMarker(null)}
			style={{
				position: "absolute",
				left: `${marker?.left}%`,
				top: `${marker?.top}%`,
				transform: "translate(-50%, -50%)",
				cursor: "pointer",
				zIndex: 10,
			}}
		>
			<div className="marker-dot"></div>
			<div style={{ position: "relative" }}>
				{/* Tooltip */}
				{hoveredMarker && (
					<div
						className="marker-tooltip"
						style={{
							position: "absolute",
							left: `${hoveredMarker.left}%`,
							top: `${hoveredMarker.top}%`,
							transform: "translate(-50%, -100%)",
							zIndex: 1000,
						}}
					>
						<div className="tooltip-header">{hoveredMarker.header}</div>
						<div className="tooltip-text">{hoveredMarker.text}</div>
						{hoveredMarker.text2 && hoveredMarker.text2.trim() !== "" && (
							<div className="tooltip-text2">{hoveredMarker.text2}</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
});

export default HotspotImage;
