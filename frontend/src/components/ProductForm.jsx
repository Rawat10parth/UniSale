import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import DragDropUploader from "./DragDropUploader";
import Toast from './Toast';

export default function ProductForm({ setShowForm, userId }) {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    state: "",
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setToast({
        show: true,
        message: 'Please upload at least one image for your product.',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("category", product.category);
      formData.append("state", product.state);
      formData.append("price", product.price);
      
      // Append multiple images
      if (images.length > 1) {
        // Using the new multi-image endpoint
        images.forEach(image => {
          formData.append("images[]", image);
        });
        
        const response = await axios.post(
          "http://localhost:5000/api/upload-multiple", 
          formData, 
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        );
        
        setToast({
          show: true,
          message: `Product uploaded successfully with ${images.length} images!`,
          type: 'success'
        });
        console.log(response.data);
      } else {
        // Fallback to single image upload if only one image
        formData.append("image", images[0]);
        
        const response = await axios.post(
          "http://localhost:5000/api/upload", 
          formData, 
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        );
        
        setToast({
          show: true,
          message: 'Product uploaded successfully!',
          type: 'success'
        });
        console.log(response.data);
      }
      
      setTimeout(() => setShowForm(false), 2000); // Close form after 2 seconds
    } catch (error) {
      console.error("Upload failed", error.response?.data || error);
      setToast({
        show: true,
        message: 'Failed to upload product. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-white shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Sell a Product</h2>
      
      {/* Drag & Drop Image Upload */}
      <DragDropUploader 
        onImagesChange={handleImagesChange}
        multiple={true}
        maxFiles={5}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        
        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={product.price}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
      </div>
      
      <textarea
        name="description"
        placeholder="Product Description"
        value={product.description}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        rows="4"
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="category"
          value={product.category}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Books & Study Material">Books & Study Material</option>
          <option value="Electronics & Gadgets">Electronics & Gadgets</option>
          <option value="Hostel & Room Essentials">Hostel & Room Essentials</option>
          <option value="Clothing & Accessories">Clothing & Accessories</option>
          <option value="Stationery & Supplies">Stationery & Supplies</option>
          <option value="Bicycles & Transport">Bicycles & Transport</option>
          <option value="Home Appliances">Home Appliances</option>
          <option value="Furniture">Furniture</option>
          <option value="Event & Fest Items">Event & Fest Items</option>
          <option value="Gaming & Entertainment">Gaming & Entertainment</option>
        </select>
        
        <select
          name="state"
          value={product.state}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select Condition</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
        </select>
      </div>
      
      {/* Upload Progress */}
      {isSubmitting && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm text-center mt-1">Uploading... {uploadProgress}%</p>
        </div>
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
      <div className="flex justify-between mt-6">
        <button 
          type="button" 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          onClick={() => setShowForm(false)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Uploading..." : "Sell Product"}
        </button>
      </div>
    </form>
  );
}

ProductForm.propTypes = {
  setShowForm: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};