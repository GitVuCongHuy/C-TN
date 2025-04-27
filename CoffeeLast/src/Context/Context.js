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
    const [avatar, setAvatar] = useState(null); // Khởi tạo là null
    const [isInitializing, setIsInitializing] = useState(true); // Trạng thái khởi tạo
    const [lastOrderSuccess, setLastOrderSuccess] = useState(() => {
        const saved = sessionStorage.getItem('lastOrderSuccess'); // Dùng sessionStorage
        return saved ? JSON.parse(saved) : { orderId: null, totalAmount: null };
    });

    // --- Lưu/Xóa state vào Storage ---
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (lastOrderSuccess.orderId !== null) {
            sessionStorage.setItem('lastOrderSuccess', JSON.stringify(lastOrderSuccess));
        } else {
            sessionStorage.removeItem('lastOrderSuccess');
        }
    }, [lastOrderSuccess]);

    // --- Functions ---
    const saveToken = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // Fetch profile/roles sẽ được trigger bởi useEffect chính
    };

    const clearLastOrderSuccess = useCallback(() => {
        sessionStorage.removeItem('lastOrderSuccess');
        setLastOrderSuccess({ orderId: null, totalAmount: null });
    }, []);

    const removeToken = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('avatar'); // Có thể không cần nếu luôn fetch
        sessionStorage.removeItem('lastOrderSuccess');
        setToken(null);
        setAvatar(null);
        setRoles([]);
        setLastOrderSuccess({ orderId: null, totalAmount: null });
        console.log("Token and related user state cleared.");
    }, [clearLastOrderSuccess]); // Include clearLastOrderSuccess if needed, but it's stable

    const verifyToken = useCallback(async (currentToken) => {
        if (!currentToken) return false;
        try {
            const response = await fetch(`${API_BASE_URL}/token/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: currentToken }),
            });
            if (!response.ok) return false; // Lỗi server hoặc 4xx
            const isValid = await response.json();
            if (!isValid) return false; // Server bảo không hợp lệ

            const decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
            if (decodedToken.exp * 1000 <= Date.now()) {
                 console.error("Token expired (client-side).");
                 return false; // Hết hạn phía client
            }
            return true; // Hợp lệ
        } catch (error) {
            console.error("Error verifying token:", error);
            return false; // Lỗi -> không hợp lệ
        }
    }, []);

    const fetchUserProfile = useCallback(async (currentToken) => {
        console.log("Attempting to fetch user profile...");
        try {
            const response = await fetch(`${API_BASE_URL}/api/user_data/profile`, {
                method: "GET",
                headers: { 'Authorization': `Bearer ${currentToken}` },
            });
            if (!response.ok) throw new Error(`Failed profile fetch (Status: ${response.status})`);
            const userData = await response.json();
            console.log("User profile fetched:", userData);
            setAvatar(userData.img || null); // Cập nhật avatar state
            return userData;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setAvatar(null); // Reset nếu lỗi
            return null;
        }
    }, []);

    const fetchRoles = useCallback(async (currentToken) => {
        console.log("Attempting to fetch user roles...");
        try {
            const response = await fetch(`${API_BASE_URL}/api/user_data/get_role`, {
                method: "POST", // Nên đổi sang GET ở backend nếu có thể
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                 // body: JSON.stringify({}) // Có thể cần nếu là POST
            });
            if (!response.ok) throw new Error(`Failed role fetch (Status: ${response.status})`);
            const roleData = await response.json();
            console.log("User roles fetched:", roleData);
            setRoles(roleData || []); // Đảm bảo là mảng
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]); // Reset nếu lỗi
        }
    }, []);

    // --- useEffect Khởi tạo Chính ---
    useEffect(() => {
        const initialize = async () => {
            setIsInitializing(true);
            console.log("Context initializing...");
            const currentToken = localStorage.getItem('token');

            if (currentToken) {
                console.log("Verifying token...");
                const isTokenValid = await verifyToken(currentToken);
                if (isTokenValid) {
                    console.log("Token valid. Fetching user data...");
                    setToken(currentToken); // Ensure token state is set
                    // Fetch song song
                    await Promise.all([
                        fetchUserProfile(currentToken),
                        fetchRoles(currentToken)
                    ]);
                } else {
                    console.log("Token invalid/expired. Removing.");
                    removeToken(); // Quan trọng: gọi hàm đã useCallback
                }
            } else {
                console.log("No token found.");
                 setAvatar(null); // Đảm bảo reset
                 setRoles([]);
            }
            setIsInitializing(false);
            console.log("Context initialization finished.");
        };
        initialize();
    }, [verifyToken, fetchUserProfile, fetchRoles, removeToken]); // Dependencies là các hàm đã useCallback


    // --- Context Value ---
    const contextValue = {
        cart, setCart,
        token, saveToken, removeToken,
        roles,
        avatar, setAvatar,
        isInitializing,
        lastOrderSuccess, setLastOrderSuccess, clearLastOrderSuccess
    };

    return (
        <Context.Provider value={contextValue}>
            {isInitializing ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading Application...</span>
                    </Spinner>
                </div>
            ) : (
                children
            )}
        </Context.Provider>
    );
};

export default Context;