import React, { useMemo, useState, useEffect, useContext, useCallback } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import style from './Header.module.css'; 
import Context from '../../../../Context/Context';
import { Dropdown, Badge, Spinner, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const API_BASE_URL = 'http://localhost:8082';
const DEFAULT_AVATAR = '/image/anhdaidien.jpg';

const formatDateTimeGlobal = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting date:", error);
        return '';
    }
};

const AdminNotificationItem = React.memo(({ notification, onMarkAsRead }) => {
    const navigate = useNavigate();

    const [isLocallyRead, setIsLocallyRead] = useState(() => {
        const readNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        // Ưu tiên trạng thái từ server (notification.isRead), sau đó là localStorage
        return notification.isRead || !!readNotifications[notification.orderId];
    });

    useEffect(() => {
        const readNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        setIsLocallyRead(notification.isRead || !!readNotifications[notification.orderId]);
    }, [notification.isRead, notification.orderId]);


    const handleClick = (e) => {
        e.preventDefault();
        if (!notification.isRead && !isLocallyRead) {
            onMarkAsRead(notification.orderId); 
        }

        setIsLocallyRead(true); // Optimistic update UI
        const readNotifications = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        readNotifications[notification.orderId] = true; // Admin dùng orderId làm key
        localStorage.setItem('readAdminNotifications', JSON.stringify(readNotifications));

        navigate('/order_for_manager');
    };

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
                        {notification.orderDate && <span className="ms-2">({formatDateTimeGlobal(notification.orderDate)})</span>}
                    </small>
                </div>
            </div>
        </Dropdown.Item>
    );
});

const CustomerOrderSuccessNotificationItem = React.memo(({ orderId, totalAmount, onDismiss }) => (
    <Dropdown.ItemText className={`${style.NotificationItem} ${style.CustomerNotification}`}>
        <div className="d-flex justify-content-between align-items-start">
            <div>
                <i className={`bi bi-check-circle-fill text-success me-2 ${style.CustomerIcon}`}></i>
                <span>Order <strong>#{orderId}</strong> placed!</span> <br />
                <small className="text-muted">Total: {totalAmount?.toLocaleString()} $</small> <br />
                <Link to="/list_order" className="small text-primary fw-bold" onClick={onDismiss}>View Details</Link>
            </div>
            <Button variant="close" size="sm" onClick={onDismiss} aria-label="Dismiss" className={style.DismissButton}></Button>
        </div>
    </Dropdown.ItemText>
));

