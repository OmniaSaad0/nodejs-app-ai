// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Home from './assets/Component/Home/Home'
// import About from './assets/Component/About/About'
// import Contact from './assets/Component/Contact/Contact'

//  function App() {
//    const [count, setCount] = useState(0)

//    return (
    
//     <>
//     <Home/>
//     <About/>
//     <Contact/>


// {/*  
//    <div>
//          <a href="https://vite.dev" target="_blank">
//            <img src={viteLogo} className="logo" alt="Vite logo" />
//          </a>
//          <a href="https://react.dev" target="_blank">
//            <img src={reactLogo} className="logo react" alt="React logo" />
//          </a>
//        </div>
//        <h1>Vite + React</h1>
//        <div className="card">
//          <button onClick={() => setCount((count) => count + 1)}>
//            count is {count}
//          </button>
//          <p>
//            Edit <code>src/App.jsx</code> and save to test HMR
//          </p>
//        </div>
//        <p className="read-the-docs">
//          Click on the Vite and React logos to learn more
//        </p>  */}
//      </>
   

// )}
//  export default App


 import React, { useState, useEffect } from 'react';

function MetalPropertiesSlider() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/slider_data.json') // افترض أن الملف في مجلد public
      .then(response => response.json())
      .then(data => {
        if (data && data.AbstractParameter && data["Slides 2"]) {
          setSlides(data["AbstractParameter"]["Slides 2"]);
        }
      })
      .catch(error => {
        console.error('Error fetching slider data:', error);
      });
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  if (!slides || slides.length === 0) {
    return <div>Loading...</div>;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="metal-properties-slider">
      <h2>{slides[0]?.AbstractParameter?.Title || 'خواص الفلزات'}</h2>
      <div className="slider-container">
        <button className="prev-button" onClick={goToPrevious}>السابق</button>
        <div className="slide">
          <img src={currentSlide.Photo._Picture} alt={currentSlide._AltText} title={currentSlide._HoverText} />
          <p>{currentSlide._AltText}</p>
        </div>
        <button className="next-button" onClick={goToNext}>التالي</button>
      </div>
    </div>
  );
}

export default MetalPropertiesSlider;