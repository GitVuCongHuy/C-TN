import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styles from "./Contact_us.module.css"; 
import Accordion from 'react-bootstrap/Accordion';

const Contact = () => {
    
  return (
    <div className={styles.body}>
      <div className={styles.textup}>
        <div className={styles.blurText}>CONTACT</div>
        <div className={styles.overlayTextUp}>CONTACT US</div>
        <div className={styles.overlayTextDown}>XOFA CAFE & BISTRO INFORMATION</div>
      </div>

      <div className={styles.contactContainer}>
        <div className={styles.contactItem}>
          <div className={styles.iconBox}>
            <i className="fa-solid fa-shop"></i>
          </div>
          <h4 className={styles.textTitle}>ADDRESS</h4>
          <p className={styles.textDescription}>
          Coffeeville Alabama 36524 United States
          </p>
        </div>

        <div className={styles.contactItem}>
          <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
            <i className={`fa-regular fa-envelope ${styles.iconGreen}`}></i>
          </div>
          <h4 className={styles.textTitle}>EMAIL</h4>
          <p className={styles.textDescription}>huyhuyhuyak74@gmail.com</p>
        </div>

        <div className={styles.contactItem}>
          <div className={styles.iconBox}>
            <i className="fa-solid fa-phone"></i>
          </div>
          <h4 className={styles.textTitle}>PHONE</h4>
          <p className={styles.textDescription}>024 3717 1555</p>
        </div>

        <div className={styles.contactItem}>
          <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
            <i className={`fa-solid fa-clock-rotate-left ${styles.iconGreen}`}></i>
          </div>
          <h4 className={styles.textTitle}>OPENING</h4>
          <p className={styles.textDescription}>Open all day</p>
        </div>
      </div>

      {/* Google Map */}
      <div className={styles.map}>
        <iframe
          width="100%"
          height="450"
          style={{ border: 0 }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2387.712944203182!2d105.7814162!3d21.0284995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abf1b3e8c4f5%3A0x1f4b1e8d7d5c2f7d!2sYour%20Location!5e0!3m2!1sen!2sin!4v1636437305075!5m2!1en!2sin"
          allowFullScreen
          title="Google Map"
        ></iframe>
      </div>
      <div className={styles.textdown}>
        <div className={styles.blurText}>FAQ</div>
        <div className={styles.overlayTextUp}>CUSTOMER QUESTIONS</div>
        <div className={styles.overlayTextDown}>FAQ</div>
      </div>
      <div className={styles.textFAQ}>
      <Container>
      <Row>
        <Col>
        <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: What coffee brewing methods should I try?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}> 
          A: There are many brewing methods to choose from depending on your preferences. Espresso and French Press produce a full-bodied coffee, while pour-over produces a bright, delicate flavor. If you prefer a smooth, low-acid coffee, cold brew is ideal. Methods like Aeropress and Moka pot produce a strong coffee, while siphon produces a light, delicate cup.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: Does the shop provide international VC services?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}>
          A: Sorry, we do not currently offer international shipping. Only domestic orders are supported. Thank you for your understanding!
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: Does the shop offer gift options?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}>
          A: We have a wide selection of gifts for our customers, including special gift sets and gift wrapping services. You can choose gifts based on your personal preferences or the occasion. If you need advice, we are always available to help you find the perfect gift.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="3" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: What is the store's return policy?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}>
          A: We accept returns within 30 days of purchase, provided the product is in its original condition, unused, and has a complete invoice. If the product is defective or not as described, we will support an exchange or refund. You can contact customer service for detailed instructions.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
        </Col>
        <Col>
        <Accordion defaultActiveKey="2">
      <Accordion.Item eventKey="4" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: Do you have caffeine free drinks?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}> 
          A: We offer a wide selection of decaffeinated beverages, including teas, yogurts, and decaf coffees. You can request decaffeinated beverages when you order.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="5" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: Does the shop serve breakfast and lunch?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}>
          A: Yes, we serve breakfast and lunch items, including sandwiches, salads and other light meals. Dishes are made from fresh ingredients, suitable for breakfast or a light lunch.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="6" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: Does the shop have outdoor seating?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}>
          A: Yes, we have an outdoor seating area where customers can enjoy their drinks in an open space. You can choose to sit indoors or outdoors depending on your preference.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="7" className={styles.custom_accordion}>
        <Accordion.Header className={styles.smailcontent}>Q: Can I order online and have it delivered?</Accordion.Header>
        <Accordion.Body className={styles.insidesmailconten}>
          A: We offer online ordering and delivery services to our customers. You can order through our website or app and get your favorite drinks delivered to your home or office.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
        </Col>
      </Row>
    </Container>
    </div>
    </div>
  );
};

export default Contact;
