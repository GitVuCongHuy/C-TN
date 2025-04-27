import styles from './About_us.module.css';
import React from 'react';
import { useState } from 'react';


function About_us() {
  const [hoveredImage, setHoveredImage] = useState(null);

  const handleMouseEnter = (imageName) => {
    setHoveredImage(imageName);
  };

  const handleMouseLeave = () => {
    setHoveredImage(null);
  };

    return ( 
    <div className={styles.body}>
    <div className={styles.container}>
      <div className={styles.leftcontent}>
        <div className={styles.insideconten}>
            <h3>About us</h3>
        </div>
        <div className={styles.insidebigconten}>
            <h1>Dedication to quality</h1>
        </div>
        <div className={styles.insidebigconten}>
            <h1>---</h1>
        </div>
        <div className={styles.insidesmailconten}>
            <p>Our mission is to provide quality hand-picked, hand-roasted, sustainably sourced coffee. Great coffee is our passion and we want to share it with you.</p>
        </div>
        <div className={styles.insidesmailconten}>
            <p>We strive to build deep partnerships with farmers around the world to create shared perspectives and form healthy working relationships based on trust and respect.</p>
        </div>
      </div>
      <div className={styles.rightvideo}>
        <div className={styles.overlayText}>
          <h1>Everything we do is a matter of heart, body and soul.</h1>
        </div>
        <video autoPlay loop muted>
          <source src="/video/amaya-video-1-xs.mp4" type="video/mp4"/>
        </video>
      </div>
    </div> 
    <div className={styles.centercontainer}>
        <div className={styles.insidecenterconten}>
            <h3>Our philosophy</h3>
        </div>
        <div className={styles.insidebigcenconten}>
            <h1>Coffee is our craft, our ritual and our passion.</h1>
        </div>
        <div className={styles.insidebigcenconten}>
            <h1>---</h1>
        </div>
        <div className={styles.insidesmailcenterconten}>
            <p>Fair trade siphon crema extra, viennese qui, the foam viennese siphon is so carajillo sit ut add old chicory crema chicory Et, a dark cup, cortado, siphon and arabica macchiato flavored coffee, at, acerbic redeye iced americano coffee. To go et, steaming a cafe au lait, the only aftertaste is blue mountain frappuccino.</p>
        </div>
    </div> 
    <div className={styles.picture}>
      <div className={styles.leftimage}>
        <img
          src="/image/1.jpg"
          alt="Image 1"
          onMouseEnter={() => handleMouseEnter('Image 1')}
          onMouseLeave={handleMouseLeave}
          className={hoveredImage === 'Image 1' ? styles.hovered : styles.slideUp}
        />
        {hoveredImage === 'Image 1' && (
          <div className={styles.tooltip}>This is Image 1</div>
        )}
      </div>
      <div className={styles.rightimages}>
        <div className={styles.topimages}>
          <img
            src="/image/2.jpg"
            alt="Image 2"
            onMouseEnter={() => handleMouseEnter('Image 2')}
            onMouseLeave={handleMouseLeave}
            className={hoveredImage === 'Image 2' ? styles.hovered : styles.slideUp}
          />
          {hoveredImage === 'Image 2' && (
            <div className={styles.tooltip}>This is Image 2</div>
          )}

          <img
            src="/image/3.jpg"
            alt="Image 3"
            onMouseEnter={() => handleMouseEnter('Image 3')}
            onMouseLeave={handleMouseLeave}
            className={hoveredImage === 'Image 3' ? styles.hovered : styles.slideUp}
          />
          {hoveredImage === 'Image 3' && (
            <div className={styles.tooltip}>This is Image 3</div>
          )}
        </div>
        <div className={styles.bottomimage}>
          <img
            src="/image/4.jpg"
            alt="Image 4"
            onMouseEnter={() => handleMouseEnter('Image 4')}
            onMouseLeave={handleMouseLeave}
            className={hoveredImage === 'Image 4' ? styles.hovered : styles.slideUp}
          />
          {hoveredImage === 'Image 4' && (
            <div className={styles.tooltip}>This is Image 4</div>
          )}
        </div>
      </div>
    </div>
    <div className={styles.centercontainer}>
        <div className={styles.insidecenterconten}>
            <h3>Our story</h3>
        </div>
        <div className={styles.insidebigcenconten}>
            <h1>Everything we do comes from our heart, body and soul.</h1>
        </div>
        <div className={styles.insidebigcenconten}>
            <h1>---</h1>
        </div>
        <div className={styles.insidesmailcenterconten}>
            <p>It all started with a humble concept: Create a special coffee. Siphon crema extra fair trade, qui viennese, siphon viennese foam is the caramelization process. Carajillo sits ut extra chicory crema instant aged chicory. Et, dark a cup, cortado, siphon at arabica flavor macchiato. Cream, at, acerbic redeye iced americano white coffee. To go et, steam a cup of café au lait, original flavor whipped blue mountain frappuccino.</p>
        </div>
    </div> 
    <div className={styles.container}>
      <div className={styles.imagebot}>
        <img src="/image/coffeebean-beans-2.jpg" alt="placeholder" />
      </div>
      <div className={styles.textbot}>
      <div className={styles.insideconten}>
            <h3>Our mission</h3>
              </div>
                <div className={styles.insidebigconten}>
              <h1>We source coffee from all over the world from farmers we know and trust.</h1>
            </div>
            <div className={styles.insidebigconten}>
                <h1>---</h1>
            </div>
            <div className={styles.insidesmailconten}>
                <p>We source our coffee from countries around the world, with clear origins from farmers we know and trust. Our long-standing and trusted relationships with these farmers are key to providing high-quality coffee and ensuring ethical supply chains.</p>
            </div>
        </div>
      </div>       
  </div>
  );
}

export default About_us;
