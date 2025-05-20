import React, { useState, useEffect, useCallback } from "react"; // Thêm useCallback
import "bootstrap/dist/css/bootstrap.min.css";
import { Table, Spinner, Badge, Form, Button, OverlayTrigger, Tooltip, Alert } from "react-bootstrap";

const API_BASE_URL = 'http://localhost:8082'; // Định nghĩa API_BASE_URL

function AdminOrderManagement() {
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);
    const [statusUpdateFeedback, setStatusUpdateFeedback] = useState({ type: '', message: '', orderId: null }); // Để hiển thị feedback
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchStatuses = useCallback(async () => { // Sử dụng useCallback
        try {
            const response = await fetch(`${API_BASE_URL}/status`); // Sử dụng API_BASE_URL
            if (!response.ok) throw new Error("Failed to fetch statuses");
            const data = await response.json();
            setStatuses(data);
        } catch (error) {
            console.error("Error fetching statuses:", error);
            // Không set loadingError ở đây vì nó liên quan đến orders
            setStatusUpdateFeedback({ type: 'danger', message: "Could not load available order statuses." });
        }
    }, []); // Dependency rỗng vì không phụ thuộc state/props

    const fetchOrders = useCallback(async (date) => { // Nhận date làm tham số
        setLoading(true);
        setLoadingError(null);
        // setStatusUpdateFeedback({ type: '', message: '', orderId: null }); // Reset feedback khi fetch lại orders
        try {
            const startDate = `${date}T00:00:00`;
            const endDate = `${date}T23:59:59`;
            const response = await fetch(
                `${API_BASE_URL}/api/orders/order_date?startDate=${startDate}&endDate=${endDate}` // Sử dụng API_BASE_URL
            );
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Failed to fetch orders (Status: ${response.status})` }));
                throw new Error(errorData.message || `Failed to fetch orders (Status: ${response.status})`);
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
    }, []); // Dependency rỗng, fetchOrders sẽ được gọi với selectedDate mới

    const handleStatusChange = async (orderId, newStatusId) => {
        setUpdatingOrderId(orderId);
        setStatusUpdateFeedback({ type: '', message: '', orderId: null }); // Clear previous feedback

        // Tìm đơn hàng hiện tại để lấy statusName cũ (nếu cần thiết cho feedback)
        const currentOrder = filteredOrders.find(o => o.orderId === orderId);
        const oldStatusName = currentOrder ? currentOrder.statusName : 'N/A';


        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/update_status`, { // Sử dụng API_BASE_URL
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // Thêm Authorization header nếu API yêu cầu
                    // "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, statusId: parseInt(newStatusId) }),
            });

            const responseText = await response.text(); // Đọc body text trước

            if (!response.ok) {
                // Nếu server trả về JSON error, cố gắng parse nó
                let errorMessage = responseText;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || responseText;
                } catch (e) {
                    // Không phải JSON, giữ nguyên responseText
                }
                // Phân biệt lỗi
                if (response.status === 404) {
                     throw new Error(`Order or Status not found. Server says: ${errorMessage}`);
                } else if (response.status >= 500) {
                    console.error("Server error response text:", responseText); // Log chi tiết lỗi server
                    throw new Error(`Server error updating status. Please check server logs or try again later. (Details: ${errorMessage})`);
                }
                throw new Error(errorMessage || `Failed to update status (Code: ${response.status})`);
            }

            // Thành công
            setStatusUpdateFeedback({
                type: 'success',
                message: `Order #${orderId} status successfully updated to '${statuses.find(s => s.statusId === parseInt(newStatusId))?.statusName || 'new status'}'.`,
                orderId: orderId
            });
            // Fetch lại orders để cập nhật UI
            // Thay vì fetch tất cả, chỉ cập nhật order đó trong state allOrders / filteredOrders
            setAllOrders(prevOrders => prevOrders.map(order =>
                order.orderId === orderId
                    ? { ...order, statusId: parseInt(newStatusId), statusName: statuses.find(s => s.statusId === parseInt(newStatusId))?.statusName }
                    : order
            ));
            // Nếu bạn muốn fetch lại toàn bộ:
            // await fetchOrders(selectedDate); // Gọi với selectedDate hiện tại

        } catch (error) {
            console.error("Error updating status for order " + orderId + ":", error);
            setStatusUpdateFeedback({
                type: 'danger',
                message: `Error updating status for Order #${orderId}: ${error.message}`,
                orderId: orderId
            });
        } finally {
            setUpdatingOrderId(null);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]); // Thêm fetchStatuses vào dependency array

    useEffect(() => {
        fetchOrders(selectedDate); // Gọi fetchOrders với selectedDate
    }, [selectedDate, fetchOrders]); // Thêm fetchOrders vào dependency array

    useEffect(() => {
        // Lọc đơn hàng sau khi allOrders thay đổi
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

            {/* Hiển thị feedback chung hoặc cho từng đơn hàng */}
            {statusUpdateFeedback.message && (
                <Alert
                    variant={statusUpdateFeedback.type}
                    onClose={() => setStatusUpdateFeedback({ type: '', message: '', orderId: null })}
                    dismissible
                >
                    {statusUpdateFeedback.message}
                </Alert>
            )}


            <div className="mb-3 d-flex justify-content-end align-items-center">
                <Form.Group controlId="dateFilter" className="d-flex align-items-center">
                    <Form.Label className="me-2 mb-0">Select Date:</Form.Label>
                    <Form.Control
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            // Reset feedback khi đổi ngày
                            setStatusUpdateFeedback({ type: '', message: '', orderId: null });
                        }}
                        style={{ width: 'auto' }}
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
                                    <tr key={order.orderId} className={statusUpdateFeedback.orderId === order.orderId && statusUpdateFeedback.type === 'danger' ? 'table-danger' : ''}>
                                        <td>{order.orderId}</td>
                                        <td>{order.recipientName ?? 'N/A'}</td>
                                        <td>{order.recipientPhone ?? 'N/A'}</td>
                                        <td><small>{order.shippingAddress ?? 'N/A'}</small></td>
                                        <td>{typeof order.totalAmount === 'number' ? order.totalAmount.toLocaleString() : '0'} $</td>
                                        <td>
                                            <Badge bg={order.statusName === "Completed" ? "success" : order.statusName === "Cancelled" ? "danger" : "info"}>
                                                {order.statusName ?? 'N/A'}
                                            </Badge>
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
                                                    disabled={order.statusName === "Completed" || order.statusName === "Cancelled"} // Không cho đổi nếu đã completed/cancelled
                                                >
                                                    {/* <option value="" disabled={!!order.statusId}>Select Status</option> */}
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