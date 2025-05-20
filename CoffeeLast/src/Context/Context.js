import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Spinner } from 'react-bootstrap'; // Import Spinner nếu dùng

const Context = createContext();

// --- Config ---
const API_BASE_URL = 'http://localhost:8082'; // Đảm bảo đúng port backend

export const ContextProvider = ({ children }) => {
    // --- State ---
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [roles, setRoles] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [lastOrderSuccess, setLastOrderSuccess] = useState(() => {
        const saved = sessionStorage.getItem('lastOrderSuccess');
        return saved ? JSON.parse(saved) : { orderId: null, totalAmount: null };
    });
     const [userInfo, setUserInfo] = useState(null); // Thêm state cho userInfo nếu cần dùng ở nhiều nơi

    // --- Lưu/Xóa state vào Storage ---
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log("Cart updated in localStorage:", cart); // Log để kiểm tra
    }, [cart]);

    useEffect(() => {
        if (lastOrderSuccess.orderId !== null) {
            sessionStorage.setItem('lastOrderSuccess', JSON.stringify(lastOrderSuccess));
        } else {
            sessionStorage.removeItem('lastOrderSuccess');
        }
    }, [lastOrderSuccess]);

    // --- Cart Functions ---
    const addToCart = (productData, quantity = 1) => {
        // QUAN TRỌNG: Đảm bảo 'productData' có thuộc tính 'productId' (hoặc 'id')
        // Nếu sản phẩm gốc của bạn có 'id' thay vì 'productId', hãy điều chỉnh ở đây:
        // const productId = productData.productId || productData.id;
        // if (!productId) {
        //     console.error("Product data is missing a unique ID (productId or id):", productData);
        //     return; // Không thêm vào giỏ nếu không có ID
        // }

        setCart(prevCart => {
            // Sử dụng productId đã chuẩn hóa
            const existingItemIndex = prevCart.findIndex(item => item.productId === (productData.productId || productData.id));

            if (existingItemIndex > -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            } else {
                // Khi thêm mới, item trong giỏ hàng phải có 'productId'
                // và các thông tin cần thiết như name, price, img, và Ckeck
                return [
                    ...prevCart,
                    {
                        // Sao chép tất cả thuộc tính từ productData
                        ...productData,
                        // Đảm bảo có productId, nếu productData dùng tên khác (ví dụ: id) thì gán lại
                        productId: productData.productId || productData.id, // <<<< QUAN TRỌNG
                        quantity: quantity,
                        Ckeck: true, // Mặc định chọn khi thêm vào giỏ (bạn đang dùng Ckeck)
                        // img: productData.img || 'default-image-path.jpg' // Đảm bảo có img
                    }
                ];
            }
        });
        console.log(`Added to cart: ${productData.name}, quantity: ${quantity}`);
    };

    const removeFromCart = (productIdToRemove) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productIdToRemove));
        console.log("Removed from cart, productId:", productIdToRemove);
    };

    const updateQuantity = (productIdToUpdate, newQuantity) => {
        if (newQuantity < 1) return; // Không cho số lượng < 1
        setCart(prevCart =>
            prevCart.map(item =>
                item.productId === productIdToUpdate
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
        console.log(`Updated quantity for productId ${productIdToUpdate} to ${newQuantity}`);
    };

    const clearCart = useCallback(() => {
        setCart([]);
        // localStorage sẽ tự động cập nhật nhờ useEffect ở trên
        console.log("Cart cleared from context and localStorage");
    }, []); // Thêm useCallback nếu không có dependency

    const removeItemsByIds = useCallback((itemIdsToRemove) => {
        if (!Array.isArray(itemIdsToRemove) || itemIdsToRemove.length === 0) {
            return;
        }
        setCart(prevCart => prevCart.filter(item => !itemIdsToRemove.includes(item.productId)));
        console.log("Items removed from cart by IDs:", itemIdsToRemove);
    }, []); // Thêm useCallback

    // --- Auth & User Profile Functions ---
    const saveToken = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const clearLastOrderSuccess = useCallback(() => {
        sessionStorage.removeItem('lastOrderSuccess');
        setLastOrderSuccess({ orderId: null, totalAmount: null });
    }, []);

    const removeToken = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('avatar'); // Avatar được lưu ở localStorage hay chỉ state?
        sessionStorage.removeItem('lastOrderSuccess');
        // Quan trọng: Xóa cả giỏ hàng khi logout nếu bạn muốn
        // clearCart(); // Bỏ comment dòng này nếu muốn xóa giỏ hàng khi logout

        setToken(null);
        setAvatar(null);
        setRoles([]);
        setUserInfo(null); // Reset userInfo
        setLastOrderSuccess({ orderId: null, totalAmount: null });
        console.log("Token and related user state cleared.");
    }, [clearCart]); // Thêm clearCart vào dependency nếu bạn gọi nó ở đây

    const verifyToken = useCallback(async (currentToken) => {
        if (!currentToken) return false;
        try {
            const response = await fetch(`${API_BASE_URL}/token/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken }),
            });
            if (!response.ok) {
                console.warn(`Token verification failed (server status: ${response.status}) for token: ${currentToken.substring(0, 20)}...`);
                return false;
            }
            const data = await response.json(); // Server trả về { "valid": true/false }
            if (typeof data.valid === 'boolean' && !data.valid) {
                console.warn(`Token verification failed (server response: invalid) for token: ${currentToken.substring(0, 20)}...`);
                return false;
            }
            // Nếu server không trả về cấu trúc { "valid": ...} mà chỉ trả về true/false trực tiếp
            // thì if (!data) return false; (sau khi const data = await response.json();)

            // Kiểm tra hết hạn phía client (thêm một lớp bảo vệ)
            const decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
            if (decodedToken.exp * 1000 <= Date.now()) {
                 console.warn(`Token expired (client-side check) for token: ${currentToken.substring(0, 20)}...`);
                 return false;
            }
            console.log(`Token verified successfully (client & server) for token: ${currentToken.substring(0, 20)}...`);
            return true;
        } catch (error) {
            console.error("Error verifying token:", error);
            return false;
        }
    }, []);

    const fetchUserProfile = useCallback(async (currentToken) => {
        console.log("Attempting to fetch user profile...");
        try {
            const response = await fetch(`${API_BASE_URL}/api/user_data/profile`, {
                method: "GET",
                headers: { 'Authorization': `Bearer ${currentToken}` },
            });
            if (!response.ok) {
                // Nếu là 401 hoặc 403, có thể token đã hết hạn hoặc không hợp lệ ở server
                if (response.status === 401 || response.status === 403) {
                    console.warn(`Auth error fetching profile (Status: ${response.status}). Token might be invalid/expired on server.`);
                    removeToken(); // Xóa token nếu server từ chối
                    return null;
                }
                throw new Error(`Failed profile fetch (Status: ${response.status})`);
            }
            const userData = await response.json();
            console.log("User profile fetched:", userData);
            setUserInfo(userData); // Cập nhật userInfo state
            setAvatar(userData.img || null);
            return userData;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setAvatar(null);
            setUserInfo(null);
            return null;
        }
    }, [removeToken]); // Thêm removeToken vào dependency

    const fetchRoles = useCallback(async (currentToken) => {
        console.log("Attempting to fetch user roles...");
        try {
            const response = await fetch(`${API_BASE_URL}/api/user_data/get_role`, {
                method: "POST", // Backend nên là GET
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
            });
            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                    console.warn(`Auth error fetching roles (Status: ${response.status}). Token might be invalid/expired on server.`);
                    // Không gọi removeToken ở đây để tránh gọi 2 lần nếu fetchUserProfile cũng lỗi
                    setRoles([]);
                    return;
                }
                throw new Error(`Failed role fetch (Status: ${response.status})`);
            }
            const roleData = await response.json();
            console.log("User roles fetched:", roleData);
            setRoles(Array.isArray(roleData) ? roleData : []); // Đảm bảo là mảng
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]);
        }
    }, []);

    // --- useEffect Khởi tạo Chính ---
    useEffect(() => {
        const initialize = async () => {
            setIsInitializing(true);
            console.log("Context initializing...");
            const currentToken = localStorage.getItem('token');

            if (currentToken) {
                console.log("Token found in localStorage. Verifying...");
                const isTokenValid = await verifyToken(currentToken);
                if (isTokenValid) {
                    console.log("Token is valid. Setting token state and fetching user data...");
                    setToken(currentToken); // Quan trọng: set token state trước khi fetch
                    await Promise.all([
                        fetchUserProfile(currentToken),
                        fetchRoles(currentToken)
                    ]);
                } else {
                    console.log("Token verification failed. Removing token and resetting user state.");
                    removeToken();
                }
            } else {
                console.log("No token found in localStorage. Initializing with no user.");
                 setToken(null); // Đảm bảo token state là null
                 setAvatar(null);
                 setRoles([]);
                 setUserInfo(null);
            }
            setIsInitializing(false);
            console.log("Context initialization finished.");
        };
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần khi component mount, các hàm bên trong đã có useCallback

    // --- Context Value ---
    const contextValue = {
        cart, setCart, addToCart, removeFromCart, updateQuantity, clearCart, removeItemsByIds, // Các hàm giỏ hàng
        token, saveToken, removeToken, // Các hàm token
        roles, setRoles, // Thêm setRoles nếu cần từ bên ngoài
        avatar, setAvatar, // Thêm setAvatar nếu cần từ bên ngoài
        userInfo, setUserInfo, // userInfo và setter của nó
        isInitializing,
        lastOrderSuccess, setLastOrderSuccess, clearLastOrderSuccess
    };

    return (
        <Context.Provider value={contextValue}>
            {isInitializing ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                    <Spinner animation="grow" variant="primary" style={{width: '3rem', height: '3rem'}}/>
                    <p className="mt-3 text-muted">Loading Application Data...</p>
                </div>
            ) : (
                children
            )}
        </Context.Provider>
    );
};

export default Context;