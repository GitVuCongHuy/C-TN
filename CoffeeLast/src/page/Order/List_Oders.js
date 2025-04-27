import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner, Badge, Modal, Button, Alert } from "react-bootstrap"; // Added Alert
import { Link } from "react-router-dom"; // Added Link for login button
import Context from "../../Context/Context";

function Call_List_Oder() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading only if token exists initially
    const { token } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderProducts, setSelectedOrderProducts] = useState([]);
    const [fetchError, setFetchError] = useState(null); // State to hold potential fetch errors

    const handleShowModal = (cartItems) => {
        setSelectedOrderProducts(cartItems || []);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrderProducts([]);
    };

    useEffect(() => {
        // Only attempt to fetch if a token exists
        if (!token) {
            setOrders([]); // Clear any previous orders if the user logs out
            setLoading(false); // Stop loading if there's no token
            setFetchError(null); // Clear previous errors
            return;
        }

        const fetchOrders = async () => {
            setLoading(true); // Start loading when fetching
            setFetchError(null); // Reset error state before fetch
            try {
                const response = await fetch("http://localhost:8082/order_products/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    // Handle specific auth errors or general HTTP errors
                    if (response.status === 401 || response.status === 403) {
                        setFetchError("Authorization failed. Please log in again.");
                        // Optionally clear token/logout user here if needed
                    } else {
                        setFetchError(`Failed to fetch orders. Status: ${response.status}`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error.message);
                // Keep the specific error message if set, otherwise use a generic one
                if (!fetchError) {
                    setFetchError("An error occurred while fetching your orders.");
                }
                setOrders([]); // Set empty orders on error
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
        // Reacting to token changes: if token appears, fetch; if it disappears, clear state (handled above)
    }, [token, fetchError]); // Added fetchError to dependency array to potentially clear it? Maybe not needed. Re-evaluate if needed.

    const getStatusClass = (statusName) => {
        if (!statusName) return 'secondary';
        const lowerCaseStatus = statusName.toLowerCase();
        if (lowerCaseStatus.includes('completed')) return 'success';
        if (lowerCaseStatus.includes('shipping')) return 'info';
        if (lowerCaseStatus.includes('processing')) return 'warning';
        if (lowerCaseStatus.includes('cancelled') || lowerCaseStatus.includes('failed')) return 'danger';
        return 'secondary';
    };

    // ---- Conditional Rendering Logic ----

    // 1. Check if the user is logged in (has token)
    if (!token) {
        return (
            <div className="container mt-5 d-flex justify-content-center">
                <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '500px', width: '100%' }}>
                    <div className="card-body text-center">
                        <div className="mb-3">
                            <i className="bi bi-shield-lock-fill" style={{ fontSize: '2rem', color: '#8B4513' }}></i>
                        </div>
                        <h4 className="card-title mb-3 fw-semibold text-dark">Login Required</h4>
                        <p className="card-text text-muted mb-4">
                            Please log in to view your order history and manage your account.
                        </p>
                        <Link
                            to="/login_register"
                            className="btn btn-lg rounded-pill px-4 shadow-sm"
                            style={{ backgroundColor: '#8B4513', color: '#fff', border: 'none' }}
                        >
                            Login Now
                        </Link>
                    </div>
                </div>
            </div>


        );
    }

    // 2. If logged in, check if loading
    if (loading) {
        return (
            <div className="text-center my-5">
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading your orders...</p>
            </div>
        );
    }

    // 3. If logged in and not loading, check for fetch errors
    if (fetchError) {
        return (
            <div className="container mt-4">
                <h2 className="text-center mb-4">Your Orders</h2>
                <Alert variant="danger" className="text-center">
                    {fetchError}
                </Alert>
            </div>
        );
    }

    // 4. If logged in, not loading, no errors, check if there are any orders
    if (!orders || orders.length === 0) {
        return (
            <div className="container mt-4">
                <h2 className="text-center mb-4">Your Orders</h2>
                <Alert variant="info" className="text-center">
                    You haven't placed any orders yet.
                </Alert>
            </div>
        );
    }

    // 5. If logged in, not loading, no errors, and orders exist, display the table
    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Your Orders</h2>
            <div className="table-responsive">
                <table className="table table-hover table-striped align-middle shadow-sm order-list-table">
                    <thead className="table-dark">
                        <tr>
                            <th>Id</th>
                            <th>User</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th style={{ textAlign: 'center' }}>Products</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((orderData, index) => (
                            <tr key={orderData.orderId || index}>
                                <td className="fw-bold">{orderData.orderId ?? 'N/A'}</td>
                                <td>{orderData.userName ?? 'N/A'}</td>
                                <td>
                                    <strong>{typeof orderData.totalAmount === 'number' ? orderData.totalAmount.toLocaleString() : '0'} $</strong>
                                </td>
                                <td>
                                    <Badge bg={getStatusClass(orderData.statusName)} className="p-2">
                                        {orderData.statusName ?? 'N/A'}
                                    </Badge>
                                </td>
                                <td>{orderData.paymentMethodName ?? 'N/A'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {orderData.cartReturnDTOS && orderData.cartReturnDTOS.length > 0 ? (
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleShowModal(orderData.cartReturnDTOS)}
                                        >
                                            Details
                                        </Button>
                                    ) : (
                                        <span className="text-muted small">No Products</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {selectedOrderProducts.length > 0 ? (
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrderProducts.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <img src={item.productImg || '/placeholder.png'} alt={item.productName || 'N/A'} width="50" className="img-thumbnail" />
                                        </td>
                                        <td>{item.productName ?? 'N/A'}</td>
                                        <td style={{ textAlign: 'center' }} >{item.quantity ?? 0}</td>
                                        <td>{typeof item.price === 'number' ? item.price.toLocaleString() : '0'} $</td>
                                        <td>{typeof item.quantity === 'number' && typeof item.price === 'number' ? (item.quantity * item.price).toLocaleString() : '0'} $</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No product details available for this order.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

// Renaming the exported component for clarity, though List_Oders is fine too
function UserOrderList() {
    // You might add other wrapper logic here if needed in the future
    return <Call_List_Oder />;
}

// Export the wrapper component
export default UserOrderList; // Changed export name