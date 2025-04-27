

import React, { useContext, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import Context from '../../Context/Context';
import Style from './Cart.module.css';
import { useNavigate } from 'react-router-dom'; 
const Cart = () => {
  const { cart, setCart } = useContext(Context);
  const navigate = useNavigate(); 
  const handleSelectAll = (e) => {
    const updatedCart = cart.map((item) => ({ ...item, Ckeck: e.target.checked }));
    setCart(updatedCart);
  };

  const handleDeleteSelected = () => {
    const updatedCart = cart.filter((item) => !item.Ckeck);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart
      .filter((item) => item.Ckeck)
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const countSelectedItems = () => cart.filter((item) => item.Ckeck).length;
  const handleCheckout = () => {
    const selectedItems = cart.filter(item => item.Ckeck); 
    const totalAmount = calculateTotal();

    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    navigate('/payment', {
      state: { cart: selectedItems, total: totalAmount }
    });
  };
  return (
    <div className={`container ${Style.cartContainer} mt-4`} >
      <h2 className="text-center mb-4">Your shopping cart </h2>

      {/* Header */}
      <div className={`row ${Style.cartHeader} py-2 border-bottom fw-bold text-center`}>
        <div className="col-1">
          <input type="checkbox" onChange={handleSelectAll} />
        </div>
        <div className="col-4">Products</div>
        <div className="col-2">Unit price</div>
        <div className="col-2">Quantity</div>
        <div className="col-2">Total amount</div>
        <div className="col-1">Delete</div>
      </div>

      {/* Body */}
      {cart.length > 0 ? (
        cart.map((item, index) => (
          <div key={index} className={`row py-3 align-items-center text-center border-bottom ${Style.cartItem}`}>
            <div className="col-1">
              <input
                type="checkbox"
                checked={item.Ckeck || false}
                onChange={(e) => {
                  const updatedCart = cart.map((i) =>
                    i === item ? { ...i, Ckeck: e.target.checked } : i
                  );
                  setCart(updatedCart);
                }}
              />
            </div>
            <div className="col-4 text-start d-flex align-items-center">
              <img
                src={item.img}
                alt={item.title}
                className="me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
              <span>{item.name}</span>
            </div>
            <div className="col-2">{item.price.toLocaleString()} $</div>
            <div className="col-2">
              <input
                type="number"
                className="form-control"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  const updatedCart = cart.map((i) =>
                    i === item ? { ...i, quantity: parseInt(e.target.value) || 1 } : i
                  );
                  setCart(updatedCart);
                }}
              />
            </div>
            <div className="col-2">{(item.price * item.quantity).toLocaleString()} $</div>
            <div className="col-1">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const updatedCart = cart.filter((i) => i !== item);
                  setCart(updatedCart);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-5">Your shopping cart is empty.</div>
      )}

      {/* Footer */}
      {cart.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-6">
            <Button variant="danger" onClick={handleDeleteSelected}>
              Delete selected products
            </Button>
          </div>
          <div className="col-md-6 text-end">
            <h5>
              Total Payment({countSelectedItems()} products):{' '}
              <span className="text-danger">{calculateTotal().toLocaleString()} $</span>
            </h5>
            <Button variant="primary" className="mt-2" onClick={handleCheckout}>
              Pay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
