import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

// Custom chevron icons that don't require lucide-react
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const ProductImageCarousel = ({ images, mainImage }) => {
  // If there's only one image passed (the main product image), create a simulated array
  // In a real app, you'd fetch multiple product images from your API
  const allImages = images || [
    // Use the main image as the first image if provided
    { id: 1, src: mainImage, alt: "Main product image" },
    // Add placeholder images for demonstration (you would replace these with actual product images)
    { id: 2, src: mainImage, alt: "Product angle 2" },
    { id: 3, src: mainImage, alt: "Product angle 3" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, allImages.length]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating, allImages.length]);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  // Auto-rotation (only if there are multiple images)
  useEffect(() => {
    if (allImages.length <= 1) return; // Don't auto-rotate if only one image
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [goToNext, allImages.length]);

  // If there's only one image, just show it without carousel controls
  if (allImages.length <= 1) {
    return (
      <div className="overflow-hidden rounded-lg">
        <img 
          src={mainImage} 
          alt="Product" 
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-100">
        {/* Main carousel slide */}
        <div className="relative aspect-square">
          {allImages.map((image, index) => (
            <div
              key={image.id}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button 
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 p-2 rounded-full shadow hover:bg-opacity-80 transition z-20"
          onClick={goToPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft />
        </button>
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-60 p-2 rounded-full shadow hover:bg-opacity-80 transition z-20"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-600 scale-110' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail navigation */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden transition ${
              index === currentIndex ? 'border-blue-600' : 'border-transparent'
            }`}
          >
            <img
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

ProductImageCarousel.propTypes = {
  // Optional array of image objects with src and alt properties
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      src: PropTypes.string.isRequired,
      alt: PropTypes.string
    })
  ),
  // If no images array provided, at least provide a main image URL
  mainImage: PropTypes.string
};

export default ProductImageCarousel;