// CheckoutPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Context from '../../Context/Context'; 
import './CheckoutPage.css'; // Import custom CSS file

const API_BASE_URL = 'http://localhost:8082';

const CheckoutPage = () => {
    const { token, setLastOrderSuccess, removeItemsByIds } = useContext(Context); 

    const location = useLocation();
    const navigate = useNavigate();

    const cartItemsFromState = location.state?.cart || [];
    const totalAmountFromState = location.state?.total || 0;
    const itemIdsToRemove = location.state?.itemIdsToRemoveAfterSuccess || []; // Lấy mảng ID

    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [recipientInfo, setRecipientInfo] = useState({ name: '', phone: '', email: '', location: '' });
    const [userInfo, setUserInfo] = useState(null);
    const [useProfileInfo, setUseProfileInfo] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [deliveryOption, setDeliveryOption] = useState('atStore'); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successOrderId, setSuccessOrderId] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) { setUserInfo(null); setUseProfileInfo(false); return; }
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/user_data/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json(); setUserInfo(data); setUseProfileInfo(true); 
                } else { setUserInfo(null); setUseProfileInfo(false); console.error('Failed fetch profile:', response.status); }
            } catch (err) { setUserInfo(null); setUseProfileInfo(false); setError('Failed to load profile.'); console.error(err); }
        };
        if (deliveryOption === 'delivery') { 
            fetchUserInfo();
        } else { 
            setUserInfo(null);
            setUseProfileInfo(false);
        }
    }, [token, deliveryOption]); 

    useEffect(() => {
        if (deliveryOption === 'delivery' && useProfileInfo && userInfo) {
            setRecipientInfo({
                name: userInfo.name || '', phone: userInfo.phone_number || '',
                email: userInfo.email || '', location: userInfo.address || '',
            });
        } else if (deliveryOption === 'delivery' && !useProfileInfo) {
        }
    }, [useProfileInfo, userInfo, deliveryOption]);

    useEffect(() => {
        const fetchBranches = async () => {
             try {
                 const response = await fetch(`${API_BASE_URL}/chain/get_all`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
                 if (response.ok) {
                     const data = await response.json();
                     setBranches(data.map(item => ({ id: item.chain_id, name: item.name, location: item.location })));
                 } else { setError('Could not load branches.'); }
             } catch (err) { setError('Connection error loading branches.'); }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
             try {
                 setLoadingPaymentMethods(true);
                 const response = await fetch(`${API_BASE_URL}/payment-methods`);
                 if (response.ok) { const data = await response.json(); setPaymentMethods(data); }
                 else { setError('Could not load payment methods.'); }
             } catch (err) { setError('Connection error loading payment methods.'); }
             finally { setLoadingPaymentMethods(false); }
        };
        if (deliveryOption === 'delivery') { 
            fetchPaymentMethods();
        } else {
            setPaymentMethods([]); 
            setSelectedPaymentMethod('');
        }
    }, [deliveryOption]);

    const handleRecipientInfoChange = (e) => {
        if (useProfileInfo && deliveryOption === 'delivery') {
            setUseProfileInfo(false);
        }
        const { name, value } = e.target;
        setRecipientInfo(prev => ({ ...prev, [name]: value }));
    };
    const handleUseInfoOptionChange = (useSaved) => {
        setUseProfileInfo(useSaved);
        if (!useSaved && deliveryOption === 'delivery') { 
             setRecipientInfo({ name: '', phone: '', email: '', location: '' });
        }
    };
    const handleDeliveryOptionChange = (option) => {
        setDeliveryOption(option);
        setError(null); 
        if (option === 'atStore') {
            setRecipientInfo({ name: '', phone: '', email: '', location: '' });
            setSelectedPaymentMethod('');
            setUseProfileInfo(false); 
        } else {
            if(token && !userInfo) { 
            } else if (token && userInfo) { 
                setUseProfileInfo(true); 
            }
        }
    };
    const calculateTotal = useCallback(() => totalAmountFromState, [totalAmountFromState]);
    const handlePaymentMethodChange = (e) => { setSelectedPaymentMethod(e.target.value); };
    const handleBranchSelection = (branchId) => { setSelectedBranch(branchId); };

    const handleOrderSubmit = async () => {
        setError(null);
        setIsLoading(true);

        if (!selectedBranch) { setError('Please select a branch.'); setIsLoading(false); return; }
        if (cartItemsFromState.length === 0) { setError('Your cart is empty.'); setIsLoading(false); return; }

        if (deliveryOption === 'atStore') {
            await new Promise(resolve => setTimeout(resolve, 300)); 
            if (itemIdsToRemove.length > 0) {
                removeItemsByIds(itemIdsToRemove);
                console.log("Items removed for 'atStore' order commitment:", itemIdsToRemove);
            }
            setSuccessOrderId(null);
            setShowSuccess(true);
            setIsLoading(false);
            return;
        }

        // Validations cho delivery
        if (!recipientInfo.name.trim()) { setError('Please enter recipient name.'); setIsLoading(false); return; }
        if (!recipientInfo.phone.trim()) { setError('Please enter recipient phone.'); setIsLoading(false); return; }
        if (!recipientInfo.email.trim() || !/\S+@\S+\.\S+/.test(recipientInfo.email)) { setError('Please enter a valid email.'); setIsLoading(false); return; }
        if (!recipientInfo.location.trim()) { setError('Please enter delivery address.'); setIsLoading(false); return; }
        if (!selectedPaymentMethod) { setError('Please select a payment method.'); setIsLoading(false); return; }

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

        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
                method: 'POST',
                headers: { ...(token && { Authorization: `Bearer ${token}` }), 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            if (response.ok) {
                const createdOrder = await response.json();
                console.log("Order created successfully:", createdOrder);

                setLastOrderSuccess({
                    orderId: createdOrder.orderId,
                    totalAmount: createdOrder.totalAmount
                });

                if (deliveryOption === 'delivery' && itemIdsToRemove.length > 0) {
                    removeItemsByIds(itemIdsToRemove);
                    console.log("Items removed after successful delivery order:", itemIdsToRemove);
                }

                setSuccessOrderId(createdOrder.orderId);
                setShowSuccess(true);

            } else {
                const errorData = await response.text();
                const displayError = `Error ${response.status}: ${errorData || 'Could not create order.'}`;
                setError(displayError);
            }
        } catch (err) {
            const displayError = 'Server connection error while creating order.';
            setError(displayError);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        setShowSuccess(false);
        navigate('/');
    };

    return (
        <div className="checkout-container container mt-5 pb-5">
            {!showSuccess && (
                <div className="checkout-header text-center mb-5">
                    <h2 className="display-5 fw-bold">Complete Your Order</h2>
                    <p className="text-muted">Just a few more steps to finish your purchase</p>
                </div>
            )}

            {showSuccess && (
                <>
                    <Confetti recycle={false} numberOfPieces={showSuccess ? 500 : 0} width={window.innerWidth} height={window.innerHeight}/>
                    <Modal show={showSuccess} centered onHide={handleBackToHome} backdrop="static" className="success-modal">
                        <div className="success-modal-content p-4 p-md-5">
                            <div className="success-icon-wrapper mb-4">
                                <div className="success-icon">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                            </div>
                            <h2 className="mb-3 fw-bold">{deliveryOption === 'delivery' ? 'Order Placed Successfully!' : 'Order Ready!'}</h2>
                            {successOrderId && (
                                <p className="fs-5 mb-3">Order ID: <strong>#{successOrderId}</strong></p>
                            )}
                            <p className="fs-6">
                                {deliveryOption === 'atStore'
                                    ? 'Please proceed to the counter to pay and collect your items.'
                                    : 'We will process your order and deliver it as soon as possible.'}
                            </p>
                            <p className="mb-4">Thank you for your purchase!</p>
                            <Button
                                onClick={handleBackToHome}
                                className="btn-home-return"
                            >
                                Back to Home
                                <i className="bi bi-house-door ms-2"></i>
                            </Button>
                        </div>
                    </Modal>
                </>
            )}

            {!showSuccess && (
                <div className="checkout-content">
                    {error && (
                        <div className="error-notification mb-4" role="alert">
                            <div className="error-content">
                                <i className="bi bi-exclamation-triangle-fill error-icon"></i>
                                <span>{error}</span>
                            </div>
                            <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
                        </div>
                    )}

                    {/* Progress Stepper */}
                    <div className="checkout-progress mb-4">
                        <div className="progress-step active">
                            <div className="step-icon">1</div>
                            <div className="step-label">Option</div>
                        </div>
                        <div className="progress-connector"></div>
                        <div className={`progress-step ${selectedBranch ? 'active' : ''}`}>
                            <div className="step-icon">2</div>
                            <div className="step-label">Branch</div>
                        </div>
                        <div className="progress-connector"></div>
                        <div className={`progress-step ${deliveryOption === 'delivery' && selectedPaymentMethod ? 'active' : deliveryOption === 'atStore' ? 'active' : ''}`}>
                            <div className="step-icon">3</div>
                            <div className="step-label">{deliveryOption === 'delivery' ? 'Payment' : 'Review'}</div>
                        </div>
                        {deliveryOption === 'delivery' && (
                            <>
                                <div className="progress-connector"></div>
                                <div className={`progress-step ${recipientInfo.name && recipientInfo.phone && recipientInfo.email && recipientInfo.location ? 'active' : ''}`}>
                                    <div className="step-icon">4</div>
                                    <div className="step-label">Details</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Delivery/Pickup Option */}
                    <div className="checkout-card mb-4">
                        <div className="checkout-card-header">
                            <span className="step-number">1</span>
                            <h3>Choose Your Option</h3>
                        </div>
                        <div className="checkout-card-body">
                            <Row className="option-buttons">
                                <Col md={6} className="mb-3 mb-md-0">
                                    <button 
                                        className={`option-button ${deliveryOption === 'atStore' ? 'active' : ''}`}
                                        onClick={() => handleDeliveryOptionChange('atStore')}
                                    >
                                        <i className="bi bi-shop me-2"></i>
                                        <div>
                                            <h4>Pick up at Store</h4>
                                            <p>Collect your order at your chosen branch</p>
                                        </div>
                                    </button>
                                </Col>
                                <Col md={6}>
                                    <button 
                                        className={`option-button ${deliveryOption === 'delivery' ? 'active' : ''}`}
                                        onClick={() => handleDeliveryOptionChange('delivery')}
                                    >
                                        <i className="bi bi-truck me-2"></i>
                                        <div>
                                            <h4>Home Delivery</h4>
                                            <p>Get your items delivered to your address</p>
                                        </div>
                                    </button>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    <div className="checkout-card mb-4">
                        <div className="checkout-card-header">
                            <span className="step-number">2</span>
                            <h3>Select Branch</h3>
                        </div>
                        <div className="checkout-card-body">
                            {branches.length > 0 ? (
                                <div className="branch-list">
                                    {branches.map((branch) => (
                                        <div 
                                            key={branch.id}
                                            className={`branch-item ${selectedBranch === branch.id ? 'active' : ''}`}
                                            onClick={() => handleBranchSelection(branch.id)}
                                        >
                                            <div className="branch-radio">
                                                <div className="radio-outer">
                                                    <div className="radio-inner"></div>
                                                </div>
                                            </div>
                                            <div className="branch-info">
                                                <h4>{branch.name}</h4>
                                                <p><i className="bi bi-geo-alt me-1"></i>{branch.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="loading-branches">
                                    <Spinner animation="border" variant="primary" />
                                    <p>Loading branches...</p>
                                </div>
                            )}
                            {!selectedBranch && cartItemsFromState.length > 0 && (
                                <div className="info-alert">
                                    <i className="bi bi-info-circle"></i>
                                    <span>Please select a branch to proceed.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="checkout-card mb-4">
                        <div className="checkout-card-header">
                            <span className="step-number">3</span>
                            <h3>Your Items for Checkout</h3>
                        </div>
                        <div className="checkout-card-body p-0">
                            {cartItemsFromState.length > 0 ? (
                                <div className="cart-items">
                                    {cartItemsFromState.map((item) => (
                                        <div key={item.productId || item.name} className="cart-item">
                                            <div className="item-image">
                                                <img
                                                    src={item.img || 'https://via.placeholder.com/60'}
                                                    alt={item.name || 'Product'}
                                                    onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/60'; }}
                                                />
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.name || 'Product Name'}</h4>
                                                <p>Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="item-price">
                                                <p>{(item.price * item.quantity).toLocaleString()} $</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-cart">
                                    <i className="bi bi-cart-x"></i>
                                    <p>No items selected for checkout.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {deliveryOption === 'delivery' && (
                        <>
                            {token && (
                                <div className="checkout-card mb-4">
                                    <div className="checkout-card-header">
                                        <span className="step-number">4</span>
                                        <h3>Recipient Information</h3>
                                    </div>
                                    <div className="checkout-card-body">
                                        <div className="profile-options">
                                            <label className={`profile-option ${useProfileInfo ? 'active' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="infoOption"
                                                    checked={useProfileInfo}
                                                    onChange={() => handleUseInfoOptionChange(true)}
                                                    disabled={!userInfo}
                                                />
                                                <span className="option-label">
                                                    <i className="bi bi-person-check me-2"></i>
                                                    Use my profile information
                                                </span>
                                            </label>
                                            <label className={`profile-option ${!useProfileInfo ? 'active' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="infoOption"
                                                    checked={!useProfileInfo}
                                                    onChange={() => handleUseInfoOptionChange(false)}
                                                />
                                                <span className="option-label">
                                                    <i className="bi bi-pencil-square me-2"></i>
                                                    Enter new information
                                                </span>
                                            </label>
                                        </div>
                                        
                                        {useProfileInfo && userInfo && (
                                            <div className="info-alert success">
                                                <i className="bi bi-check-circle"></i>
                                                <span>Using information from your profile. To change, select "Enter new information".</span>
                                            </div>
                                        )}
                                        
                                        {!userInfo && token && !error && (
                                            <div className="loading-profile">
                                                <Spinner animation="border" size="sm" />
                                                <span>Loading your profile information...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={`checkout-card mb-4 ${useProfileInfo && userInfo && deliveryOption === 'delivery' ? 'readonly-form' : ''}`}>
                                <div className="checkout-card-header">
                                    <span className="step-number">{token ? '5' : '4'}</span>
                                    <h3>
                                        {token && deliveryOption === 'delivery' && !useProfileInfo ? 'Enter New Recipient Details' : 
                                         token && deliveryOption === 'delivery' && useProfileInfo ? 'Verify Recipient Details (from profile)' : 
                                         'Recipient Details'}
                                    </h3>
                                </div>
                                <div className="checkout-card-body">
                                    <div className="recipient-form">
                                        <div className="form-group">
                                            <label htmlFor="recipientName">
                                                Full Name <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="recipientName"
                                                name="name"
                                                value={recipientInfo.name}
                                                onChange={handleRecipientInfoChange}
                                                required
                                                readOnly={useProfileInfo && !!userInfo && deliveryOption === 'delivery'}
                                                className="form-control"
                                            />
                                        </div>
                                        
                                        <Row>
                                            <Col md={6}>
                                                <div className="form-group">
                                                    <label htmlFor="recipientPhone">
                                                        Phone Number <span className="required">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        id="recipientPhone"
                                                        name="phone"
                                                        value={recipientInfo.phone}
                                                        onChange={handleRecipientInfoChange}
                                                        required
                                                        readOnly={useProfileInfo && !!userInfo && deliveryOption === 'delivery'}
                                                        className="form-control"
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="form-group">
                                                    <label htmlFor="recipientEmail">
                                                        Email Address <span className="required">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="recipientEmail"
                                                        name="email"
                                                        value={recipientInfo.email}
                                                        onChange={handleRecipientInfoChange}
                                                        required
                                                        readOnly={useProfileInfo && !!userInfo && deliveryOption === 'delivery'}
                                                        className="form-control"
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                        
                                        <div className="form-group">
                                            <label htmlFor="recipientLocation">
                                                Detailed Address <span className="required">*</span>
                                            </label>
                                            <textarea
                                                id="recipientLocation"
                                                name="location"
                                                rows={3}
                                                value={recipientInfo.location}
                                                onChange={handleRecipientInfoChange}
                                                placeholder="Street address, Ward/Commune, District, City/Province"
                                                required
                                                readOnly={useProfileInfo && !!userInfo && deliveryOption === 'delivery'}
                                                className="form-control"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="checkout-card mb-4">
                                <div className="checkout-card-header">
                                    <span className="step-number">{token ? '6' : '5'}</span>
                                    <h3>Payment Method</h3>
                                </div>
                                <div className="checkout-card-body">
                                    {paymentMethods.length > 0 ? (
                                        <div className="payment-methods">
                                            {paymentMethods.map((method) => (
                                                <div 
                                                    key={method.paymentMethodId}
                                                    className={`payment-method ${selectedPaymentMethod === String(method.paymentMethodId) ? 'active' : ''}`}
                                                    onClick={() => setSelectedPaymentMethod(String(method.paymentMethodId))}
                                                >
                                                    <div className="payment-radio">
                                                        <div className="radio-outer">
                                                            <div className="radio-inner"></div>
                                                        </div>
                                                    </div>
                                                    <div className="payment-info">
                                                        <h4>{method.methodName}</h4>
                                                        {method.description && <p>{method.description}</p>}
                                                    </div>
                                                    {getPaymentIcon(method.methodName)}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        loadingPaymentMethods ? (
                                            <div className="loading-payment">
                                                <Spinner animation="border" variant="primary" />
                                                <p>Loading payment methods...</p>
                                            </div>
                                        ) : (
                                            <div className="no-payment-methods">
                                                <i className="bi bi-credit-card-x"></i>
                                                <p>No payment methods available or error loading them.</p>
                                            </div>
                                        )
                                    )}
                                    
                                    {!selectedPaymentMethod && deliveryOption === 'delivery' && !error && (
                                        <div className="info-alert">
                                            <i className="bi bi-info-circle"></i>
                                            <span>Please select a payment method.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="checkout-summary-card">
                        <div className="summary-content">
                            <div className="summary-details">
                                <div className="summary-amount">
                                    <h4>Total Amount</h4>
                                    <p className="total-price">{calculateTotal().toLocaleString()} $</p>
                                </div>
                                <div className="summary-info">
                                    <p><i className="bi bi-box-seam me-2"></i> {cartItemsFromState.length} items</p>
                                    {selectedBranch && branches.length > 0 && (
                                        <p>
                                            <i className="bi bi-geo-alt me-2"></i>
                                            {branches.find(b => b.id === selectedBranch)?.name || 'Selected branch'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                className="btn-place-order"
                                onClick={handleOrderSubmit}
                                disabled={
                                    isLoading ||
                                    cartItemsFromState.length === 0 ||
                                    !selectedBranch ||
                                    (deliveryOption === 'delivery' && (
                                        !selectedPaymentMethod ||
                                        !recipientInfo.name.trim() ||
                                        !recipientInfo.phone.trim() ||
                                        !recipientInfo.email.trim() ||
                                        !/\S+@\S+\.\S+/.test(recipientInfo.email) ||
                                        !recipientInfo.location.trim()
                                    ))
                                }
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{deliveryOption === 'atStore' ? 'Confirm Pickup Order' : 'Place Delivery Order'}</span>
                                        <i className="bi bi-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to get payment method icons
function getPaymentIcon(methodName) {
    const method = methodName.toLowerCase();
    
    if (method.includes('visa') || method.includes('card') || method.includes('credit')) {
        return <i className="bi bi-credit-card payment-icon"></i>;
    } else if (method.includes('paypal')) {
        return <i className="bi bi-paypal payment-icon"></i>;
    } else if (method.includes('cash')) {
        return <i className="bi bi-cash payment-icon"></i>;
    } else if (method.includes('bank')) {
        return <i className="bi bi-bank payment-icon"></i>;
    } else {
        return <i className="bi bi-wallet2 payment-icon"></i>;
    }
}

export default CheckoutPage;