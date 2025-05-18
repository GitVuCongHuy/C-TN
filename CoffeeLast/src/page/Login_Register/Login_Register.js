import React, { Suspense, useContext, useEffect, useState, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import Style from './Login_Register.module.css';
import { Mesh } from "three";
import { EXRLoader } from "three/examples/jsm/Addons.js";
import { a, useSpring } from "@react-spring/three";
import Context from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";

function SmoothCamera({ isLogin }) {
    const { camera } = useThree();

    const targetPosition = isLogin === 'login' ? [0, 0, 5] : isLogin === 'register' ? [1, 2, -5] : [1, 2, -5]; 
    const targetRotation = isLogin === 'login' ? [0, 0, 0] : isLogin === 'register' ? [-Math.PI / 1, Math.PI / 10, Math.PI / 1] : [-Math.PI / 1, Math.PI / 10, Math.PI / 1];


    const { position, rotation } = useSpring({
        position: targetPosition,
        rotation: targetRotation,
        config: { mass: 5, tension: 50, friction: 50 },
    });

    useFrame(() => {
        camera.position.set(...position.get());
        camera.rotation.set(...rotation.get());
        camera.lookAt(0, 0, 0);
    });

    return null;
}

function ShibaModel({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const { scene } = useGLTF("./obj/coffee/scene.gltf");
    const shibaScene = useMemo(() => scene.clone(), [scene]);

    shibaScene.rotation.set(rotation[0], rotation[1], rotation[2]);
    shibaScene.traverse((object) => {
        if (object instanceof Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            object.material.envMapIntensity = 60;
        }
    });

    return <primitive object={shibaScene} scale={0.04} position={position} />;
}

function RamdomCoffe({ Num }) {
    const [randomCoffees, setRandomCoffees] = useState([]);

    useEffect(() => {
        const coffees = [];
        for (let i = 0; i < Num; i++) {
            const randomX = (Math.random() * 6 - 2).toFixed(2);
            const randomY = (Math.random() * 6 - 0.5).toFixed(2);
            const randomZ = (Math.random() * 6 - 0.5).toFixed(2);
            const rotateX = (Math.random() * 6 - 2).toFixed(1);
            const rotateY = (Math.random() * 6 - 2).toFixed(1);
            const rotateZ = (Math.random() * 6 - 2).toFixed(1);

            coffees.push(
                <Coffe_bean
                    key={i}
                    position={[parseFloat(randomX), parseFloat(randomY), parseFloat(randomZ)]}
                    rotation={[parseFloat(rotateX), parseFloat(rotateY), parseFloat(rotateZ)]}
                />
            );
        }
        setRandomCoffees(coffees);
    }, [Num]);

    return <>{randomCoffees}</>;
}
function Coffe_bean({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const { scene } = useGLTF("./obj/coffee_bean_-_pbr/scene.gltf");
    const coffeeBeanScene = useMemo(() => scene.clone(), [scene]); 

    coffeeBeanScene.rotation.set(rotation[0], rotation[1], rotation[2]);
    coffeeBeanScene.traverse((object) => {
        if (object instanceof Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            object.material.envMapIntensity = 60;
        }
    });

    return <primitive object={coffeeBeanScene} scale={0.1} position={position} />;
}
function Canvas_Three_Js({ view }) { 
    return (
        <Suspense fallback={null}>
            <Canvas >
                <ambientLight intensity={0.5} />
                <directionalLight position={[0, 10, 5]} intensity={1.5} castShadow /> 
                <Environment
                    files="./hdri/empty_play_room_2k.exr" 
                    preset={null} 
                    background={false} 
                    loader={EXRLoader} 
                />
                <SmoothCamera isLogin={view} /> 

                <RamdomCoffe Num={50} />
                <ShibaModel position={[3, -1.8, 0]} rotation={[0, 0.2, 0.4]} />
            </Canvas>
        </Suspense>
    );
}
function Login({ showRegister, showForgotPassword }) { 

    const { token, saveToken } = useContext(Context);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const data = {
            username: username,
            password: password,
        };

        try {
            const response = await fetch('http://localhost:8082/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) { 
                const responseData = await response.json();
                const { token } = responseData;
                if (token == null) {
                    setError("Lỗi không nhận được token.");
                    return; 
                }
                saveToken(token);
                navigate('/');

            } else { 
                let errorMessage = `Lỗi ${response.status}: ${response.statusText || 'Unknown Error'}`;

                try {
                    const errorBodyText = await response.text();

                    if (errorBodyText) {
                        try {
                            const errorData = JSON.parse(errorBodyText);
                            if (errorData && errorData.message) {
                                errorMessage = errorData.message;
                            }
                            else {
                                errorMessage = errorBodyText; 
                            }
                        } catch (parseError) {
                            errorMessage = errorBodyText;
                        }
                    }

                } catch (readError) {
                    console.error("Không thể đọc nội dung response lỗi:", readError);
                }

                setError(errorMessage);
            }

        } catch (networkError) { 
            console.error("Login fetch network error:", networkError);
            setError('Lỗi kết nối mạng. Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${Style.Login} ${Style.Defaul}`}>
            <div>
                <div className={Style.Tite}>
                    <p>Log in</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={Style.Input}>
                        <span className={Style.Input_Icon} ><i className="bi bi-envelope-check-fill"></i></span>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            required
                            id="login-username"
                            placeholder=" "
                        />
                        <label htmlFor="login-username">Login Name</label>
                    </div>

                    <div className={`${Style.Input} ${error ? Style.has_error : ''}`}>
                        <span className={Style.Input_Icon} ><i className="bi bi-lock-fill"></i></span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            required
                            id="login-password"
                            placeholder=" "
                        />
                        <label htmlFor="login-password">Password</label>
                        {error && <span className={Style.Input_error_inline}>{error}</span>}
                    </div>

                    <div className={Style.Remember}>
                        <div></div>
                        <div><button type="button" onClick={showForgotPassword} className={Style.LinkButton}>Forgot Password?</button></div>
                    </div>

                    <div className={Style.Input_Button}>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>
                    </div>
                </form>
                <div className={Style.Input_No_account}>
                    <p>Don't have an account? <button onClick={showRegister} className={Style.LinkButton}>Register</button></p>
                </div>
            </div>
        </div>
    );
}


function Sign_in({ showLogin }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');

    // State riêng cho từng loại lỗi để hiển thị dưới input tương ứng
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState(''); // Lỗi cho confirm password và độ dài pass
    const [generalError, setGeneralError] = useState(''); // Lỗi chung

    const [loading, setLoading] = useState(false);

    const clearErrors = () => {
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearErrors();

        if (password !== confirmpassword) {
            setPasswordError("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        // Các kiểm tra frontend khác nếu cần (ví dụ: username không được trống, email hợp lệ)

        setLoading(true);

        const data = {
            username: username,
            password: password,
            email: email
        };

        try {
            const response = await fetch('http://localhost:8082/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const responseData = await response.json().catch(() => null);

            if (response.ok) {
                // Đăng ký thành công
                alert('Đăng Kí Thành Công! Vui lòng đăng nhập.');
                showLogin();
            } else {
                // Xử lý lỗi từ backend (response.status là 400 hoặc lỗi khác)
                const backendMessage = responseData?.message || ""; // Lấy message từ backend

                if (backendMessage) {
                    // Kiểm tra nội dung message để xác định lỗi cụ thể
                    if (backendMessage.toLowerCase().includes('username') && backendMessage.toLowerCase().includes('taken')) {
                        // Nếu message chứa "username" và "taken" (hoặc "tồn tại", "đã sử dụng" tùy theo message backend)
                        setUsernameError("Tên đăng nhập này đã tồn tại.");
                    } else if (backendMessage.toLowerCase().includes('email') && backendMessage.toLowerCase().includes('use')) {
                        // Nếu message chứa "email" và "in use" (hoặc "tồn tại", "đã sử dụng")
                        setEmailError("Địa chỉ email này đã được sử dụng.");
                    } else {
                        // Nếu không phải lỗi trùng username hay email cụ thể từ backend,
                        // nhưng vẫn là lỗi 400 (ví dụ: validation lỗi khác từ DTO mà bạn chưa xử lý)
                        // hoặc một lỗi chung nào đó từ backend
                        setGeneralError(backendMessage || "Đã có lỗi xảy ra trong quá trình đăng ký.");
                    }
                } else {
                    // Nếu không có responseData.message (ví dụ: lỗi mạng, server sập, response không phải JSON)
                    setGeneralError(`Lỗi ${response.status}: Đăng ký không thành công.`);
                }
            }

        } catch (networkError) {
            console.error("Register network error:", networkError);
            setGeneralError('Lỗi kết nối đến máy chủ! Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Phần JSX giữ nguyên như lần cập nhật trước, chỉ cần đảm bảo hiển thị đúng các state lỗi:
    // usernameError, emailError, passwordError, generalError
    return (
        <div className={`${Style.Login} ${Style.Defaul}`}>
            <div>
                <div className={Style.Tite}>
                    <p>REGISTER</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* --- Username Input --- */}
                    <div className={`${Style.Input} ${usernameError ? Style.has_error : ''}`}>
                        <span className={Style.Input_Icon}><i className="bi bi-person-fill"></i></span>
                        <input
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); clearErrors(); }} // Xóa lỗi khi người dùng nhập
                            type="text"
                            required
                            id="register-username"
                            placeholder=" "
                        />
                        <label htmlFor="register-username">Login Name</label>
                        {usernameError && <span className={Style.Input_error_inline}>{usernameError}</span>}
                    </div>

                    {/* --- Email Input --- */}
                    <div className={`${Style.Input} ${emailError ? Style.has_error : ''}`}>
                        <span className={Style.Input_Icon}><i className="bi bi-envelope-fill"></i></span>
                        <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); clearErrors(); }} // Xóa lỗi khi người dùng nhập
                            type="email"
                            required
                            id="register-email"
                            placeholder=" "
                        />
                        <label htmlFor="register-email">Email</label>
                        {emailError && <span className={Style.Input_error_inline}>{emailError}</span>}
                    </div>

                    {/* --- Password Input --- */}
                    <div className={`${Style.Input} ${passwordError.includes('6 ký tự') ? Style.has_error : ''}`}>
                        <span className={Style.Input_Icon}><i className="bi bi-lock-fill"></i></span>
                        <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); clearErrors(); }} // Xóa lỗi khi người dùng nhập
                            type="password"
                            required
                            id="register-password"
                            placeholder=" "
                        />
                        <label htmlFor="register-password">Password</label>
                         {passwordError.includes('6 ký tự') && <span className={Style.Input_error_inline}>{passwordError}</span>}
                    </div>

                    {/* --- Confirm Password Input --- */}
                    <div className={`${Style.Input} ${passwordError.includes('không khớp') ? Style.has_error : ''}`}>
                        <span className={Style.Input_Icon}><i className="bi bi-lock-fill"></i></span>
                        <input
                            value={confirmpassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); clearErrors(); }} // Xóa lỗi khi người dùng nhập
                            type="password"
                            required
                            id="register-confirm-password"
                            placeholder=" "
                        />
                        <label htmlFor="register-confirm-password">Re-enter Password</label>
                        {passwordError.includes('không khớp') && <span className={Style.Input_error_inline}>{passwordError}</span>}
                    </div>

                    {/* Hiển thị lỗi chung nếu có */}
                    {generalError && <p className={`${Style.Input_error} ${Style.MessageSpacing}` } style={{textAlign: 'center'}}>{generalError}</p>}


                    <div className={Style.Input_Button}>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
                <div className={Style.Input_No_account}>
                    <p>Already have an account? <button onClick={showLogin} className={Style.LinkButton}>Log in</button></p>
                </div>
            </div>
        </div>
    );
}

