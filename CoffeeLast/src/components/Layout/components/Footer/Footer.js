import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerSection}>
        <h3>ABOUT</h3>
        <ul>
          <li>The Company</li>
          <li>FAQ</li>
          <li>Privacy Policy</li>
        </ul>
      </div>
      <div className={styles.footerSection}>
        <h3>LOCATIONS</h3>
        <ul>
          <li>San Francisco</li>
          <li>Newport Beach</li>
          <li>Sun City</li>
        </ul>
      </div>
      <div className={styles.footerSection}>
        <h3>FOLLOW ALONG</h3>
        <div className={styles.socialIcons}>
          <i className="fa fa-instagram"></i>
          <i className="fa fa-facebook"></i>
          <i className="fa fa-tripadvisor"></i>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2020 AMAYA. ALL RIGHTS RESERVED.</p>
        <div className={styles.logo}>
          <img src="image/Amaya-logo-white-1.png" alt="AMAYA ROASTING CO." />
        </div>
        <p className={styles.loveCoffee}>BECAUSE WE LOVE COFFEE</p>
      </div>
    </footer>
  );
};

export default Footer;
