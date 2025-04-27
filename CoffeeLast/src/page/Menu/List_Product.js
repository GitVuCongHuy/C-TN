import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('http://localhost:8082/product')
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Lỗi khi tải dữ liệu sản phẩm:', error));
  }, []);

  const handleAddProduct = () => {
    navigate('/add_product');
  };

  const handleUpdateProduct = (productId) => {
    navigate(`/update_product/${productId}`);
  };

  const handleDeleteProduct = (productId) => {
    console.log(productId)
    fetch(`http://localhost:8082/product/${productId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
          
        } else {
          alert('Xóa sản phẩm không thành công');
        }
      })
      .catch((error) => console.error('Lỗi khi xóa sản phẩm:', error));
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ paddingBottom: '15px', borderBottom: '2px solid #ddd' }}>
        <h1 className="text-center mb-0" style={{ color: '#343a40', fontWeight: '700' }}>Product List</h1>
        <button
          className="btn"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '8px 20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: '0.3s',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
          onClick={handleAddProduct}
        >
          + Add new products
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Describe</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Image</th>
              <th>Edit</th> 
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.productId}>
                  <td>{product.name}</td>
                  <td style={{ maxWidth: '300px' }}>{product.description}</td>
                  <td>{product.price.toLocaleString()} $</td>
                  <td>{product.stock}</td>
                  <td>
                    <img
                      src={product.img}
                      alt={product.name}
                      className="img-thumbnail"
                      style={{ width: '100px', height: 'auto' }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleUpdateProduct(product.productId)} 
                    >
                      Update                    
                    </button>
                    <button
                      className="btn btn-danger btn-sm ms-2"
                      onClick={() => handleDeleteProduct(product.productId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  There are no products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListProduct;
