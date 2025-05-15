import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  
import axios from 'axios';

const UpdateProduct = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    img: '',
  });

  const [responseMessage, setResponseMessage] = useState('');
  const { productId } = useParams(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/product/${productId}`);
        if (response.status === 200) {
          setProductData(response.data); 
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin sản phẩm:', error);
        setResponseMessage('Không thể tải thông tin sản phẩm.');
      }
    };

    fetchProductData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
      if (name === 'price' || name === 'stock') {
    // Cho phép giá trị rỗng để người dùng có thể xóa tạm thời
    if (value === '' || /^\d*$/.test(value)) {
      setProductData({ ...productData, [name]: value });
    }
  } else {
    setProductData({ ...productData, [name]: value });
  }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8082/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert('Cập nhật sản phẩm thành công');
        navigate('/list_product');
      } else {
        alert('Cập nhật sản phẩm không thành công');
      }
    } catch (error) {
      alert('Lỗi kết nối đến máy chủ!');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Product update</h2>
      <form className="border p-3 mb-5 rounded shadow-sm bg-light" style={{ maxWidth: '500px', margin: 'auto' }} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={productData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Describe</label>
          <input
            type="text"
            id="description"
            name="description"
            className="form-control"
            value={productData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            className="form-control"
            value={productData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="stock" className="form-label">Quantity</label>
          <input
            type="number"
            id="stock"
            name="stock"
            min="0"
            className="form-control"
            value={productData.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="img" className="form-label">Image</label>
          <input
            type="text"
            id="img"
            name="img"
            className="form-control"
            value={productData.img}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-success w-100">Update</button>
      </form>
      {responseMessage && (
        <div className={`alert mt-4 ${responseMessage.includes('Lỗi') ? 'alert-danger' : 'alert-success'}`}>
          {responseMessage}
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;
