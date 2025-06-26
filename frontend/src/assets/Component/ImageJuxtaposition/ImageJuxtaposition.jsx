import React, { useRef, useState } from "react";
import "./ImageJuxtaposition.css";

const PLACEHOLDER =
	"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwMCcgaGVpZ2h0PSc1MDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzEwMDAnIGhlaWdodD0nNTAwJyBmaWxsPSIjZGRkIi8+PHRleHQgeD0nNTAlJyB5PSIyNTAlIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";

// Simple draggable slider for before/after
const ImageJuxtaposition = ({ data }) => {
	const containerRef = useRef(null);
	const [sliderPos, setSliderPos] = useState(50); // percent
	const [dragging, setDragging] = useState(false);
	const [leftError, setLeftError] = useState(false);
	const [rightError, setRightError] = useState(false);

	if (!data || !data.slides || data.slides.length < 2) {
		return <div className="juxtaposition-container">No valid data for juxtaposition.</div>;
	}

	const left = data.slides[0];
	const right = data.slides[1];

	const handleDrag = (e) => {
		if (!dragging) return;
		let clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const rect = containerRef.current.getBoundingClientRect();
		let percent = ((clientX - rect.left) / rect.width) * 100;
		percent = Math.max(0, Math.min(100, percent));
		setSliderPos(percent);
	};

	return (
		<div
			className="juxtaposition-container"
			ref={containerRef}
			onMouseMove={handleDrag}
			onMouseUp={() => setDragging(false)}
			onMouseLeave={() => setDragging(false)}
			onTouchMove={handleDrag}
			onTouchEnd={() => setDragging(false)}
		>
			<div className="juxtaposition-heading">{data.Heading}</div>
			<div className="juxtaposition-image-wrapper">
				{/* Left (Before) - always full width */}
				<div className="juxtaposition-image left" style={{ zIndex: 1 }}>
					<img
						src={leftError ? PLACEHOLDER : left.Picture}
						alt={left.AltTextImage}
						onError={() => setLeftError(true)}
					/>
					<div className="juxtaposition-label left-label">
						{left.LabelImage}
						{left.HoverTextImage && <span className="juxtaposition-year">{left.HoverTextImage}</span>}
					</div>
				</div>
				{/* Right (After) - overlays and is clipped from sliderPos to right edge */}
				<div
					className="juxtaposition-image right"
					style={{
						zIndex: 2,
						clipPath: `inset(0 0 0 ${sliderPos}%)`,
						WebkitClipPath: `inset(0 0 0 ${sliderPos}%)`,
					}}
				>
					<img
						src={rightError ? PLACEHOLDER : right.Picture}
						alt={right.AltTextImage}
						onError={() => setRightError(true)}
					/>
					<div className="juxtaposition-label right-label">
						{right.LabelImage}
						{right.HoverTextImage && <span className="juxtaposition-year">{right.HoverTextImage}</span>}
					</div>
				</div>
				{/* Slider handle */}
				<div
					className="juxtaposition-slider"
					style={{ left: `${sliderPos}%` }}
					onMouseDown={() => setDragging(true)}
					onTouchStart={() => setDragging(true)}
				>
					<div className="slider-bar" />
					<div className="slider-circle" />
				</div>
			</div>
		</div>
	);
};

export default ImageJuxtaposition;  