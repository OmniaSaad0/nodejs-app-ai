import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ImageSlider.css";

const ImageSlider = ({ slides, title }) => {
	const [currentSlide, setCurrentSlide] = useState(0);

	const settings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		autoplay: false,
		beforeChange: (oldIndex, newIndex) => setCurrentSlide(newIndex),
		responsive: [
			{
				breakpoint: 768,
				settings: {
					arrows: false,
					dots: true,
				},
			},
		],
	};

	if (!slides || slides.length === 0) {
		return (
			<div className="image-slider-container">
				<div className="no-slides-message">
					<h3>No slides available</h3>
					<p>Please upload an image and process it to see the slider.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="image-slider-container">
			<div className="slider-header">
				<h2 className="slider-title">{title}</h2>
				<div className="slide-counter">
					{currentSlide + 1} / {slides.length}
				</div>
			</div>

			<div className="slider-wrapper">
				<Slider {...settings}>
					{slides.map((slide, index) => (
						<div key={index} className="slide-item">
							<div className="slide-image-container">
								<img
									src={slide.Photo._Picture_}
									alt={slide._AltText_ || `Slide ${index + 1}`}
									className="slide-image"
									onError={(e) => {
										e.target.src =
											"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
									}}
									style={{ width: "100%", height: "400px", objectFit: "contain" }}
								/>
							</div>
							<div className="slide-content">
								<h3 className="slide-title">{slide._AltText_}</h3>
								<p className="slide-description">{slide._HoverText_}</p>
							</div>
						</div>
					))}
				</Slider>
			</div>
		</div>
	);
};

export default ImageSlider;
