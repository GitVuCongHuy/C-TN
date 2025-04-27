import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuCard from "../../components/Layout/components/MenuCard/Menu_Card";
import ProductFilter from "../../components/Layout/components/Filter_Card/ProductFilter";


const CoffeeMenu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [searchTitle, setSearchTitle] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("inStock");
  // const [selectedBranch, setSelectedBranch] = useState("all"); 
  // const [branches, setBranches] = useState(["all", "Base 1", "Base 2", "Base 3"]);
  const itemsPerPage = 12;

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8082/product");
      const data = await response.json();
      console.log("Fetched products:", data); 
      const convertedProducts = data.map((product) => ({
        ...product,
        title: product.name, 
      }));
      setProducts(convertedProducts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const filteredProducts = products.filter((product) => {
    // const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesTitle =
      searchTitle === "" || product.title.toLowerCase().includes(searchTitle.toLowerCase());
  
    const matchesAvailability =
      availabilityStatus === "inStock"
        ? product.stock > 0
        : availabilityStatus === "outStock"
        ? product.stock < 1
        : true;
    return matchesPrice && matchesTitle && matchesAvailability;
    // const matchesBranch = selectedBranch === "all" || product.branch === selectedBranch;
    // return matchesBrand && matchesPrice && matchesTitle && matchesAvailability && matchesBranch;
  });
  

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    
    <div className="container mt-5">
      <div className="row">
        <div className="col-3">
          {/* <div className="mb-3">
            <label htmlFor="branch-select" className="form-label">
              Select Base:
            </label>
            <select
              id="branch-select"
              className="form-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div> */}

          <ProductFilter
            searchTitle={searchTitle}
            setSearchTitle={setSearchTitle}
            // selectedBrand={selectedBrand}
            // setSelectedBrand={setSelectedBrand}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            availabilityStatus={availabilityStatus}
            setAvailabilityStatus={setAvailabilityStatus}
            products={products}
          />
        </div>

        <div className="col-9">
        <div
          style={{
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "20px", 
            justifyContent: "center", 
          }}
        >
          {currentItems.map((e) => (
           
              <MenuCard product={e}  />
          ))}
        </div>


          {totalPages > 1 && (
           <nav>
           <ul className="pagination justify-content-center" style={{ margin: "10px 0" }}>
             {Array.from({ length: totalPages }, (_, index) => (
               <li
                 className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
                 key={index}
               >
                 <button
                   className="page-link"
                   onClick={() => handlePageChange(index + 1)}
                   style={{
                     color: "#000", 
                     border: "1px solid #000", 
                     backgroundColor: index + 1 === currentPage ? "#000" : "#fff",
                     color: index + 1 === currentPage ? "#fff" : "#000",
                   }}
                 >
                   {index + 1}
                 </button>
               </li>
             ))}
           </ul>
         </nav>
         
          )}
        </div>
      </div>
    </div>
  );
};

export default CoffeeMenu;
