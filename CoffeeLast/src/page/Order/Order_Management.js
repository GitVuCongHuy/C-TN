import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Table, Spinner, Badge, Form, Button, OverlayTrigger, Tooltip, Alert } from "react-bootstrap";

function AdminOrderManagement() {
    const [allOrders, setAllOrders] = useState([]); 
    const [filteredOrders, setFilteredOrders] = useState([]); 
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);
    const [statusError, setStatusError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchStatuses = async () => {
        try {
            const response = await fetch("http://localhost:8082/status");
            if (!response.ok) throw new Error("Failed to fetch statuses");
            const data = await response.json();
            setStatuses(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
            setLoadingError("Could not load available order statuses.");
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        setLoadingError(null);
        setStatusError(null);
        try {
            const startDate = `${selectedDate}T00:00:00`;
            const endDate = `${selectedDate}T23:59:59`;
            const response = await fetch(
                `http://localhost:8082/api/orders/order_date?startDate=${startDate}&endDate=${endDate}`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch orders (Status: ${response.status})`);
            }
            const data = await response.json();
            setAllOrders(data); 

        } catch (error) {
            console.error("Error fetching orders:", error);
            setAllOrders([]); 
            setLoadingError(error.message || "An error occurred while fetching orders.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatusId) => {
        setUpdatingOrderId(orderId);
        setStatusError(null);
        try {
            const response = await fetch("http://localhost:8082/api/orders/update_status", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orderId, statusId: parseInt(newStatusId) }),
            });
            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(responseText || `Failed to update status (Status: ${response.status})`);
            }
            fetchOrders();
        } catch (error) {
            console.error("Error updating status:", error);
            setStatusError(`Order ${orderId}: ${error.message}`);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [selectedDate]);

    useEffect(() => {
        const ordersWithRecipientInfo = allOrders.filter(order => {
            const hasName = order.recipientName && order.recipientName.trim() !== '';
            const hasPhone = order.recipientPhone && order.recipientPhone.trim() !== '';
            const hasAddress = order.shippingAddress && order.shippingAddress.trim() !== '';

            return hasName || hasPhone || hasAddress;
        });
        setFilteredOrders(ordersWithRecipientInfo);
    }, [allOrders]); 


    const renderTooltip = (props, text) => (
        <Tooltip id={`tooltip-${props.id || Math.random()}`} {...props}>
            {text || "N/A"}
        </Tooltip>
    );

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Order Management</h1>
            {statusError && <Alert variant="danger" onClose={() => setStatusError(null)} dismissible>{statusError}</Alert>}

            <div className="mb-3 d-flex justify-content-end align-items-center">
                 <Form.Group controlId="dateFilter" className="d-flex align-items-center">
                     <Form.Label className="me-2 mb-0">Select Date:</Form.Label>
                     <Form.Control
                         type="date"
                         value={selectedDate}
                         onChange={(e) => setSelectedDate(e.target.value)}
                         style={{width: 'auto'}}
                     />
                 </Form.Group>
             </div>


             {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading orders...</p>
                </div>
            )}
            {loadingError && !loading && (
                 <Alert variant="danger" className="text-center">{loadingError}</Alert>
            )}

            {!loading && !loadingError && (
                <div className="table-responsive">
                    <Table striped bordered hover className="shadow-sm align-middle">
                         <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Recipient</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Total</th>
                                <th>Current Status</th>
                                <th>Payment</th>
                                <th>Chain Store</th>
                                <th>Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center text-muted">
                                        No orders with recipient details found for the selected date.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.orderId}>
                                        <td>{order.orderId}</td>
                                        <td>{order.recipientName ?? 'N/A'}</td>
                                        <td>{order.recipientPhone ?? 'N/A'}</td>
                                        <td><small>{order.shippingAddress ?? 'N/A'}</small></td>
                                        <td>{typeof order.totalAmount === 'number' ? order.totalAmount.toLocaleString() : '0'} $</td>
                                        <td>
                                            <Badge bg="info">{order.statusName ?? 'N/A'}</Badge>
                                        </td>
                                        <td>{order.paymentMethodName ?? 'N/A'}</td>
                                        <td>
                                            {order.chainName ? (
                                                <OverlayTrigger
                                                    placement="top"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={(props) => renderTooltip(props, order.chainLocation)}
                                                >
                                                    <span style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}>
                                                        {order.chainName}
                                                    </span>
                                                </OverlayTrigger>
                                            ) : 'N/A'}
                                        </td>
                                        <td>
                                            {updatingOrderId === order.orderId ? (
                                                <Spinner animation="border" size="sm" />
                                            ) : (
                                                <Form.Select
                                                    value={order.statusId || ''}
                                                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                                    size="sm"
                                                >
                                                    {!order.statusId && <option value="">Unknown</option>}
                                                    {statuses.map((status) => (
                                                        <option key={status.statusId} value={status.statusId}>
                                                            {status.statusName}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
}
export default AdminOrderManagement;