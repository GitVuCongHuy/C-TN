import React, { useMemo, useState, useEffect, useContext, useCallback } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import style from './Header.module.css';
import Context from '../../../../Context/Context';
import { Dropdown, Badge, Spinner, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
const API_BASE_URL = 'http://localhost:8082';
const DEFAULT_AVATAR = '/image/anhdaidien.jpg';

const AdminNotificationItem = React.memo(({ notification, onMarkAsRead }) => {
    const navigate = useNavigate();

    const [isLocallyRead, setIsLocallyRead] = useState(() => {
        const readNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        return notification.read || !!readNotifications[notification.id || notification.orderId];
    });

    const handleClick = (e) => {
        e.preventDefault();
        if (notification.read === false) { // Dùng notification.read
            onMarkAsRead(notification.id || notification.orderId);
        }

        setIsLocallyRead(true);
        const readNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        readNotifications[notification.id || notification.orderId] = true;
        localStorage.setItem('readAdminNotifications', JSON.stringify(readNotifications));

        navigate('/order_for_manager');
    };
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        try {
            const date = new Date(dateTimeString);
            return formatDistanceToNow(date, { addSuffix: true });

        } catch (error) {
            console.error("Error formatting date:", error);
            return '';
        }
   }
    return (

        <Dropdown.Item
            as="a"
            href="/order_for_manager"
            onClick={handleClick}
            className={`${style.NotificationItem} ${!isLocallyRead ? style.UnreadNotification : style.ReadNotification}`}
            title={`Order #${notification.orderId} from ${notification.customerName || 'N/A'}`}
        >
            <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1 me-2"> 
                    <div>
                        {!isLocallyRead && <i className={`bi bi-circle-fill text-primary me-1 ${style.UnreadDot}`}></i>}
                        
                        <strong className={style.CustomerName}>{notification.customerName || 'Guest Order'}</strong>
                        <span> placed order </span>
                        <strong>#{notification.orderId}</strong>
                    </div>
                    <small className="text-muted d-block mt-1"> 
                         Total: {notification.totalAmount?.toLocaleString()} $
                         
                         {notification.orderDate && <span className="ms-2">({formatDateTime(notification.orderDate)})</span>}
                     </small>
                </div>
                
                
            </div>
        </Dropdown.Item>
    );
});
const CustomerNotificationItem = React.memo(({ orderId, totalAmount, onDismiss }) => (
    <Dropdown.ItemText className={`${style.NotificationItem} ${style.CustomerNotification}`}>
        <div className="d-flex justify-content-between align-items-start">
            <div>
                <i className={`bi bi-check-circle-fill text-success me-2 ${style.CustomerIcon}`}></i>
                <span>Order <strong>#{orderId}</strong> placed!</span> <br />
                <small className="text-muted">Total: {totalAmount?.toLocaleString()} $</small> <br/>
                <Link to="/list_order" className="small text-primary fw-bold" onClick={onDismiss}>View Details</Link>
            </div>
            <Button variant="close" size="sm" onClick={onDismiss} aria-label="Dismiss" className={style.DismissButton}></Button>
        </div>
    </Dropdown.ItemText>
));
const AnonymousNotificationItem = React.memo(() => (
    <Dropdown.ItemText className={`text-center text-muted small py-3 ${style.NotificationItem}`}>
       <i className="bi bi-person-slash me-1"></i> Please <Link to="/login_register">log in</Link> to see notifications.
    </Dropdown.ItemText>
));


