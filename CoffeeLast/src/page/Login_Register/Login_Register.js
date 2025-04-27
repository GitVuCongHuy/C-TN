import React, { Suspense, useContext, useEffect, useState, useMemo } from "react";  // Make sure to import useState
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import Style from './Login_Register.module.css';
import { Mesh } from "three";
import { EXRLoader } from "three/examples/jsm/Addons.js";
import { a, useSpring } from "@react-spring/three";



import Context from "../../Context/Context";
import { useNavigate } from "react-router-dom";


//THREE REACT

function SmoothCamera({ isLogin }) {
    const { camera } = useThree();

    const { position, rotation } = useSpring({
        position: isLogin ? [0, 0, 5] : [1, 2, -5],
        rotation: isLogin
            ? [0, 0, 5] // Góc 30 độ
            : [-Math.PI / 1, Math.PI / 10, Math.PI / 1],
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
    const coffeeBeanScene = scene.clone();  // Clone the scene to avoid shared state

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

function Canvas_Three_Js({ isLogin }) {
    return (
        <Suspense fallback={null}>
            <Canvas >

                <ambientLight intensity={0.5} />

                <directionalLight position={[0, 1, -1]} rotation={[1, 1, 3]} intensity={1.5} />


                <Environment
                    files="./hdri/empty_play_room_2k.exr"
                    preset={null}
                    background={false}
                    loader={EXRLoader}

                />
                <SmoothCamera isLogin={isLogin} />


                <RamdomCoffe Num={50} />
                <ShibaModel position={[3, -1.8, 0]} rotation={[0, 0.2, 0.4]} />
            </Canvas>
        </Suspense>
    );
}

function Login({ IsLogin, setIsLogin }) {

    const { token, saveToken } = useContext(Context)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const navigate = useNavigate();
    const data = {
        username: username,
        password: password,
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8082/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)

            })

            if (response.ok) {
                const responseData = await response.json();
                const { token } = responseData;
                if (token == null) { return }
                saveToken(token);
                navigate('/');

            } else {
                const errorData = await response.json();
                setError(errorData.message || "Sai tên Tài Khoản Hoặc Mật Khẩu");
            }



        } catch (error) {
            setError('Sai Tên Đăng Nhập Hoặc Mật khẩu');
        }
    }


    return (<div className={`${Style.Login} ${Style.Defaul}`}>
        <div>
            <div className={Style.Tite}>
                <p>Log in</p>
            </div>
            <div className={Style.Input}>

                <span className={Style.Input_Icon} ><i class="bi bi-envelope-check-fill"></i></span>
                <input onChange={(e) => setUsername(e.target.value)} type="text" />
                <label>Login Name</label>

            </div>

            <div className={Style.Input}>

                <span className={Style.Input_Icon} ><i class="bi bi-lock-fill"></i></span>
                <input type="password" onChange={(e) => setPassword(e.target.value)} />
                <label>Password</label>
                {error && <p className={Style.Input_error}>{error}</p>}
            </div>
            <div className={Style.Remember}>
                <div><input type="checkbox" />Remember Me</div>
                <div><a href="/">Forgot Password?</a></div>
            </div>

            <div className={Style.Input_Button}>
                <button onClick={handleSubmit}>Log in</button>
            </div>

            <div className={Style.Input_No_account}>
                <p>Don't have an account?<button onClick={() => setIsLogin(!IsLogin)}>Register</button></p>
            </div>



        </div>

    </div>)
}

function Sign_in({ IsLogin, setIsLogin }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmpassword) {
            setError("Mật Khẩu Không Khớp ")
            return;
        }


        const data = {
            username: username,
            password: password,
        }

        try {

            const response = await fetch('http://localhost:8082/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                alert('Đăng Kí Thành Công');
                setIsLogin(true)
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Đã có lỗi xảy ra!");
            }


        } catch (error) {
            setError('Lỗi kết nối đến máy chủ!');
        }
    }











    return (
        <div className={`${Style.Login} ${Style.Defaul}`}>
            <div>
                <div className={Style.Tite}>
                    <p>REGISTER</p>
                </div>
                <div className={Style.Input}>

                    <span className={Style.Input_Icon} ><i class="bi bi-envelope-check-fill"></i></span>
                    <input onChange={(e) => setUsername(e.target.value)} type="text" />
                    <label>Login Name</label>

                </div>

                <div className={Style.Input}>

                    <span className={Style.Input_Icon} ><i class="bi bi-lock-fill"></i></span>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                    <label>Password</label>

                </div>
                <div className={Style.Input}>

                    <span className={Style.Input_Icon} ><i class="bi bi-lock-fill"></i></span>
                    <input value={confirmpassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
                    <label>Re-enter Password</label>
                    {error && <p className={Style.Input_error}>{error}</p>}
                </div>
                <div className={Style.Remember}>
                    <div><input type="checkbox" />Remember Me</div>

                </div>

                <div className={Style.Input_Button}>
                    <button onClick={handleSubmit}  >Register</button>
                </div>

                <div className={Style.Input_No_account}>
                    <p>Đã Có Tài Khoản ? <button onClick={() => setIsLogin(!IsLogin)} >Log in</button></p>
                </div>



            </div>

        </div>
    )
}

export default function Login_Register() {

    const [IsLogin, setIsLogin] = useState(true);





    return (
        <div className={Style.Container}>

            <div className={Style.Login_Register_Conten}>
                <div className={`${Style.Login_Register_Conten_Login} ${Style.Defaul_Layout}`} >
                    <div style={{ clipPath: IsLogin ? "inset(0 0 0 0)" : "inset(0 0 0 100%)" }} >
                        <Login IsLogin={IsLogin} setIsLogin={setIsLogin} />
                    </div>
                    <div className={Style.Login_Register_KhoangTrong} >

                    </div>
                    <div style={{ clipPath: IsLogin ? "inset(0 0 0 100%)" : "inset(0 0 0 0)" }} >
                        <Sign_in IsLogin={IsLogin} setIsLogin={setIsLogin} />
                    </div>

                </div>
            </div>
            <div className={Style.Login_Register_Canvas}>
                <Canvas_Three_Js isLogin={IsLogin} />
            </div>


        </div>
    );
}


useGLTF.preload("./obj/Shiba/scene.gltf");
