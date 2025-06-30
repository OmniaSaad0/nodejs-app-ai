import React from "react";
import HotspotImage from "./HotspotImage";

const HotspotImageTest = () => {
	// Sample data matching the JSON structure you provided
	const testData = {
		result: {
			"Json Object": {
				ObjectType: "Hotspot Image",
				ObjectName: "ChloroplastDiagram",
				AbstractParameter: {
					_Picture_: "https://via.placeholder.com/800x600/28a745/ffffff?text=Chloroplast+Diagram",
					_AltText_:
						"Diagram of a chloroplast, highly magnified, showing grana disc, stroma, double membrane, starch granules, and DNA.",
					hotSpots: [
						{
							_Xposition_: "25",
							_Yposition_: "30",
							_Header_: "Grana disc",
							_HotspotText_: "Stack of thylakoids; site of light-dependent reactions of photosynthesis.",
							_HotspotText2_: "Contains chlorophyll and other pigments.",
						},
						{
							_Xposition_: "75",
							_Yposition_: "40",
							_Header_: "Stroma",
							_HotspotText_:
								"Fluid-filled space surrounding the grana; site of light-independent reactions.",
							_HotspotText2_: "Contains enzymes for the Calvin cycle.",
						},
						{
							_Xposition_: "50",
							_Yposition_: "70",
							_Header_: "Double membrane",
							_HotspotText_: "Outer and inner membranes that enclose the chloroplast.",
							_HotspotText2_: "Provides structural support and regulates transport.",
						},
						{
							_Xposition_: "20",
							_Yposition_: "80",
							_Header_: "Starch granules",
							_HotspotText_: "Storage form of glucose produced during photosynthesis.",
							_HotspotText2_: " ",
						},
					],
				},
			},
		},
	};

	return (
		<div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
			<h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>Hotspot Image Component Test</h1>

			<div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
				<h3>Test Instructions:</h3>
				<ul>
					<li>Hover over the red dots on the image to see tooltips</li>
					<li>Click on the dots to see console logs</li>
					<li>The component uses the JSON data structure you provided</li>
				</ul>
			</div>

			<HotspotImage data={testData.result} />

			<div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#e9ecef", borderRadius: "8px" }}>
				<h3>JSON Data Used:</h3>
				<pre style={{ overflow: "auto", maxHeight: "300px" }}>{JSON.stringify(testData, null, 2)}</pre>
			</div>
		</div>
	);
};

export default HotspotImageTest;
