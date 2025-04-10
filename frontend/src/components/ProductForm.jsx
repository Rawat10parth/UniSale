import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

export default function ProductForm({ setShowForm }) {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    state: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setProduct({ ...product, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Replace hardcoded "1" with the actual user ID if available
    formData.append("user_id", "1");
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("state", product.state);
    formData.append("price", product.price);
    formData.append("image", product.image);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product uploaded successfully!");
      console.log(response.data);
      setShowForm(false);
    } catch (error) {
      console.error("Upload failed", error.response?.data || error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white shadow-lg">
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <textarea
        name="description"
        placeholder="Product Description"
        value={product.description}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <select
        name="category"
        value={product.category}
        onChange={handleChange}
        className="border p-2 w-full"
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
        className="border p-2 w-full"
        required
      >
        <option value="">Select Condition</option>
        <option value="New">New</option>
        <option value="Used">Used</option>
      </select>
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={product.price}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input type="file" onChange={handleImageChange} className="border p-2 w-full" required />
      <div className="flex justify-between">
        <button type="button" className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(false)}>
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Sell
        </button>
      </div>
    </form>
  );
}

ProductForm.propTypes = {
  setShowForm: PropTypes.func.isRequired,
};
