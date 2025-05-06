import { BrowserRouter as Router,Routes,Route } from "react-router-dom";

import Home from "./page/Home/Home";
import About_us from "./page/About_us/About_us";
import Cart from "./page/Cart/Cart";
import Contact from "./page/Contact_us/Contact_us";
import { ContextProvider } from "./Context/Context";
import Menu from "./page/Menu/Menu";
import Default_Layout from "./components/Layout/Default_Layout/Default_Layout";
import Login_Register from "./page/Login_Register/Login_Register";
import No_Footer_Layout from "./components/Layout/No_Footer_Layout/No_Footer_Layout";
import Slider_Layout from "./components/Layout/Slider_Layout/Slider_Layout";
import UpdateUser from "./page/User/UpdateUser";
import Payment from "./page/Payment/Payment";
import AddProduct from "./page/Menu/Add_Product";
import ProductDetail from "./page/ProductDetail/Product_Detail";
import List_Oders from "./page/Order/List_Oders";
import ListProduct from "./page/Menu/List_Product";
import UpdateProduct from "./page/Menu/UpdateProduct";
import AdminOrderManagement from "./page/Order/Order_Management";
import ResetPassword from './page/Login_Register/ResetPassword';
// import AddBranch from "./page/List_Base/AddBranch";
// import BranchList from "./page/List_Base/BranchList";
// import ProductDetails from "./page/ProductDetail/Product_Detail";
// import Admin_Layout from "./components/Layout/Admin_Layout/Admin_Layout";

function App() {

  return (
    <ContextProvider >
      <Router>
        <div className="App">
          <Routes>
            {/* Trang Binh Thuong */}
              <Route path="/" element={<Default_Layout><Home/></Default_Layout>} />
              <Route path="/about_us" element={<Default_Layout><About_us/></Default_Layout>} />
              <Route path="/menu" element={<Default_Layout><Menu /></Default_Layout>} />
              <Route path="/cart" element={<No_Footer_Layout><Cart/></No_Footer_Layout>} />
              <Route path="/login_register" element={<Slider_Layout><Login_Register/></Slider_Layout>} />
              <Route path="/product/:id" element={<Default_Layout><ProductDetail /></Default_Layout>} />
              <Route path="/contact" element={<Default_Layout><Contact/></Default_Layout>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* KhachHang */}
              <Route path="/update_user" element={<Default_Layout><UpdateUser/></Default_Layout>} />
              <Route path="/payment" element={<Default_Layout><Payment/></Default_Layout>} />   
              <Route path="/list_order" element={<No_Footer_Layout><List_Oders/></No_Footer_Layout>} />
              {/* Owner */}
              <Route path="/order_for_manager" element={<No_Footer_Layout><AdminOrderManagement/></No_Footer_Layout>} />
              <Route path="/add_product" element={<No_Footer_Layout><AddProduct/></No_Footer_Layout>}/>
              <Route path="/list_product" element={<Slider_Layout><ListProduct/></Slider_Layout>} />
              <Route path="/update_product/:productId" element={<Default_Layout><UpdateProduct/></Default_Layout>} />
              {/* <Route path="/list_base" element={<Slider_Layout><BranchList/></Slider_Layout>} /> */}
              {/* <Route path="/add-branch" element={<AddBranch />} /> */}
          </Routes>
        </div>
      </Router>
    </ContextProvider>
  );  
}

export default App;
