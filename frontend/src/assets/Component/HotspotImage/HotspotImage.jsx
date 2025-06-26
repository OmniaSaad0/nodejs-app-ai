import React, { useState, useEffect } from "react";
import ImageMarker from "react-image-marker";
import "./HotspotImage.css";

const HotspotImage = ({ data, imageUrl }) => {
	const [markers, setMarkers] = useState([]);
	const [hoveredMarker, setHoveredMarker] = useState(null);

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
		setHoveredMarker(marker);
	};

	const handleMarkerHover = (marker) => {
		setHoveredMarker(marker);
	};

	const handleMarkerLeave = () => {
		setHoveredMarker(null);
	};

	const handleMarkerTouch = (marker, e) => {
		e.preventDefault();
		setHoveredMarker(marker);
	};

	if (!displayData || !displayData["Json Object"]?.AbstractParameter?._Picture_) {
		return <div>No hotspot image data available</div>;
	}

	const imageSource = imageUrl || displayData["Json Object"].AbstractParameter._Picture_;

	return (
		<div className="hotspot-image-container" >
			<h3>{displayData["Json Object"].ObjectName || "Hotspot Image"}</h3>
			{markers.length > 0 && (
				<div className="image-marker-wrapper" >
					<div >
						<img
							src={imageSource}
							alt={displayData["Json Object"].AbstractParameter._AltText_ || "Hotspot"}
							className="hotspot-main-image"
							style={{ maxWidth: "100%", height: "auto", display: "block" }}
						/>
						{markers.map((marker) => (
							<CustomMarker
								key={marker.id}
								marker={marker}
								onMouseEnter={() => handleMarkerHover(marker)}
								onMouseLeave={handleMarkerLeave}
								onClick={() => handleMarkerClick(marker)}
								onTouchStart={(e) => handleMarkerTouch(marker, e)}
								hovered={hoveredMarker && hoveredMarker.id === marker.id}
							/>
						))}
						{/* Tooltip (single, global) */}
						{hoveredMarker && (
							<div
								className="marker-tooltip"
								style={{
									left: `${hoveredMarker.left}%`,
									top: `${hoveredMarker.top}%`,
									position: "absolute",
									transform: "translate(-50%, -110%)",
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
const CustomMarker = React.memo(
	({ marker, onMouseEnter, onMouseLeave, onClick, onTouchStart, hovered }) => (
		<div
			className="custom-marker-point"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onClick={onClick}
			onTouchStart={onTouchStart}
			style={{
				position: "absolute",
				left: `${marker.left}%`,
				top: `${marker.top}%`,
				transform: "translate(-50%, -50%)",
				cursor: "pointer",
				zIndex: 10,
			}}
		>
			<div className="marker-dot"></div>
		</div>
	)
);

export default HotspotImage;
