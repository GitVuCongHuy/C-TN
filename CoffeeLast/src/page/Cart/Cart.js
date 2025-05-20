import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import Context from '../../Context/Context'; // Đảm bảo đường dẫn đúng
import Style from './Cart.module.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, setCart } = useContext(Context); // setCart được dùng để cập nhật giỏ hàng
  const navigate = useNavigate();

  const handleSelectAll = (e) => {
    const allChecked = e.target.checked;
    const updatedCart = cart.map((item) => ({ ...item, Ckeck: allChecked }));
    setCart(updatedCart);
  };

  const handleDeleteSelected = () => {
    // Lọc ra những item không được chọn (item.Ckeck là false hoặc undefined)
    const updatedCart = cart.filter((item) => !item.Ckeck);
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    return cart
      .filter((item) => item.Ckeck) // Chỉ tính tổng các item được chọn
      .reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  };

  const countSelectedItems = () => cart.filter((item) => item.Ckeck).length;

  const handleCheckout = () => {
    const selectedItems = cart.filter(item => item.Ckeck);
    const totalAmount = calculateTotal();

    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    // QUAN TRỌNG: Lấy danh sách ID của các sản phẩm đã chọn
    // Đảm bảo mỗi 'item' trong 'selectedItems' có thuộc tính 'productId'
    const selectedItemIds = selectedItems.map(item => {
        // Giả sử item trong giỏ hàng luôn có 'productId'
        // Nếu không chắc, bạn cần kiểm tra item.productId !== undefined
        if (item.productId === undefined) {
            console.error("LỖI: Sản phẩm trong giỏ hàng không có 'productId'. Sản phẩm:", JSON.stringify(item));
            // alert("Đã xảy ra lỗi với một sản phẩm trong giỏ hàng (thiếu ID). Vui lòng thử lại hoặc xóa sản phẩm đó khỏi giỏ.");
            // return undefined; // Sẽ được lọc ra ở dưới
        }
        return item.productId;
    }).filter(id => id !== undefined); // Lọc ra các ID không hợp lệ (nếu có lỗi ở trên)

    // Nếu không lấy được ID cho tất cả sản phẩm đã chọn (do lỗi thiếu productId ở một số item)
    if (selectedItemIds.length !== selectedItems.length) {
        alert("Một hoặc nhiều sản phẩm bạn chọn đang gặp sự cố thông tin. Vui lòng xóa chúng khỏi giỏ hàng và thêm lại, hoặc liên hệ hỗ trợ.");
        return;
    }

    navigate('/payment', { // Tên route của bạn là '/checkoutpage' hay '/payment'? Đảm bảo đúng.
      state: {
        cart: selectedItems, // Danh sách các đối tượng sản phẩm đã chọn
        total: totalAmount,
        itemIdsToRemoveAfterSuccess: selectedItemIds // Mảng các productId
      }
    });
  };

  // Xác định xem tất cả item có được check không (cho checkbox "Select All")
  const areAllItemsSelected = cart.length > 0 && cart.every(item => item.Ckeck);

  return (
    <div className={`container ${Style.cartContainer} mt-4 mb-5`} > {/* Thêm mb-5 */}
      <h2 className="text-center mb-4">Your Shopping Cart</h2>

      {/* Header */}
      <div className={`row ${Style.cartHeader} py-2 border-bottom fw-bold text-center align-items-center`}>
        <div className="col-1">
          <input
            type="checkbox"
            className="form-check-input" // Thêm class của Bootstrap
            onChange={handleSelectAll}
            checked={areAllItemsSelected}
            disabled={cart.length === 0}
          />
        </div>
        <div className="col-4 text-start ps-md-4">Products</div> {/* text-start và padding */}
        <div className="col-2">Unit Price</div>
        <div className="col-2">Quantity</div>
        <div className="col-2">Total Amount</div>
        <div className="col-1">Actions</div> {/* Đổi tên cột */}
      </div>

      {/* Body */}
      {cart.length > 0 ? (
        cart.map((item) => ( // Bỏ index nếu key dùng productId
          // SỬ DỤNG productId LÀM KEY nếu nó tồn tại và duy nhất
          <div key={item.productId || item.name} className={`row py-3 align-items-center text-center border-bottom ${Style.cartItem} ${item.Ckeck ? Style.selectedItem : ''}`}>
            <div className="col-1">
              <input
                type="checkbox"
                className="form-check-input"
                checked={item.Ckeck || false}
                onChange={(e) => {
                  const updatedCart = cart.map((cartItem) =>
                    // So sánh bằng productId để đảm bảo cập nhật đúng item
                    cartItem.productId === item.productId
                        ? { ...cartItem, Ckeck: e.target.checked }
                        : cartItem
                  );
                  setCart(updatedCart);
                }}
              />
            </div>
            <div className="col-4 text-start d-flex align-items-center ps-md-3">
              <img
                src={item.img || 'https://via.placeholder.com/60'} // Placeholder nếu không có ảnh
                // alt={item.title} // Dữ liệu của bạn có 'name'
                alt={item.name || 'Product'}
                className="me-3"
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/60'; }}
              />
              <span className="fw-medium">{item.name || 'Unknown Product'}</span>
            </div>
            <div className="col-2">{(item.price || 0).toLocaleString()} $</div>
            <div className="col-2 d-flex justify-content-center"> {/* Căn giữa input */}
              <input
                type="number"
                className="form-control text-center" // Căn chữ trong input ra giữa
                min="1"
                value={item.quantity || 1}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  if (newQuantity >= 1) { // Chỉ cập nhật nếu số lượng hợp lệ
                    const updatedCart = cart.map((cartItem) =>
                      cartItem.productId === item.productId
                          ? { ...cartItem, quantity: newQuantity }
                          : cartItem
                    );
                    setCart(updatedCart);
                  }
                }}
                style={{ width: '70px' }} // Giới hạn chiều rộng input
              />
            </div>
            <div className="col-2 fw-bold">{( (item.price || 0) * (item.quantity || 1)).toLocaleString()} $</div>
            <div className="col-1">
              <Button
                variant="outline-danger" // Nhẹ nhàng hơn
                size="sm"
                onClick={() => {
                  // Nên có hàm removeFromCart(productId) trong Context để tái sử dụng
                  const updatedCart = cart.filter((cartItem) => cartItem.productId !== item.productId);
                  setCart(updatedCart);
                }}
                title="Remove item"
              >
                <i className="bi bi-trash3"></i> {/* Icon cho dễ nhìn */}
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-5 text-muted">
            <i className="bi bi-cart-x" style={{fontSize: '3rem'}}></i>
            <p className="mt-2">Your shopping cart is empty.</p>
            <Button variant="primary" onClick={() => navigate('/')}>
                Continue Shopping
            </Button>
        </div>
      )}

      {/* Footer */}
      {cart.length > 0 && (
        <div className={`row mt-4 pt-3 border-top ${Style.cartFooter} align-items-center`}>
          <div className="col-md-6 mb-3 mb-md-0 text-center text-md-start">
            <Button variant="danger" onClick={handleDeleteSelected} disabled={countSelectedItems() === 0}>
              <i className="bi bi-trash2-fill me-2"></i>Delete Selected ({countSelectedItems()})
            </Button>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <h5 className="mb-2">
              Total ({countSelectedItems()} items):{' '}
              <span className="text-danger fw-bold fs-4">{calculateTotal().toLocaleString()} $</span>
            </h5>
            <Button
              variant="success" // Đổi thành success cho nổi bật
              size="lg" // Nút to hơn
              className="mt-1 w-100 w-md-auto" // Full width trên mobile
              onClick={handleCheckout}
              disabled={countSelectedItems() === 0} // Disable nếu không có item nào được chọn
            >
              Proceed to Checkout <i className="bi bi-arrow-right-circle-fill ms-2"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;