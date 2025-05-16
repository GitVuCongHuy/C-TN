import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Add_To_Card_Menu } from '../../components/Function/Card_Funci/Card_Funci';
import Context from "../../Context/Context";
import { useContext } from 'react';
import MenuCard from "../../components/Layout/components/MenuCard/Menu_Card"; 
import { FaCartPlus } from "react-icons/fa";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy id từ URL
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]); 
  const [randomProducts, setRandomProducts] = useState([]); 
  const { cart, setCart } = useContext(Context);

  const handleAddToCart = () => {
    Add_To_Card_Menu({ product, cart, setCart });
  };

  useEffect(() => {
    fetch(`http://localhost:8082/product/${id}`)
      .then((response) => response.json())
      .then((data) => setProduct(data))
      .catch((error) => console.error('Error fetching product data:', error));

    fetch("http://localhost:8082/product")
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data); 
        getRandomProducts(data);
      })
      .catch((error) => console.error('Error fetching all products:', error));
  }, [id]);

  const getRandomProducts = (products) => {
    const shuffled = products.sort(() => 0.5 - Math.random()); 
    const selected = shuffled.slice(0, 4); 
    setRandomProducts(selected); 
  };

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4 text-center">
          <img
            src={product.img || "default-image.jpg"}
            alt={product.name || "No name available"}
            className="img-fluid rounded shadow-lg"
            style={{ maxHeight: "300px", objectFit: "cover", borderRadius: "12px" }}
          />
        </div>

        <div className="col-md-8">
          <h1 className="fw-bold mb-3">{product.name}</h1>
          <p className="text-muted">{product.description}</p>
          <h5 className="text-danger mb-3">
            <b>Price: </b>{product.price.toLocaleString()}$
          </h5>
          <h5 className="mb-4">
            <b>Stock: </b>
            {product.stock > 0 ? (
              <span className="text-success">In Stock</span>
            ) : (
              <span className="text-danger">Out of Stock</span>
            )}
          </h5>
          <button
            className="btn btn-warning btn-lg shadow-sm"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            style={{ opacity: product.stock <= 0 ? 0.6 : 1, cursor: product.stock <= 0 ? "not-allowed" : "pointer" }}
          >
            <FaCartPlus className="me-2" /> Add to Cart
          </button>

        </div>
      </div>

      <div className="mt-5 text-center">
        <h3 className="fw-bold mb-4">You might also like</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {randomProducts.map((prod) => (
            <MenuCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: "50px",
        background: "#f9f9f9", 
        padding: "20px 0",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
      }}>
        <div className="container text-center">
          <h4 className="fw-bold">Explore more amazing products!</h4>
          <p className="text-muted">Find the perfect items to complete your collection</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
