import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";

const DragDropUploader = ({ onImagesChange, multiple = false, maxFiles = 5 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Process files function
  const processFiles = useCallback((newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    
    // If not accepting multiple files, replace existing ones
    const updatedFiles = multiple 
      ? [...files, ...Array.from(newFiles).slice(0, maxFiles - files.length)] 
      : [newFiles[0]];
    
    // Generate previews for the files
    const newPreviews = updatedFiles.map(file => {
      // If it's already a preview, keep it
      if (typeof file === 'string') return file;
      
      return URL.createObjectURL(file);
    });
    
    setFiles(updatedFiles);
    setPreviews(newPreviews);
    onImagesChange(updatedFiles); // Report changes back to parent
  }, [files, multiple, maxFiles, onImagesChange]);

  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    processFiles(droppedFiles);
  }, [processFiles]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    processFiles(e.target.files);
  }, [processFiles]);

  // Open file dialog when clicking on the drop area
  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  // Remove a file from the selection
  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Release object URL to avoid memory leaks
    if (newPreviews[index] && typeof newPreviews[index] === 'string') {
      URL.revokeObjectURL(newPreviews[index]);
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  return (
    <div className="w-full mb-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4 flex flex-col items-center text-sm text-gray-600">
          <p className="font-medium">
            {multiple
              ? `Drag up to ${maxFiles} images here, or click to select`
              : "Drag an image here, or click to select"}
          </p>
          <p className="text-xs mt-1">PNG, JPG, JPEG up to 10MB</p>
        </div>
      </div>

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {multiple && (
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

DragDropUploader.propTypes = {
  onImagesChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
};

export default DragDropUploader;