import React, { useState, useEffect, useRef } from "react";
import "./ImageBlinder.css";

const ImageBlinder = ({ slides, title }) => {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackSpeed, setPlaybackSpeed] = useState(2000); // milliseconds
	const [revealedSlides, setRevealedSlides] = useState([]);
	const playIntervalRef = useRef(null);

	// Auto-play functionality
	useEffect(() => {
		if (isPlaying) {
			playIntervalRef.current = setInterval(() => {
				setCurrentSlide((prev) => {
					const next = prev + 1;
					if (next >= slides.length) {
						setIsPlaying(false);
						return prev;
					}
					return next;
				});
			}, playbackSpeed);
		} else {
			if (playIntervalRef.current) {
				clearInterval(playIntervalRef.current);
			}
		}
		return () => {
			if (playIntervalRef.current) {
				clearInterval(playIntervalRef.current);
			}
		};
	}, [isPlaying, playbackSpeed, slides.length]);

	// Update revealed slides when current slide changes
	useEffect(() => {
		setRevealedSlides(slides.slice(0, currentSlide + 1));
	}, [currentSlide, slides]);

	const handlePlay = () => {
		if (currentSlide >= slides.length - 1) {
			setCurrentSlide(0);
		}
		setIsPlaying(true);
	};

	const handlePause = () => {
		setIsPlaying(false);
	};

	const handleReset = () => {
		setIsPlaying(false);
		setCurrentSlide(0);
		setRevealedSlides([]);
	};

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			setCurrentSlide(currentSlide + 1);
		}
	};

	const handlePrevious = () => {
		if (currentSlide > 0) {
			setCurrentSlide(currentSlide - 1);
		}
	};

	const handleSlideClick = (index) => {
		setCurrentSlide(index);
	};

	if (!slides || slides.length === 0) {
		return (
			<div className="image-blinder-container rtl">
				<div className="no-slides-message">
					<h3>لا توجد شرائح متاحة</h3>
					<p>يرجى رفع صورة ومعالجتها لعرض الشرائح.</p>
				</div>
			</div>
		);
	}

	const current = slides[currentSlide];

	return (
		<div className="image-blinder-container rtl">
			{/* Modern Header */}
			{title && <div className="blinder-main-header">{title}</div>}

			<div className="blinder-modern-content">
				{/* Section Label */}
				{current && (
					<div className="blinder-section-label">{current._Label_}</div>
				)}

				{/* Image with border/shadow */}
				<div className="blinder-image-wrapper">
					<img
						src={current._Picture_}
						alt={current._AltText_ || `Slide ${currentSlide + 1}`}
						className="blinder-main-image"
						onError={(e) => {
							e.target.src =
								"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
						}}
					/>
				</div>

				{/* Description Card */}
				<div className="blinder-description-card">
					<span className="blinder-desc-icon" title="وصف">
						<i className="material-icons" style={{ verticalAlign: 'middle' }}>info</i>
					</span>
					<span className="blinder-desc-text">{current._Description_}</span>
				</div>

				{/* Optional: Alt text below description */}
				{current._AltText_ && (
					<div className="blinder-alt-text">{current._AltText_}</div>
				)}
			</div>

			{/* Controls and Progress Bar */}
			<div className="blinder-controls">
				<div className="playback-controls">
					<button
						className={`control-btn ${isPlaying ? 'pause' : 'play'}`}
						onClick={isPlaying ? handlePause : handlePlay}
						title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
					>
						{isPlaying ? '⏸️' : '▶️'}
					</button>
					<button className="control-btn reset" onClick={handleReset} title="إعادة تعيين">
						🔄
					</button>
					<button className="control-btn" onClick={handlePrevious} disabled={currentSlide === 0} title="السابق">
						⏮️
					</button>
					<button className="control-btn" onClick={handleNext} disabled={currentSlide === slides.length - 1} title="التالي">
						⏭️
					</button>
				</div>
				<div className="speed-control">
					<label htmlFor="speed">السرعة:</label>
					<select
						id="speed"
						value={playbackSpeed}
						onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
						disabled={isPlaying}
					>
						<option value={1000}>سريع</option>
						<option value={2000}>عادي</option>
						<option value={3000}>بطيء</option>
					</select>
				</div>
			</div>
			<div className="progress-bar">
				<div
					className="progress-fill"
					style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
				></div>
			</div>
		</div>
	);
};

export default ImageBlinder; 