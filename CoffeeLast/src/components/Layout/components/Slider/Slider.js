import { useContext } from 'react';
import { useState } from "react";

import Style from "./Slider.module.css"
import Context from "../../../../Context/Context";

function Slider() {
    const { roles } = useContext(Context);
    const [isActive, setIsActive] = useState(false);

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    const hasRole = (roleName) => {
        return roles.some((role) => role.role.roleName === roleName);
    };

    return (
        <>
            <div className={Style.Slider_buuton}>
                <button
                    className={`${isActive ? "" : Style.button_IsAvite}`}
                    onClick={handleToggle}
                >
                    <i className="bi bi-caret-left-square-fill"></i>
                </button>
            </div>
            <div className={`${Style.Slider} ${isActive ? "" : Style.IsAvite}`}>
                <div className={Style.Slider_Page}>
                    <p id={Style.Title}>Main Pages</p>
                    <hr style={{ marginBottom: "0" }} />
                    <ul>
                        <li>
                            <p>
                                <a href="/">
                                    <span ><i className="bi bi-house-door-fill"></i></span>
                                    Home
                                </a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="/about_us">
                                    <span><i className="bi bi-people-fill"></i></span>
                                    About us
                                </a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="/menu">
                                    <span><i className="bi bi-journal-text"></i></span>
                                    Menu
                                </a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="/contact">
                                    <span ><i className="bi bi-telephone-fill"></i></span>
                                    Contact
                                </a>
                            </p>
                        </li>
                        <hr style={{ marginTop: "0" }} />
                    </ul>
                </div>

                {hasRole("CUSTOMER") && (
                    <div style={{ padding: "0" }} className={Style.Slider_Page}>
                        <p id={Style.Title}>Customer</p>
                        <hr style={{ marginBottom: "0" }} />
                        <ul>
                            <li>
                                <p><a href="/list_order"><span><i className="bi bi-truck"></i></span>Order Tracking</a></p>
                            </li>

                            <li>
                                <p><a href="/cart"><span><i className="bi bi-cart2"></i></span>Cart</a></p>
                            </li>
                            <hr style={{ marginTop: "0" }} />
                        </ul>
                    </div>
                )}

                {hasRole("EMPLOYEE") && (
                    <div style={{ padding: "0" }} className={Style.Slider_Page}>
                        <p id={Style.Title}>Employee</p>
                        <ul>
                            <li>
                                <p><a href="/order_for_manager"><span><i className="bi bi-receipt"></i></span>List Invoices</a></p>
                            </li>
                            <hr style={{ marginTop: "0" }} />
                        </ul>
                    </div>
                )}
                {hasRole("DIRECTOR") && (
                    <div style={{ padding: "0" }} className={Style.Slider_Page}>
                        <p id={Style.Title}>Owner</p>
                        <ul>
                            <li>
                                <p><a href="/order_for_manager"><span><i className="bi bi-receipt"></i></span>List Invoices</a></p>
                            </li>
                            <li>
                                <p><a href="/list_product"><span><i className="bi bi-list-ul"></i></span>List Product </a></p>
                            </li>
                            <hr style={{ marginTop: "0" }} />
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}

export default Slider;
