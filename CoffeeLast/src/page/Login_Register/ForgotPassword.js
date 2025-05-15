import React, { useState } from 'react';
import Style from './Login_Register.module.css'; 

function ForgotPassword({ showLogin }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const endpoint = 'http://localhost:8082/user/request_password_reset';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                setMessage('Please check your email.');
                setEmail(''); 
            } else {
                try {
                    const errorData = await response.json();
                    if (response.status !== 404) {
                        setError(errorData.message || `Lỗi ${response.status}`);
                    } else {
                         setMessage('Please check your email.');
                    }
                } catch (jsonError){
                     setError(`Lỗi hệ thống hoặc không thể kết nối (${response.status})`);
                }

            }
        } catch (err) {
            console.error("Forgot Password error:", err);
            setError('Không thể gửi yêu cầu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${Style.Login} ${Style.Defaul}`}>
            <div>
                <div className={Style.Tite}>
                    <p>Password Recovery</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={Style.Input}>
                        <span className={Style.Input_Icon}><i className="bi bi-envelope-fill"></i></span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=" " 
                            required
                            id="forgot-email"
                        />
                        <label htmlFor="forgot-email">Enter your Email</label>
                    </div>

                    {message && <p className={Style.Input_success}>{message}</p>}
                    {error && <p className={Style.Input_error}>{error}</p>}

                    <div className={Style.Input_Button}>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
                <div className={Style.Input_No_account}>
                    <button onClick={showLogin} className={Style.LinkButton}>Back to Login</button>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword; 