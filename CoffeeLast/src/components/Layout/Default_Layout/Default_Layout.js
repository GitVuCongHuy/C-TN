import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import Slider from "../components/Slider/Slider";
import ChatbotComponent from "../../ChatbotUI/ChatbotComponent";

import Style from "./Default_Layout.module.css"



function Default_Layout({children}) {
    return ( 
        <div>
            <div className={Style.Layout_Header}>
                <Header/>
            </div>
            <div className={Style.Layout_Slider}>
                <Slider/>
            </div>
            <div>
                
                <div>
                    {children}
                </div>
            </div>
            <ChatbotComponent />
            <Footer />
        </div>
     );
}

export default Default_Layout;