export default function Login_Register() {
    const [currentView, setCurrentView] = useState('login');

    const showLogin = () => setCurrentView('login');
    const showRegister = () => setCurrentView('register');
    const showForgotPassword = () => setCurrentView('forgotPassword');

    const getLoginClipPath = () => {
        if (currentView === 'login') return "inset(0 0 0 0)";
        return "inset(0 0 0 100%)";
    };

    const getRegisterClipPath = () => {
        if (currentView === 'register') return "inset(0 0 0 0)";
        return "inset(0 0 0 100%)";
    };

    const getForgotClipPath = () => {
        if (currentView === 'forgotPassword') return "inset(0 0 0 0)";
        return "inset(0 0 0 100%)";
    };

    const forgotPasswordStyle = {
        clipPath: getForgotClipPath(),
        transition: 'clip-path 0.7s ease-in-out, transform 0.7s ease-in-out',
        gridColumn: '1 / 2',
        gridRow: '1 / 2',
        zIndex: currentView === 'forgotPassword' ? 2 : 1,
        transform: currentView === 'forgotPassword' ? 'translateX(-30px)' : 'translateX(0)', 
    };

    return (
        <div className={Style.Container}>
            <div className={Style.Login_Register_Conten}>
                <div className={`${Style.Defaul_Layout}`}>
                    <div style={{
                        clipPath: getLoginClipPath(),
                        transition: 'clip-path 0.7s ease-in-out', 
                        gridColumn: '1 / 2',
                        gridRow: '1 / 2',
                        zIndex: currentView === 'login' ? 2 : 1
                    }}>
                        <Login showRegister={showRegister} showForgotPassword={showForgotPassword} />
                    </div>

                    <div style={{
                        clipPath: getRegisterClipPath(),
                        transition: 'clip-path 0.7s ease-in-out', 
                        gridColumn: '1 / 2',
                        gridRow: '1 / 2',
                        zIndex: currentView === 'register' ? 2 : 1
                    }}>
                        <Sign_in showLogin={showLogin} />
                    </div>

                    <div style={forgotPasswordStyle}> 
                        <ForgotPassword showLogin={showLogin} />
                    </div>
                </div>
            </div>
            <div className={Style.Login_Register_Canvas}>
                <Canvas_Three_Js view={currentView} />
            </div>
        </div>
    );
}

useGLTF.preload("./obj/coffee/scene.gltf");
useGLTF.preload("./obj/coffee_bean_-_pbr/scene.gltf");