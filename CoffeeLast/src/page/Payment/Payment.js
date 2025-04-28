import React, { useState, useEffect, useContext, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap'; // Đảm bảo import đủ
import Context from '../../Context/Context'; // Đảm bảo đường dẫn đúng

const API_BASE_URL = 'http://localhost:8082'; // Thêm base URL

const CheckoutPage = () => {
    // Lấy token và setLastOrderSuccess từ Context
    const { token, setLastOrderSuccess } = useContext(Context);

    const location = useLocation();
    const navigate = useNavigate();

    // --- State ---
    const cartItemsFromState = location.state?.cart || [];
    const totalAmountFromState = location.state?.total || 0;
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [recipientInfo, setRecipientInfo] = useState({ name: '', phone: '', email: '', location: '' });
    const [userInfo, setUserInfo] = useState(null);
    const [useProfileInfo, setUseProfileInfo] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [deliveryOption, setDeliveryOption] = useState('atStore');
    const [isLoading, setIsLoading] = useState(false); // Loading cho fetch và submit
    const [error, setError] = useState(null);
    const [successOrderId, setSuccessOrderId] = useState(null);

    // --- useEffects ---
    // Fetch User Info
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) { setUserInfo(null); setUseProfileInfo(false); return; }
            // setIsLoading(true); // Có thể dùng loading riêng cho từng fetch
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/user_data/profile`, { // Dùng base URL
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json(); setUserInfo(data); setUseProfileInfo(true);
                } else { setUserInfo(null); setUseProfileInfo(false); console.error('Failed fetch profile:', response.status); }
            } catch (err) { setUserInfo(null); setUseProfileInfo(false); setError('Failed to load profile.'); console.error(err); }
            // finally { setIsLoading(false); }
        };
        fetchUserInfo();
    }, [token]);

    // Autofill Form
    useEffect(() => {
        if (deliveryOption === 'delivery' && useProfileInfo && userInfo) {
            setRecipientInfo({
                name: userInfo.name || '', phone: userInfo.phone_number || '',
                email: userInfo.email || '', location: userInfo.address || '',
            });
        }
    }, [useProfileInfo, userInfo, deliveryOption]);

    // Fetch Branches
    useEffect(() => {
        const fetchBranches = async () => {
             try {
                 const response = await fetch(`${API_BASE_URL}/chain/get_all`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); // Dùng base URL
                 if (response.ok) {
                     const data = await response.json();
                     setBranches(data.map(item => ({ id: item.chain_id, name: item.name, location: item.location })));
                 } else { setError('Could not load branches.'); }
             } catch (err) { setError('Connection error loading branches.'); }
        };
        fetchBranches();
    }, []);

    // Fetch Payment Methods
    useEffect(() => {
        const fetchPaymentMethods = async () => {
             try {
                 const response = await fetch(`${API_BASE_URL}/payment-methods`); // Dùng base URL
                 if (response.ok) { const data = await response.json(); setPaymentMethods(data); }
                 else { setError('Could not load payment methods.'); }
             } catch (err) { setError('Connection error loading payment methods.'); }
        };
        fetchPaymentMethods();
    }, []);

    // --- Handlers ---
    const handleRecipientInfoChange = (e) => { if (useProfileInfo) setUseProfileInfo(false); const { name, value } = e.target; setRecipientInfo(prev => ({ ...prev, [name]: value })); };
    const handleUseInfoOptionChange = (useSaved) => { setUseProfileInfo(useSaved); if (!useSaved) setRecipientInfo({ name: '', phone: '', email: '', location: '' }); };
    const handleDeliveryOptionChange = (option) => { setDeliveryOption(option); };
    const calculateTotal = useCallback(() => totalAmountFromState, [totalAmountFromState]);
    const handlePaymentMethodChange = (e) => { setSelectedPaymentMethod(e.target.value); };
    const handleBranchSelection = (branchId) => { setSelectedBranch(branchId); };

    const handleOrderSubmit = async () => {
        setError(null);
        setIsLoading(true); // Bắt đầu loading tổng

        if (!selectedBranch) { alert('Please select a branch.'); setIsLoading(false); return; }
        if (cartItemsFromState.length === 0) { alert('Your cart is empty.'); setIsLoading(false); return; }

        // At Store Logic
        if (deliveryOption === 'atStore') {
            await new Promise(resolve => setTimeout(resolve, 300));
            setSuccessOrderId(null);
            setShowSuccess(true);
            setIsLoading(false);
            // No setLastOrderSuccess
            return;
        }

        // Delivery Logic & Validation
        if (!recipientInfo.name.trim()) { alert('Please enter recipient name.'); setIsLoading(false); return; }
        if (!recipientInfo.phone.trim()) { alert('Please enter recipient phone.'); setIsLoading(false); return; }
        if (!recipientInfo.email.trim() || !/\S+@\S+\.\S+/.test(recipientInfo.email)) { alert('Please enter a valid email.'); setIsLoading(false); return; }
        if (!recipientInfo.location.trim()) { alert('Please enter delivery address.'); setIsLoading(false); return; }
        if (!selectedPaymentMethod) { alert('Please select a payment method.'); setIsLoading(false); return; }

        // Build Delivery Payload
        const orderProductsPayload = cartItemsFromState.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.price }));
        const orderPayload = {
            chain_id: selectedBranch,
            payment_method_id: parseInt(selectedPaymentMethod, 10),
            product: orderProductsPayload,
            totalAmount: calculateTotal(),
            recipientName: recipientInfo.name.trim(),
            recipientEmail: recipientInfo.email.trim(),
            recipientPhone: recipientInfo.phone.trim(),
            shippingAddress: recipientInfo.location.trim(),
            deliveryOption: deliveryOption
        };

        // API Call for Delivery
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
                method: 'POST',
                headers: { ...(token && { Authorization: `Bearer ${token}` }), 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            if (response.ok) {
                const createdOrder = await response.json();
                console.log("Order created successfully:", createdOrder);

                // *** GỌI setLastOrderSuccess VỚI DỮ LIỆU TỪ RESPONSE ***
                 // Đảm bảo createdOrder.totalAmount có giá trị từ backend
                setLastOrderSuccess({
                    orderId: createdOrder.orderId,
                    totalAmount: createdOrder.totalAmount
                });
                console.log("Set last order success context:", { orderId: createdOrder.orderId, totalAmount: createdOrder.totalAmount });

                setSuccessOrderId(createdOrder.orderId);
                setShowSuccess(true);
                // setCart([]); // Clear cart nếu muốn

            } else {
                const errorData = await response.text(); // Dùng text để bắt cả lỗi HTML
                setError(`Error ${response.status}: ${errorData || 'Could not create order.'}`);
                alert(`Error creating order: ${errorData || response.statusText}`);
            }
        } catch (err) {
            setError('Server connection error while creating order.');
            alert('Server connection error while creating order.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        setShowSuccess(false);
        navigate('/');
    };

    // --- Render ---
    return (
        <div className="container mt-5 pb-5">
            <h2 className="text-center mb-4">Checkout</h2> 

            {/* Success Modal */}
            {showSuccess && (
                <>
                    {/* Chỉ bắn pháo hoa nếu là đơn delivery thành công */}
                    <Confetti recycle={false} numberOfPieces={400} width={window.innerWidth} height={window.innerHeight}/>

                    <Modal show={showSuccess} centered onHide={handleBackToHome} backdrop="static">
                        <Modal.Body className="text-center p-4 p-md-5">
                            <h1 className="text-success mb-3" style={{ fontSize: '3rem' }}>🎉</h1>
                            <h2 className="mb-3">{deliveryOption === 'delivery' ? 'Order Placed Successfully!' : 'Order Ready!'}</h2>
                            {successOrderId && (
                                <p className="fs-5 mb-3">Order ID: <strong>#{successOrderId}</strong></p>
                            )}
                            <p className="fs-6">
                                {deliveryOption === 'atStore'
                                    ? 'Please proceed to the counter to pay and collect your items.'
                                    : 'We will process your order and deliver it as soon as possible.'}
                            </p>
                            <p className="fs-6 mb-4">Thank you for your purchase!</p>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleBackToHome}
                                style={{
                                    background: 'linear-gradient(90deg, #ff8c00, #ff0080)',
                                    border: 'none', color: '#fff', fontWeight: 'bold',
                                    borderRadius: '30px', padding: '12px 30px',
                                }}
                                // Thêm hiệu ứng hover nếu muốn
                                // onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                // onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                Back to Home
                            </Button>
                        </Modal.Body>
                    </Modal>
                </>
            )}

            {/* Checkout Form */}
            {!showSuccess && (
                <>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* Delivery Option */}
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-light fw-bold">Choose Pickup/Delivery</div>
                        <div className="card-body">
                            <Form.Check
                                type="radio" name="deliveryOption" id="atStoreRadio"
                                label="Pick up at Store" value="atStore"
                                checked={deliveryOption === 'atStore'}
                                onChange={() => handleDeliveryOptionChange('atStore')}
                                className="mb-2"
                            />
                            <Form.Check
                                type="radio" name="deliveryOption" id="deliveryRadio"
                                label="Home Delivery" value="delivery"
                                checked={deliveryOption === 'delivery'}
                                onChange={() => handleDeliveryOptionChange('delivery')}
                            />
                        </div>
                    </div>

                    {/* Branch Selection */}
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-light fw-bold">Select Branch</div>
                        <div className="card-body">
                            {branches.length > 0 ? branches.map((branch) => (
                                <Form.Check
                                    key={branch.id} type="radio" name="branch"
                                    id={`branch-${branch.id}`} label={`${branch.name} - ${branch.location}`}
                                    value={branch.id} checked={selectedBranch === branch.id}
                                    onChange={() => handleBranchSelection(branch.id)}
                                    className="mb-2"
                                />
                            )) : <p className="text-muted">Loading branches...</p>}
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header bg-light fw-bold">Items in Cart</div>
                        <div className="card-body">
                            {cartItemsFromState.length > 0 ? cartItemsFromState.map((item) => (
                                <div key={item.productId} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                    <img
                                        src={item.img || 'https://via.placeholder.com/80'} alt={item.name || 'Product'}
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/80'; }}
                                    />
                                    <div className="ms-3 flex-grow-1">
                                        <h6 className="mb-1">{item.name || 'Product Name'}</h6>
                                        <p className="mb-0 text-muted small">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="mb-0 fw-bold">{(item.price * item.quantity).toLocaleString()} $</p> {/* Giữ lại $ */}
                                </div>
                            )) : <p className="text-muted">Your cart is empty.</p>}
                        </div>
                    </div>

                    {/* Delivery Specific Sections */}
                    {deliveryOption === 'delivery' && (
                        <>
                            {/* User Info Choice */}
                            {token && userInfo && (
                                <div className="card mb-4 shadow-sm">
                                    <div className="card-header bg-light fw-bold">Recipient Information Option</div>
                                    <div className="card-body">
                                        <Form.Group as={Row}>
                                            <Col sm={10} className="d-flex flex-wrap align-items-center">
                                                <Form.Check
                                                    type="radio" label="Use Saved Profile Info" name="infoOption"
                                                    id="useSavedInfoRadio" checked={useProfileInfo}
                                                    onChange={() => handleUseInfoOptionChange(true)}
                                                    className="me-3 mb-2 mb-sm-0"
                                                />
                                                <Form.Check
                                                    type="radio" label="Enter New Information" name="infoOption"
                                                    id="useNewInfoRadio" checked={!useProfileInfo}
                                                    onChange={() => handleUseInfoOptionChange(false)}
                                                    className="mb-2 mb-sm-0"
                                                />
                                            </Col>
                                        </Form.Group>
                                        {useProfileInfo && (
                                            <p className="mt-2 text-muted small">
                                                Information from your profile will be used. Select "Enter New Information" to change.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Recipient Info Form */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-light fw-bold">Recipient Details</div>
                                <div className={`card-body ${useProfileInfo && userInfo ? 'bg-light-subtle' : ''}`}>
                                     {useProfileInfo && userInfo && (
                                        <p className="text-info small mb-3 fst-italic">Using information from profile. Select "Enter New Information" above to change.</p>
                                    )}
                                    <Form.Group className="mb-3" controlId="recipientName">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" name="name" value={recipientInfo.name} onChange={handleRecipientInfoChange} required readOnly={useProfileInfo && !!userInfo} />
                                    </Form.Group>
                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3" controlId="recipientPhone">
                                            <Form.Label>Phone Number</Form.Label>
                                            <Form.Control type="tel" name="phone" value={recipientInfo.phone} onChange={handleRecipientInfoChange} required readOnly={useProfileInfo && !!userInfo} />
                                        </Form.Group>
                                        <Form.Group as={Col} md={6} className="mb-3" controlId="recipientEmail">
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control type="email" name="email" value={recipientInfo.email} onChange={handleRecipientInfoChange} required readOnly={useProfileInfo && !!userInfo} />
                                        </Form.Group>
                                    </Row>
                                    <Form.Group className="mb-3" controlId="recipientLocation">
                                        <Form.Label>Detailed Address</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="location" value={recipientInfo.location} onChange={handleRecipientInfoChange} placeholder="Street address, Ward/Commune, District, City/Province" required readOnly={useProfileInfo && !!userInfo} />
                                    </Form.Group>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="card mb-4 shadow-sm">
                                <div className="card-header bg-light fw-bold">Payment Method</div>
                                <div className="card-body">
                                    {paymentMethods.length > 0 ? paymentMethods.map((method) => (
                                        <Form.Check
                                            key={method.paymentMethodId} type="radio" name="paymentMethod"
                                            id={`payment-${method.paymentMethodId}`} label={`${method.methodName} - ${method.description || ''}`}
                                            value={String(method.paymentMethodId)}
                                            checked={selectedPaymentMethod === String(method.paymentMethodId)}
                                            onChange={handlePaymentMethodChange}
                                            required
                                            className="mb-2"
                                        />
                                    )) : <p className="text-muted">Loading payment methods...</p>}
                                </div>
                            </div>
                        </>
                    )}
                    {/* End Delivery Specific Sections */}


                    {/* Sticky Footer */}
                    <div className="card shadow-sm sticky-bottom bg-white py-3 border-top">
                        <div className="card-body d-flex justify-content-between align-items-center px-3 px-md-4">
                            <h5 className="mb-0">
                                Total: <span className="text-danger fw-bold">{calculateTotal().toLocaleString()} $</span>
                            </h5>
                            <Button
                                variant="success" size="lg"
                                onClick={handleOrderSubmit}
                                disabled={isLoading || cartItemsFromState.length === 0 || !selectedBranch || (deliveryOption === 'delivery' && !selectedPaymentMethod)}
                                style={{ minWidth: '170px' }} // Tăng chiều rộng nút một chút
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CheckoutPage;