function HeaderTikTok() {
    const {
        cart, token, removeToken, avatar, roles,
        lastOrderSuccess, clearLastOrderSuccess
    } = useContext(Context);

    const [rolesLoaded, setRolesLoaded] = useState(false);
    const [adminNotifications, setAdminNotifications] = useState([]);
    const [unreadAdminCount, setUnreadAdminCount] = useState(0);
    const [loadingAdminNotifications, setLoadingAdminNotifications] = useState(false);
    const [notificationError, setNotificationError] = useState(null);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    useEffect(() => {
        if (roles && Array.isArray(roles)) { // Kiểm tra roles có phải là mảng và không rỗng/null
            setRolesLoaded(true);
            console.log("Roles loaded from context:", roles);
        } else {
            setRolesLoaded(false); // Đặt lại nếu roles bị xóa hoặc không hợp lệ
            console.log("Roles not loaded or invalid:", roles);
        }
    }, [roles]);
    
    const hasRole = useCallback((roleName) => {
        if (!rolesLoaded) return false; // Trả về false nếu roles chưa load
        return roles.some((role) => role?.role?.roleName === roleName);
    }, [roles, rolesLoaded]);

    const isAdmin = useMemo(() => hasRole('DIRECTOR'), [hasRole]);
    const isStaff = useMemo(() => hasRole('EMPLOYEE'), [hasRole]);
    const isCustomer = useMemo(() => token && rolesLoaded && !isAdmin && !isStaff, [token, rolesLoaded, isAdmin, isStaff]);
    const isAnonymous = useMemo(() => !token, [token]);


    const fetchAdminNotifications = useCallback(async (isInitialLoad = false) => {
    if (!token || !rolesLoaded || (!isAdmin && !isStaff)) {
        console.log("Skipping fetch: No token, roles not loaded, or not admin/staff.");
        if (!initialFetchDone) setInitialFetchDone(true);
        setAdminNotifications([]);
        setUnreadAdminCount(0); // Reset count nếu không fetch
        setNotificationError(null);
        return;
    }
    console.log("Proceeding with fetch: Token, roles loaded, user is admin/staff.");
    if (isInitialLoad || adminNotifications.length === 0) {
        setLoadingAdminNotifications(true);
    }
    setNotificationError(null);

    try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Failed: ${response.status}`);
        const data = await response.json();

        const notifications = Array.isArray(data) ? data : [];
        const readNotificationsStorage = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        const count = notifications.filter(n => {
            const notificationKey = n.id || n.orderId; // Lấy key định danh
            const isLocallyRead = !!readNotificationsStorage[notificationKey]; // Kiểm tra trong localStorage
            // Chỉ tính là chưa đọc nếu API trả về read:false VÀ nó chưa được đánh dấu đọc trong localStorage
            return n.read === false && !isLocallyRead;
        }).length;

        console.log("Read notifications from localStorage:", readNotificationsStorage); // Log thêm
        console.log("Calculated unread count (API + localStorage):", count);

        setAdminNotifications(notifications);
        setUnreadAdminCount(count); // <-- Cập nhật số đếm chưa đọc từ API

    } catch (error) {
        console.error("Error fetching admin notifications:", error);
        setNotificationError(error.message || "Could not load notifications.");
        // Không xóa thông báo cũ nếu fetch sau đó bị lỗi, giữ lại UI cũ
        // setAdminNotifications([]);
        // setUnreadAdminCount(0);
    } finally {
        setLoadingAdminNotifications(false);
        if (!initialFetchDone) setInitialFetchDone(true);
    }
}, [token, rolesLoaded, isAdmin, isStaff, adminNotifications.length, initialFetchDone]);

useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const runFetch = async () => {
        if (isMounted) {
            await fetchAdminNotifications(true); // Fetch lần đầu, có thể hiện loading
        }
    };

    if (token && rolesLoaded) {
        // Kiểm tra lại là admin/staff mới chạy fetch và polling
        if (isAdmin || isStaff) {
            console.log("Running initial fetch (roles loaded)...");
            runFetch();

            const checkAndStartPolling = () => {
                if (isMounted && initialFetchDone) {
                    console.log("Initial fetch done, starting polling...");
                    intervalId = setInterval(() => {
                        console.log("Polling for admin notifications...");
                        fetchAdminNotifications(false);
                    }, 15000); // Giảm polling interval xuống 15s để test
                } else if (isMounted) {
                    console.log("Waiting for initial fetch to complete before polling...");
                    setTimeout(checkAndStartPolling, 500);
                }
            }
            checkAndStartPolling();
        } else {
             // Là customer hoặc role khác, reset admin state
             console.log("User is not admin/staff, resetting admin notifications state.");
             setAdminNotifications([]);
             setUnreadAdminCount(0);
             setNotificationError(null);
             setInitialFetchDone(true); // Đánh dấu xong (vì không cần fetch admin)
        }
   } else if (!token) {
        // Không có token (anonymous), reset admin state
        console.log("No token, resetting admin notifications state.");
        setAdminNotifications([]);
        setUnreadAdminCount(0);
        setNotificationError(null);
        setInitialFetchDone(true);
   } else {
        // Có token nhưng roles chưa load
        console.log("Token exists, but roles not loaded yet. Waiting...");
        // Không làm gì, đợi useEffect của rolesLoaded trigger lại
        setInitialFetchDone(false); // Đảm bảo initial fetch sẽ chạy khi roles load xong
   }


    // Cleanup function: Hủy interval khi component unmount hoặc dependencies thay đổi
    return () => {
        isMounted = false;
        if (intervalId) {
            clearInterval(intervalId);
            console.log("Cleared notification polling interval.");
        }
    };
    // Chạy lại effect này khi token hoặc vai trò thay đổi, hoặc khi initialFetchDone thay đổi để bắt đầu polling
}, [token, rolesLoaded, isAdmin, isStaff, fetchAdminNotifications, initialFetchDone]);

const handleMarkAdminNotificationRead = useCallback(async (orderId) => { 
    console.log("[MarkAsRead] Clicked on notification for order:", orderId);

    const notificationBeingMarked = adminNotifications.find(n => n.orderId === orderId);
    const wasUnread = notificationBeingMarked && notificationBeingMarked.read === false;
    console.log("[MarkAsRead] Notification found:", notificationBeingMarked); // Thêm log
    console.log("[MarkAsRead] Was unread:", wasUnread);

    // Cập nhật trạng thái isRead trong state ngay lập tức (Optimistic Update)
    setAdminNotifications(prev => prev.map(n =>
        (n.orderId === orderId) // Cập nhật tất cả notif có cùng orderId? Hoặc chỉ cái đầu tiên? Cẩn thận chỗ này
        ? { ...n, read: true } // Tạm đánh dấu đã đọc ở UI
        : n
    ));
    console.log("[MarkAsRead] Updated adminNotifications state (optimistic)");
    
    
    if (wasUnread) {
        // Chỉ giảm count nếu có ít nhất 1 notif chưa đọc cho orderId này
        // Logic giảm count có thể cần xem lại nếu có nhiều notif cho 1 order
         setUnreadAdminCount(prev => Math.max(0, prev - 1)); // Tạm giảm 1
         console.log("[MarkAsRead] Decremented count (optimistic)");
    }

    // Cập nhật số đếm chưa đọc (chỉ giảm nếu nó thực sự chưa đọc)
 

    // Lưu trạng thái đã đọc vào localStorage để duy trì qua các lần fetch polling
    const keyForStorage = notificationBeingMarked?.notificationId || orderId;
     const readNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
     readNotifications[keyForStorage] = true;
     localStorage.setItem('readAdminNotifications', JSON.stringify(readNotifications));
     console.log("[MarkAsRead] Updated localStorage for key:", keyForStorage);


    // Gọi API để cập nhật backend
    console.log("[MarkAsRead] Calling API PUT /api/notifications/admin/order/" + orderId + "/read");
     try {
        // *** GỌI ENDPOINT MỚI VỚI orderId ***
        const response = await fetch(`${API_BASE_URL}/api/notifications/admin/order/${orderId}/read`, {
             method: 'PUT',
             headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            console.error("[MarkAsRead] API Error:", response.status);
             // Có thể cần rollback optimistic update nếu API lỗi
             // Ví dụ: fetch lại hoặc set lại state read=false và tăng count
        } else {
             console.log("[MarkAsRead] API Success for order:", orderId);
             // Không cần làm gì, polling sẽ cập nhật
        }
     } catch (error) {
         console.error("[MarkAsRead] API Exception:", error);
     }
     // ...
}, [token, adminNotifications]);

    const handleLogout = () => {
        removeToken();
        localStorage.removeItem('readAdminNotifications'); // Xóa trạng thái đọc khi logout
    };

    const getFullAvatarUrl = (avatarPath) => {
        if (!avatarPath) return DEFAULT_AVATAR;
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:image')) return avatarPath;
        const relativePath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
        return `${API_BASE_URL}${relativePath}`;
    };
    const finalAvatarUrl = getFullAvatarUrl(avatar);

    const totalUnreadCount = (isAdmin || isStaff ? unreadAdminCount : 0) + (isCustomer && lastOrderSuccess.orderId ? 1 : 0);

    const handleDismissAdminNotification = (notificationId) => {
        console.log("Dismissing admin notification:", notificationId);
        setAdminNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadAdminCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className={style.Header_Parent}>
            <header className={style.Header}>
                <div className={style.Header_Icon}><div><a href='/'>COFFEE</a></div></div>

                <div className={style.Header_Shortcut}>
                    <ul>
                        <li className={style.Header_Notification}>
                            <Dropdown align="end">
                                
                            <Dropdown.Toggle variant="link" id="dropdown-notifications" className={`${style.NotificationToggle} p-0 border-0`}> 
                                    <div className="position-relative"> 
                                        <i className="bi bi-bell fs-4 text-dark"></i> 
                                        {totalUnreadCount > 0 && (
                                            <Badge
                                                pill bg="danger"
                                                className={`position-absolute top-0 start-100 translate-middle border border-light ${style.NotificationBadge}`}
                                            >
                                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className={`${style.NotificationMenu} shadow-lg`} /* style */>
                                <Dropdown.Header className="text-center text-muted small">Notifications</Dropdown.Header>
                                    <Dropdown.Divider/>

                                    <div className={style.NotificationContent}> 
                                        {loadingAdminNotifications && (isAdmin || isStaff) ? (
                                            <div className="text-center "><Spinner animation="border" size="sm" /></div>
                                        ) : notificationError ? (
                                            <div className="text-danger small px-3 py-2">{notificationError}</div>
                                        ) : (isAdmin || isStaff) ? (
                                            adminNotifications.length > 0 ? (
                                                adminNotifications.map(notif =>
                                                    <AdminNotificationItem
                                                        key={notif.id || notif.orderId}
                                                        notification={notif}
                                                        onMarkAsRead={handleMarkAdminNotificationRead}
                                                    />)
                                            ) : ( <Dropdown.ItemText className="text-center text-muted small py-3">No new notifications.</Dropdown.ItemText> )
                                        ) : isCustomer ? (
                                            lastOrderSuccess.orderId ? (
                                                <CustomerNotificationItem
                                                    orderId={lastOrderSuccess.orderId}
                                                    totalAmount={lastOrderSuccess.totalAmount}
                                                    onDismiss={clearLastOrderSuccess}
                                                />
                                            ) : ( <Dropdown.ItemText className="text-center text-muted small py-3">No new notifications.</Dropdown.ItemText> )
                                        ) : isAnonymous ? (
                                            <AnonymousNotificationItem />
                                        ) : ( <Dropdown.ItemText className="text-center text-muted small py-3">N/A</Dropdown.ItemText> )}
                                    </div>

                                    
                                    {((isAdmin || isStaff) && adminNotifications.length > 0) || (isCustomer && lastOrderSuccess.orderId) ? (
                                        <Dropdown.Divider className="mt-0 mb-0" />
                                    ) : null}
                                    {(isAdmin || isStaff) && adminNotifications.length > 0 && (
                                        <Dropdown.Item as={Link} to="/order_for_manager" className="text-center small py-2 text-primary fw-bold">View All Orders</Dropdown.Item>
                                    )}
                           
                                    {/* {isCustomer && (
                                        <Dropdown.Item as={Link} to="/list_order" className="text-center small py-2 text-primary fw-bold">View Order History</Dropdown.Item>
                                    )} */}
                                </Dropdown.Menu>

                            </Dropdown>
                        </li>

                        
                        <li className={style.Header_Card}>
                             <a href="/cart" className={style.Header_CardLink}>
                                <div className={style.CardIcon}><i className="bi bi-cart2 fs-4 text-dark"></i><span className={style.CartNumber}>{cart?.length || 0}</span></div>
                             </a>
                        </li>

                        <li className={style.Header_You}>
                             <img src={finalAvatarUrl} alt="Avatar" className={style.Header_Avatar_Image} onError={(e)=>{e.target.onerror=null; e.target.src=DEFAULT_AVATAR;}}/>
                             <div className={style.Header_Your_settings}>

                                {token ? (
                                    <ul>
                                        <li><a href='/update_user/'><p><i className="bi bi-gear"></i> Setting</p></a></li>
                                        <li><a href='/list_order'><p><i className="bi bi-list-ul"></i> My Orders</p></a></li>
                                        <li><p onClick={handleLogout} style={{ cursor: 'pointer' }}><i className="bi bi-box-arrow-left"></i> Log Out</p></li>
                                    </ul>
                                ) : (
                                    <ul>
                                        <li><p><a href="/login_register"><i className="bi bi-box-arrow-in-right"></i> Log in</a></p></li>
                                        <li><p><a href="/login_register"><i className="bi bi-person-plus-fill"></i> Register</a></p></li>
                                    </ul>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>
            </header>
        </div>
    );
}

function Header() { return <><HeaderTikTok /></>; }
export default Header;