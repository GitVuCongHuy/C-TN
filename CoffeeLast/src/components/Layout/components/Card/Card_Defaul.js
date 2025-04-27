import Style from "./Card.module.css"
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useContext } from 'react';
import Context from "../../../../Context/Context";
import { Add_To_Card } from "../../../Function/Card_Funci/Card_Funci";

function Card_Defaul(props) {
   const { cart, setCart } = useContext(Context);
   const iteam = props.iteam;
   const navigate = useNavigate(); 

   const handleAddToCart = () => {
        Add_To_Card({ props: iteam, cart, setCart });
   };

   const handleViewDetails = () => {
        navigate(`/product/${iteam.productId}`);
   };

   return (
    <div className={Style.Card_Defaul}>
        <div className={Style.Card_Defaul_Img}>
            <img src={iteam.img} />
        </div>
        <div className={Style.Card_Defaul_Conten}>
            <div className={Style.Card_Defaul_Conten_Title}>
                <p>{iteam.name}</p>
            </div>
            <div className={Style.Card_Defaul_Conten_Describe}>
                <p>{iteam.description}</p>
            </div>
            <div className={Style.Card_Defaul_Conten_Size_Price}>
                <p>Price:</p>
                <div className={Style.Card_Defaul_Conten_Size_Price_Price}>
                    <p>{iteam.price}$</p>
                </div>
            </div>
            <div className={Style.Card_Defaul_Conten_Button}>
                <div className={Style.Card_Defaul_Conten_Button_WachMore}>
                    <button onClick={handleViewDetails}>Detail</button>
                </div>
                <div className={Style.Card_Defaul_Conten_Button_Add_to_Card}>
                    <button onClick={handleAddToCart}><i className="bi bi-bag-plus"></i></button>
                </div>
            </div>
        </div>
    </div>
   );
}
export default Card_Defaul;
