import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei"; 
import { Mesh } from "three";
import { EXRLoader } from "three/examples/jsm/Addons.js"; 
import { a, useSpring } from "@react-spring/three"; 

import Style from './Login_Register.module.css';


function SmoothCameraReset({ targetView = 'reset' }) { 
    const { camera } = useThree();

    const targetPosition = [0, 0, 5]; 
    const targetRotation = [0, 0, 0]; 

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
    const { scene } = useGLTF("/obj/coffee/scene.gltf"); 
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
    const { scene } = useGLTF("/obj/coffee_bean_-_pbr/scene.gltf"); 
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

function Canvas_Three_Js_ResetPage() {
    return (
        <Suspense fallback={null}>
            <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[0, 10, 5]} intensity={1.5} castShadow />
                <Environment
                    files="/hdri/empty_play_room_2k.exr" 
                    preset={null}
                    background={false}
                    loader={EXRLoader}
                />
                <SmoothCameraReset targetView={'reset'} /> 
                <RamdomCoffe Num={50} />
                <ShibaModel position={[3, -1.8, 0]} rotation={[0, 0.2, 0.4]} />
            </Canvas>
        </Suspense>
    );
}


function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Password reset token not found in URL.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Token is invalid or expired.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Confirmation password does not match!');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8082/user/reset_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ token: token, newPassword: newPassword })
            });
            const responseData = await response.json();
            if (response.ok) {
                setMessage(responseData.message || 'Password was reset successfully!');
                setNewPassword(''); setConfirmPassword('');
            } else {
                setError(responseData.message || `Lỗi ${response.status}: Unable to reset password`);
            }
        } catch (err) {
            console.error("Reset Password fetch error:", err);
            setError('Unable to connect to server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && error) {
        return (
            <div className={Style.Container}>
                <div className={Style.Login_Register_Conten}>
                    <div className={`${Style.Login} ${Style.Defaul}`}>
                        <div>
                            <div className={Style.Tite}><p>Lỗi Token</p></div>
                            <p className={Style.Input_error} style={{ textAlign: 'center' }}>{error}</p>
                            <div className={Style.Input_No_account} style={{marginTop: '20px'}}>
                                <button onClick={() => navigate('/login_register')} className={Style.LinkButton}>
                                    Yêu cầu lại
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={Style.Login_Register_Canvas}>
                    <Canvas_Three_Js_ResetPage />
                </div>
            </div>
        );
    }
     if (!token && !error) { 
        return (
             <div className={Style.Container}>
                <div className={Style.Login_Register_Conten}>
                    <p style={{color: 'white', textAlign: 'center'}}>Page loading or invalid token...</p>
                </div>
                <div className={Style.Login_Register_Canvas}>
                    <Canvas_Three_Js_ResetPage />
                </div>
            </div>
        );
    }


    return (
        <div className={Style.ResetWrapper}>
            <div className={Style.Login_Register_Conten}>
                <div className={`${Style.Login} ${Style.Defaul}`}> 
                    <div>
                        <div className={Style.Tite}>
                            <p>Reset Password</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={`${Style.Input} ${error.includes('Password must be') ? Style.has_error : ''}`}>
                                <span className={Style.Input_Icon}><i className="bi bi-lock-fill"></i></span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); if(error) setError(''); }}
                                    placeholder=" "
                                    required
                                    id="new-password"
                                />
                                <label htmlFor="new-password">New Password</label>
                                {error.includes('Password must be') && <span className={Style.Input_error_inline}>{error}</span>}
                            </div>

                            <div className={`${Style.Input} ${error.includes('match') ? Style.has_error : ''}`}>
                                <span className={Style.Input_Icon}><i className="bi bi-check-circle-fill"></i></span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); if(error) setError(''); }}
                                    placeholder=" "
                                    required
                                    id="confirm-password"
                                />
                                <label htmlFor="confirm-password">Confirm new password</label>
                                {error.includes('match') && <span className={Style.Input_error_inline}>{error}</span>}
                            </div>

                            {message && <p className={`${Style.Input_success} ${Style.MessageSpacing}`}>{message}</p>}
                            {error && !error.includes('Password must be') && !error.includes('match') &&
                                <p className={`${Style.Input_error} ${Style.MessageSpacing}`}>{error}</p>
                            }


                            <div className={Style.Input_Button}>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                        <div className={Style.Input_No_account}>
                            {message ? ( 
                                <button onClick={() => navigate('/login_register')} className={Style.LinkButton}>
                                    Đăng nhập ngay
                                </button>
                            ) : ( 
                                <button onClick={() => navigate('/login_register')} className={Style.LinkButton}>
                                    Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={Style.Login_Register_Canvas}>
                <Canvas_Three_Js_ResetPage /> 
            </div>
        </div>
    );
}
useGLTF.preload("/obj/coffee/scene.gltf");
useGLTF.preload("/obj/coffee_bean_-_pbr/scene.gltf");

export default ResetPassword;