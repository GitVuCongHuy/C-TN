import React from "react";
import { Link } from "react-router-dom";

const MenuCard = ({ product }) => {
  return (
    <div
      style={{
        width: "100%", 
        maxWidth: "300px", 
        margin: "0 auto",
      }}
    >
      <Link to={`/product/${product.productId}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column", 
            justifyContent: "space-between",
            height: "100%", 
            border: "1px solid #ddd", 
            borderRadius: "5px", 
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src={product.img}
            alt={product.title}
            style={{
              height: "200px", 
              width: "100%", 
              objectFit: "cover", 
            }}
          />
          <div
            style={{
              padding: "15px", 
              textAlign: "center",
            }}
          >
            <h5 style={{ fontWeight: "bold", margin: "10px 0" }}>{product.title}</h5>
            <p style={{ margin: "5px 0", fontSize: "16px" }}>
              Price: {product.price.toLocaleString()}$
            </p>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "gray" }}>
              Stock: {product.stock}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MenuCard;