const OrderStatusUpdateNotificationItem = React.memo(({ notification, onMarkAsRead, onNavigate }) => {
    const [isLocallyRead, setIsLocallyRead] = useState(() => {
        const readNotifications = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
        return notification.isRead || !!readNotifications[notification.notificationId];
    });
     useEffect(() => {
        const readNotifications = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
        setIsLocallyRead(notification.isRead || !!readNotifications[notification.notificationId]);
    }, [notification.isRead, notification.notificationId]);


    const handleClick = (e) => {
        e.preventDefault();
        if (!notification.isRead && !isLocallyRead) {
            onMarkAsRead(notification.notificationId); 
        }
        setIsLocallyRead(true);
        const readNotifications = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
        readNotifications[notification.notificationId] = true;
        localStorage.setItem('readCustomerNotifications', JSON.stringify(readNotifications));
        onNavigate();
    };

    return (
        <Dropdown.Item
            as="a"
            href={`/list_order`} 
            onClick={handleClick}
            className={`${style.NotificationItem} ${!isLocallyRead ? style.UnreadNotification : style.ReadNotification}`}
            title={notification.message}
        >
            <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1 me-2">
                    <div>
                        {!isLocallyRead && <i className={`bi bi-circle-fill text-primary me-1 ${style.UnreadDot}`}></i>}
                        <i className={`bi bi-box-seam-fill text-info me-2 ${style.CustomerIcon}`}></i> 
                        <span>{notification.message}</span>
                    </div>
                    <small className="text-muted d-block mt-1">
                        {notification.createdAt && <span>{formatDateTimeGlobal(notification.createdAt)}</span>}
                    </small>
                </div>
            </div>
        </Dropdown.Item>
    );
});

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
    const navigate = useNavigate();

    const [rolesLoaded, setRolesLoaded] = useState(false);

    const [adminNotifications, setAdminNotifications] = useState([]);
    const [unreadAdminCount, setUnreadAdminCount] = useState(0);
    const [loadingAdminNotifications, setLoadingAdminNotifications] = useState(false);
    const [adminNotificationError, setAdminNotificationError] = useState(null); // Đổi tên error state
    const [initialAdminFetchDone, setInitialAdminFetchDone] = useState(false);

    const [customerStatusNotifications, setCustomerStatusNotifications] = useState([]);
    const [unreadCustomerStatusCount, setUnreadCustomerStatusCount] = useState(0);
    const [loadingCustomerStatusNotifications, setLoadingCustomerStatusNotifications] = useState(false);
    const [customerStatusNotificationError, setCustomerStatusNotificationError] = useState(null);
    const [initialCustomerStatusFetchDone, setInitialCustomerStatusFetchDone] = useState(false);

    useEffect(() => {
        if (roles && Array.isArray(roles)) {
            setRolesLoaded(true);
        } else {
            setRolesLoaded(false);
        }
    }, [roles]);

    const hasRole = useCallback((roleName) => {
        if (!rolesLoaded) return false;
        return roles.some((role) => role?.role?.roleName === roleName);
    }, [roles, rolesLoaded]);

    const isAdmin = useMemo(() => hasRole('DIRECTOR'), [hasRole]);
    const isStaff = useMemo(() => hasRole('EMPLOYEE'), [hasRole]);
    const isCustomer = useMemo(() => token && rolesLoaded && !isAdmin && !isStaff, [token, rolesLoaded, isAdmin, isStaff]);
    const isAnonymous = useMemo(() => !token, [token]);

    const fetchAdminNotifications = useCallback(async (isInitialLoad = false) => {
        if (!token || !rolesLoaded || (!isAdmin && !isStaff)) {
            if (!initialAdminFetchDone) setInitialAdminFetchDone(true);
            setAdminNotifications([]);
            setUnreadAdminCount(0);
            setAdminNotificationError(null);
            return;
        }
        if (isInitialLoad || adminNotifications.length === 0) {
            setLoadingAdminNotifications(true);
        }
        setAdminNotificationError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed Admin Notif: ${response.status}`);
            const data = await response.json();
            const notifications = Array.isArray(data) ? data : [];

            const readAdminNotificationsStorage = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
            const updatedNotifications = notifications.map(n => ({
                ...n,
                isRead: n.isRead || !!readAdminNotificationsStorage[n.orderId] 
            }));
            const count = updatedNotifications.filter(n => !n.isRead).length;

            setAdminNotifications(updatedNotifications);
            setUnreadAdminCount(count);
        } catch (error) {
            console.error("Error fetching admin notifications:", error);
            setAdminNotificationError(error.message || "Could not load admin notifications.");
        } finally {
            setLoadingAdminNotifications(false);
            if (!initialAdminFetchDone) setInitialAdminFetchDone(true);
        }
    }, [token, rolesLoaded, isAdmin, isStaff, adminNotifications.length, initialAdminFetchDone]);

    useEffect(() => {
        let isMounted = true;
        let adminIntervalId = null;
        const runFetch = async () => {
            if (isMounted) await fetchAdminNotifications(adminNotifications.length === 0);
        };

        if (token && rolesLoaded) {
            if (isAdmin || isStaff) {
                runFetch();
                const checkAndStartPolling = () => {
                    if (isMounted && initialAdminFetchDone) {
                        adminIntervalId = setInterval(() => fetchAdminNotifications(false), 15000);
                    } else if (isMounted) {
                        setTimeout(checkAndStartPolling, 500);
                    }
                };
                checkAndStartPolling();
            } else {
                setAdminNotifications([]); setUnreadAdminCount(0); setAdminNotificationError(null); if(!initialAdminFetchDone) setInitialAdminFetchDone(true);
            }
        } else if (!token) {
             setAdminNotifications([]); setUnreadAdminCount(0); setAdminNotificationError(null); if(!initialAdminFetchDone) setInitialAdminFetchDone(true);
        } else {
            setInitialAdminFetchDone(false);
        }
        return () => { isMounted = false; if (adminIntervalId) clearInterval(adminIntervalId); };
    }, [token, rolesLoaded, isAdmin, isStaff, fetchAdminNotifications, initialAdminFetchDone, adminNotifications.length]);

    const handleMarkAdminNotificationRead = useCallback(async (orderId) => {
        const notificationBeingMarked = adminNotifications.find(n => n.orderId === orderId);
        const wasUnread = notificationBeingMarked && !notificationBeingMarked.isRead;

        setAdminNotifications(prev => prev.map(n => (n.orderId === orderId) ? { ...n, isRead: true } : n));
        if (wasUnread) setUnreadAdminCount(prev => Math.max(0, prev - 1));

        const readStorage = JSON.parse(localStorage.getItem('readAdminNotifications') || '{}');
        readStorage[orderId] = true;
        localStorage.setItem('readAdminNotifications', JSON.stringify(readStorage));

        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/admin/order/${orderId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) console.error("[AdminMarkAsRead] API Error:", response.status);
        } catch (error) {
            console.error("[AdminMarkAsRead] API Exception:", error);
        }
    }, [token, adminNotifications]);


    const fetchCustomerStatusNotifications = useCallback(async (isInitialLoad = false) => {
        if (!token || !isCustomer) {
            if (!initialCustomerStatusFetchDone) setInitialCustomerStatusFetchDone(true);
            setCustomerStatusNotifications([]);
            setUnreadCustomerStatusCount(0);
            setCustomerStatusNotificationError(null);
            return;
        }
        if (isInitialLoad || customerStatusNotifications.length === 0) {
            setLoadingCustomerStatusNotifications(true);
        }
        setCustomerStatusNotificationError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/customer`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Failed Customer Notif: ${response.status}`);
            const data = await response.json();
            const notifications = Array.isArray(data) ? data : [];

            const readCustomerNotificationsStorage = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
            const updatedNotifications = notifications.map(n => ({
                ...n,
                isRead: n.isRead || !!readCustomerNotificationsStorage[n.notificationId]
            }));

            const count = updatedNotifications.filter(n => !n.isRead).length;

            setCustomerStatusNotifications(updatedNotifications);
            setUnreadCustomerStatusCount(count);
        } catch (error) {
            console.error("Error fetching customer status notifications:", error);
            setCustomerStatusNotificationError(error.message || "Could not load customer status notifications.");
        } finally {
            setLoadingCustomerStatusNotifications(false);
            if (!initialCustomerStatusFetchDone) setInitialCustomerStatusFetchDone(true);
        }
    }, [token, isCustomer, customerStatusNotifications.length, initialCustomerStatusFetchDone]);

    useEffect(() => {
        let isMounted = true;
        let customerIntervalId = null;
        const runCustomerFetch = async () => {
            if (isMounted && isCustomer) await fetchCustomerStatusNotifications(customerStatusNotifications.length === 0);
        };

        if (token && rolesLoaded) {
            if (isCustomer) {
                runCustomerFetch();
                const checkAndStartCustomerPolling = () => {
                    if (isMounted && initialCustomerStatusFetchDone && isCustomer) {
                        customerIntervalId = setInterval(() => fetchCustomerStatusNotifications(false), 20000);
                    } else if (isMounted && isCustomer) {
                        setTimeout(checkAndStartCustomerPolling, 500);
                    }
                };
                checkAndStartCustomerPolling();
            } else {
                 setCustomerStatusNotifications([]); setUnreadCustomerStatusCount(0); setCustomerStatusNotificationError(null); if(!initialCustomerStatusFetchDone) setInitialCustomerStatusFetchDone(true);
            }
        } else if (!token) {
            setCustomerStatusNotifications([]); setUnreadCustomerStatusCount(0); setCustomerStatusNotificationError(null); if(!initialCustomerStatusFetchDone) setInitialCustomerStatusFetchDone(true);
        } else {
            setInitialCustomerStatusFetchDone(false);
        }
        return () => { isMounted = false; if (customerIntervalId) clearInterval(customerIntervalId); };
    }, [token, rolesLoaded, isCustomer, fetchCustomerStatusNotifications, initialCustomerStatusFetchDone, customerStatusNotifications.length]);

    const handleMarkCustomerStatusNotificationRead = useCallback(async (notificationId) => {
        const notificationBeingMarked = customerStatusNotifications.find(n => n.notificationId === notificationId);
        const wasUnread = notificationBeingMarked && !notificationBeingMarked.isRead;

        setCustomerStatusNotifications(prev => prev.map(n => (n.notificationId === notificationId) ? { ...n, isRead: true } : n));
        if (wasUnread) setUnreadCustomerStatusCount(prev => Math.max(0, prev - 1));

        const readStorage = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
        readStorage[notificationId] = true;
        localStorage.setItem('readCustomerNotifications', JSON.stringify(readStorage));

        try {
            const response = await fetch(`${API_BASE_URL}/api/notifications/customer/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error("[CustomerMarkAsRead] API Error:", response.status);
                if (wasUnread) {
                    setCustomerStatusNotifications(prev => prev.map(n => (n.notificationId === notificationId) ? { ...notificationBeingMarked } : n)); 
                    setUnreadCustomerStatusCount(prev => prev + 1);
                    const currentRead = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
                    delete currentRead[notificationId];
                    localStorage.setItem('readCustomerNotifications', JSON.stringify(currentRead));
                }
            }
        } catch (error) {
            console.error("[CustomerMarkAsRead] API Exception:", error);
             if (wasUnread) { 
                setCustomerStatusNotifications(prev => prev.map(n => (n.notificationId === notificationId) ? { ...notificationBeingMarked } : n));
                setUnreadCustomerStatusCount(prev => prev + 1);
                const currentRead = JSON.parse(localStorage.getItem('readCustomerNotifications') || '{}');
                delete currentRead[notificationId];
                localStorage.setItem('readCustomerNotifications', JSON.stringify(currentRead));
            }
        }
    }, [token, customerStatusNotifications]);

    const handleNavigateToOrderList = useCallback(() => {
        navigate('/list_order');
    }, [navigate]);

    const handleLogout = () => {
        removeToken();
        localStorage.removeItem('readAdminNotifications');
        localStorage.removeItem('readCustomerNotifications');
        setAdminNotifications([]);
        setUnreadAdminCount(0);
        setCustomerStatusNotifications([]);
        setUnreadCustomerStatusCount(0);
        setInitialAdminFetchDone(false);
        setInitialCustomerStatusFetchDone(false);
        clearLastOrderSuccess(); 
    };

    const getFullAvatarUrl = (avatarPath) => {
        if (!avatarPath) return DEFAULT_AVATAR;
        if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:image')) return avatarPath;
        const relativePath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
        return `${API_BASE_URL}${relativePath}`;
    };
    const finalAvatarUrl = getFullAvatarUrl(avatar);

    const totalUnreadCount = useMemo(() => {
        let count = 0;
        if (isAdmin || isStaff) {
            count += unreadAdminCount;
        }
        if (isCustomer) {
            if (lastOrderSuccess.orderId) {
                count += 1;
            }
            count += unreadCustomerStatusCount; 
        }
        return count;
    }, [isAdmin, isStaff, unreadAdminCount, isCustomer, lastOrderSuccess.orderId, unreadCustomerStatusCount]);


    const showCustomerNotificationsArea = isCustomer && (lastOrderSuccess.orderId || customerStatusNotifications.length > 0 || loadingCustomerStatusNotifications || customerStatusNotificationError);
    const noAdminNotifications = !loadingAdminNotifications && !adminNotificationError && adminNotifications.length === 0;
    const noCustomerSuccessNotification = !lastOrderSuccess.orderId;
    const noCustomerStatusNotifications = !loadingCustomerStatusNotifications && !customerStatusNotificationError && customerStatusNotifications.length === 0;


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
                                <Dropdown.Menu className={`${style.NotificationMenu} shadow-lg`}>
                                    <Dropdown.Header className="text-center text-muted small">Notifications</Dropdown.Header>
                                    <Dropdown.Divider />
                                    <div className={style.NotificationContent}>
                                        {/* Admin Notifications */}
                                        {(isAdmin || isStaff) && (
                                            loadingAdminNotifications ? (
                                                <div className="text-center p-2"><Spinner animation="border" size="sm" /></div>
                                            ) : adminNotificationError ? (
                                                <div className="text-danger small px-3 py-2">{adminNotificationError}</div>
                                            ) : adminNotifications.length > 0 ? (
                                                adminNotifications.map(notif =>
                                                    <AdminNotificationItem
                                                        key={`admin-${notif.orderId}`} 
                                                        notification={notif}
                                                        onMarkAsRead={handleMarkAdminNotificationRead}
                                                    />)
                                            ) : (
                                                <Dropdown.ItemText className="text-center text-muted small py-3">No new admin notifications.</Dropdown.ItemText>
                                            )
                                        )}

                                        {isCustomer && (
                                            <>
                                                {lastOrderSuccess.orderId && (
                                                    <CustomerOrderSuccessNotificationItem
                                                        key="customer-last-order-success"
                                                        orderId={lastOrderSuccess.orderId}
                                                        totalAmount={lastOrderSuccess.totalAmount}
                                                        onDismiss={() => {
                                                            clearLastOrderSuccess();
                                                        }}
                                                    />
                                                )}

                                                {loadingCustomerStatusNotifications && customerStatusNotifications.length === 0 && (
                                                    <div className="text-center p-2"><Spinner animation="border" size="sm" /></div>
                                                )}
                                                {customerStatusNotificationError && customerStatusNotifications.length === 0 && (
                                                     <div className="text-danger small px-3 py-2">{customerStatusNotificationError}</div>
                                                )}
                                                {customerStatusNotifications.length > 0 && (
                                                    customerStatusNotifications.map(notif =>
                                                        <OrderStatusUpdateNotificationItem
                                                            key={`customer-status-${notif.notificationId}`}
                                                            notification={notif}
                                                            onMarkAsRead={handleMarkCustomerStatusNotificationRead}
                                                            onNavigate={handleNavigateToOrderList}
                                                        />)
                                                )}
                                                
                                                {!lastOrderSuccess.orderId && customerStatusNotifications.length === 0 && !loadingCustomerStatusNotifications && !customerStatusNotificationError && (
                                                    <Dropdown.ItemText className="text-center text-muted small py-3">You have no new notifications.</Dropdown.ItemText>
                                                )}
                                            </>
                                        )}
                                        
                                        {isAnonymous && <AnonymousNotificationItem />}

                                        {!(isAdmin || isStaff) && !isCustomer && !isAnonymous && (
                                            <Dropdown.ItemText className="text-center text-muted small py-3">N/A</Dropdown.ItemText>
                                        )}
                                    </div>

                                    {((isAdmin || isStaff) && adminNotifications.length > 0) ||
                                     (isCustomer && (lastOrderSuccess.orderId || customerStatusNotifications.length > 0)) ? (
                                        <Dropdown.Divider className="mt-0 mb-0" />
                                    ) : null}

                                    {(isAdmin || isStaff) && adminNotifications.length > 0 && (
                                        <Dropdown.Item as={Link} to="/order_for_manager" className="text-center small py-2 text-primary fw-bold">View All Orders</Dropdown.Item>
                                    )}
                                    {isCustomer && (lastOrderSuccess.orderId || customerStatusNotifications.length > 0) && (
                                        <Dropdown.Item as={Link} to="/list_order" className="text-center small py-2 text-primary fw-bold">View My Orders</Dropdown.Item>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        </li>
                        <li className={style.Header_Card}>
                            <a href="/cart" className={style.Header_CardLink}>
                                <div className={style.CardIcon}><i className="bi bi-cart2 fs-4 text-dark"></i><span className={style.CartNumber}>{cart?.length || 0}</span></div>
                            </a>
                        </li>
                        <li className={style.Header_You}>
                            <img src={finalAvatarUrl} alt="Avatar" className={style.Header_Avatar_Image} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }} />
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