
import styles from './Home.module.css';
import { Carousel } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Link } from "react-router-dom";

import Card_Defaul from '../../components/Layout/components/Card/Card_Defaul';


import React, { useState, useEffect } from 'react';

function Card_Slidler() {
    return (
        <div>
            <div className={styles.Card_Slidler} style={{ marginTop: "150px", marginBottom: "100px" }}>
                <div className={styles.Card_Slidler_Title} >
                    <div>
                        <p>LATEST NEWS</p>
                    </div>

                </div>
                <Carousel className={`w-100 ${styles.Card_Slidle_Body}`}>
                    <Carousel.Item  >
                        <div className={styles.Card_Slidle_Body_Conten}>
                            <Row>
                                <Col md={4}>
                                    <div className={styles.Card_Slidle_Body_Conten_Left}>
                                        <div className={styles.Card_Slidle_Body_Conten_Left_Img} >
                                            <img
                                                className={styles.Card_Slidle_Body_Conten_Right_Conten_Image}
                                                src="https://xofacafebistro.com/wp-content/uploads/2023/01/coffee-cups-and-coffee-beans-768x1082.jpg"
                                                alt="Update Preview"
                                            />
                                        </div>
                                    </div>
                                </Col>

                                <Col md={8}>
                                    <div className={styles.Card_Slidle_Body_Conten_Right}>
                                        <div className={styles.Card_Slidle_Body_Conten_Right_Conten}>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Date} >November 18, 2024</p>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Title} > Exciting News: Our Latest Update!</p>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Conten} > Discover the latest features in our platform, designed to improve your experience.
                                                Stay tuned for more updates coming soon!</p>
                                            <button><a href='/about_us'>Read More</a></button>
                                        </div>

                                    </div>
                                </Col>
                            </Row>

                        </div>


                    </Carousel.Item>


                    <Carousel.Item  >
                        <div className={styles.Card_Slidle_Body_Conten}>
                            <Row>
                                <Col md={4}>
                                    <div className={styles.Card_Slidle_Body_Conten_Left}>
                                        <div className={styles.Card_Slidle_Body_Conten_Left_Img} >
                                            <img
                                                className={styles.Card_Slidle_Body_Conten_Right_Conten_Image}
                                                src="https://xofacafebistro.com/wp-content/uploads/2023/01/182068863_4447833575247139_2234046618090785431_n-768x768.jpg"
                                                alt="Update Preview"
                                            />
                                        </div>
                                    </div>
                                </Col>

                                <Col md={8}>
                                    <div className={styles.Card_Slidle_Body_Conten_Right}>
                                        <div className={styles.Card_Slidle_Body_Conten_Right_Conten}>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Date} >November 18, 2024</p>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Title} > Exciting News: Our Latest Update!</p>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Conten} > Discover the latest features in our platform, designed to improve your experience.
                                                Stay tuned for more updates coming soon!</p>
                                            <button><a href='/about_us'>Read More</a></button>
                                        </div>

                                    </div>
                                </Col>
                            </Row>

                        </div>


                    </Carousel.Item>


                    <Carousel.Item  >
                        <div className={styles.Card_Slidle_Body_Conten}>
                            <Row>
                                <Col md={4}>
                                    <div className={styles.Card_Slidle_Body_Conten_Left}>
                                        <div className={styles.Card_Slidle_Body_Conten_Left_Img} >
                                            <img
                                                className={styles.Card_Slidle_Body_Conten_Right_Conten_Image}
                                                src="https://xofacafebistro.com/wp-content/uploads/2023/01/doi-ngu-nhan-su-6.jpg    "
                                                alt="Update Preview"
                                            />
                                        </div>
                                    </div>
                                </Col>

                                <Col md={8}>
                                    <div className={styles.Card_Slidle_Body_Conten_Right}>
                                        <div className={styles.Card_Slidle_Body_Conten_Right_Conten}>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Date} >November 18, 2024</p>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Title} > Exciting News: Our Latest Update!</p>
                                            <p className={styles.Card_Slidle_Body_Conten_Right_Conten_Conten} > Discover the latest features in our platform, designed to improve your experience.
                                                Stay tuned for more updates coming soon!</p>
                                            <button><a href='/about_us'>Read More</a></button>
                                        </div>

                                    </div>
                                </Col>
                            </Row>

                        </div>


                    </Carousel.Item>



                </Carousel>
            </div>
        </div>
    );


}



function Header_Home() {
    return (
        <div className={styles.Header_Home} >
            <Row>
                <Col xs={12}
                    sm={8}
                    md={{ span: 7, offset: 1 }}
                    lg={{ span: 4, offset: 1 }}
                    xl={{ span: 4, offset: 1 }} className={styles.Header_Home_Left} >
                    <div className={styles.Header_Home_Left_Conten}>
                        <p className={styles.Header_Home_Left_Conten_H1} >Quality coffee delivered to your door</p>
                        <p className={styles.Header_Home_Left_Conten_H2}>Everything we do is a matter of heart, body and soul. Our mission is to provide quality, hand-picked, sustainably sourced coffee.</p>
                        <Link to="/menu">
                            <button className={styles.MenuButton}>Menu</button>
                        </Link>
                    </div>
                </Col>

            </Row>
        </div>
    );
}


