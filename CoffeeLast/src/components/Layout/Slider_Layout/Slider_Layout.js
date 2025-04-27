// import Footer from "../components/Footer/Footer";
// import Header from "../components/Header/Header";
import Slider from "../components/Slider/Slider";


import Style from "../Default_Layout/Default_Layout.module.css"



function Slider_Layout({children}) {
    return ( 
        <div>
   
            <div className={Style.Layout_Slider}>
                <Slider/>
            </div>
            <div>
                
                <div>
                    {children}
                </div>
            </div>
        </div>
     );
}

export default Slider_Layout;