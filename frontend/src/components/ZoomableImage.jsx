import { useState } from "react";
import PropTypes from "prop-types";
import EnhancedImage from "./EnhancedImage";

const ZoomableImage = ({ src, alt, aspectRatio = "4/3" }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    // Re-enable body scrolling
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <div onClick={openModal} className="cursor-zoom-in relative group">
        <EnhancedImage src={src} alt={alt} aspectRatio={aspectRatio} />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>

      {/* Modal for zoomed image */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-screen w-full" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

ZoomableImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  aspectRatio: PropTypes.string
};

export default ZoomableImage;