function List_Menu() {



    return (
        <div className={styles.Home_List_Menu}>
            <Row className={styles.Home_List_Menu_Conten}>
                <Col xs={12} sm={6} md={4} className={styles.Home_List_Menu_Conten_Sm}  >
                    <div className={styles.Home_List_Menu_Conten__Sm_1}>
                        <div>
                            <p className={styles.Home_List_Menu_Conten_head}>INTRODUCE YOUR FRIENDS</p>
                            <p className={styles.Home_List_Menu_Conten_mony}>Earn $10</p>
                            <p className={styles.Home_List_Menu_Conten_conten}>Share your love of coffee with friends</p>
                            <button ><a href='/menu'>Menu</a></button>
                        </div>
                    </div>
                </Col>
                <Col xs={12} sm={6} md={4} className={styles.Home_List_Menu_Conten_Sm}  >
                    <div className={styles.Home_List_Menu_Conten__Sm_2}>
                        <div>
                            <p className={styles.Home_List_Menu_Conten_head}>August</p>
                            <p className={styles.Home_List_Menu_Conten_mony}>Earn $10</p>
                            <p className={styles.Home_List_Menu_Conten_conten}>Share your love of coffee with friends.</p>
                            <button><a href='/menu'>Shop Now</a></button>
                        </div>
                    </div>
                </Col>
                <Col xs={12} sm={6} md={4} className={styles.Home_List_Menu_Conten_Sm}  >
                    <div className={styles.Home_List_Menu_Conten__Sm_3}>
                        <div>
                            <p className={styles.Home_List_Menu_Conten_head}>COLD COFFEE</p>
                            <p className={styles.Home_List_Menu_Conten_mony}>Earn $10</p>
                            <p className={styles.Home_List_Menu_Conten_conten}>Refresh your mind with organic, sustainably-sourced cold brew coffee.</p>
                            <button><a href='/about_us'>Read More</a></button>
                        </div>
                    </div>
                </Col>


            </Row>
        </div>
    );
}


function List_Card() {

    const [list, setList] = useState([]);

    async function callData() {
        try {
            const response = await fetch('http://localhost:8082/product', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();

                setList(data);
            } else {
                console.error('Error fetching data from server');
            }
        } catch (error) {
            console.error('Connection error:', error);
        }
    }

    useEffect(() => {
        callData();
    }, []);



    return (
        <div className={styles.List_Card}  >
            <div className={styles.Card_Slidler_Title} style={{ marginBottom: 60 }} >
                <div>
                    <p>FEATURED PRODUCTS</p>
                </div>
            </div>
            <div>


                <Row className='g-2'>
                    {list.slice(0, 6).map((e, i) => (

                        <Col xs={6} sm={6} md={4} key={i}>
                            <Card_Defaul iteam={e} />
                        </Col>


                    ))}

                </Row>
            </div>


        </div>
    );
}


function Home_About_Us() {
    return (
        <div className={styles.Home_About_Us}>
            <div className={styles.Home_About_Us_Title} >
                <p>About us</p>
            </div>
            <div className={styles.Home_About_Us_vertical_line} >

            </div>
            <div className={styles.Home_About_Us_Conten} >
                <p>Everything we do is a matter of heart, body and soul. We strive to form deep partnerships with farmers from around the world to create shared perspectives and form healthy working relationships built on trust and respect.</p>


                <button><a href='/about_us'>READ MORE</a></button>
            </div>


            {/* <div className={styles.Home_About_Us_Title} >
                <p>Follow on Instagram</p>
            </div> */}
            <div className={styles.Home_About_Us_vertical_line} >

            </div>
            <div>
                <Row className="g-0">

                    <Col xs={6} sm={4} md={2}>
                        <img
                            className="img-fluid"
                            src="https://www.amayatheme.redsun.design/roastery/wp-content/uploads/sites/2/sb-instagram-feed-images/120195602_249178153140668_4124167805856436187_nfull.jpg"
                            alt="Image"
                        />
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <img
                            className="img-fluid"
                            src="https://www.amayatheme.redsun.design/roastery/wp-content/uploads/sites/2/sb-instagram-feed-images/119886667_102416571596524_8435132330489653478_nfull.jpg"
                            alt="Image"
                        />
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <img
                            className="img-fluid"
                            src="https://www.amayatheme.redsun.design/roastery/wp-content/uploads/sites/2/sb-instagram-feed-images/120132785_621075875245187_3739656102265052935_nfull.jpg"
                            alt="Image"
                        />
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <img
                            className="img-fluid"
                            src="https://www.amayatheme.redsun.design/roastery/wp-content/uploads/sites/2/sb-instagram-feed-images/120133763_792102311603530_7871492403308681854_nfull.jpg"
                            alt="Image"
                        />
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <img
                            className="img-fluid"
                            src="https://www.amayatheme.redsun.design/roastery/wp-content/uploads/sites/2/sb-instagram-feed-images/120176363_371642934002855_8797918585875241459_nfull.jpg"
                            alt="Image"
                        />
                    </Col>
                    <Col xs={6} sm={4} md={2}>
                        <img
                            className="img-fluid"
                            src="https://www.amayatheme.redsun.design/roastery/wp-content/uploads/sites/2/sb-instagram-feed-images/120031798_200401764795682_5230375972606461977_nfull.jpg"
                            alt="Image"
                        />
                    </Col>

                </Row>
            </div>

        </div>
    );
}




function Home() {
    return (
        <div className={styles.Container}  >
            <Header_Home />

            <List_Card />

            <List_Menu />

            <Card_Slidler />

            <Home_About_Us />
        </div>
    );
}

export default Home;

export { List_Card };
