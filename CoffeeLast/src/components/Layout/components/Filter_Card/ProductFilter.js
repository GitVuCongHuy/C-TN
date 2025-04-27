import React from "react";

const ProductFilter = ({
  searchTitle,
  setSearchTitle,
  // selectedBrand,
  // setSelectedBrand,
  priceRange,
  setPriceRange,
  availabilityStatus,
  setAvailabilityStatus,
  products,
}) => {
  const handlePriceChange = (e) => {
    setPriceRange([0, +e.target.value]);
  };

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Search Title</label>
        <input
          type="text"
          className="form-control"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </div>
      {/* <div className="mb-3">
        <label className="form-label">Brand</label>
        <select
          className="form-select"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="all">All Brands</option>
          {Array.from(new Set(products.map((product) => product.brand))).map((brand) => (
            <option value={brand} key={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div> */}
      <div className="mb-3">
        <label htmlFor="status-select" className="form-label">
          Status:
        </label>
        <select
          id="status-select"
          className="form-select"
          value={availabilityStatus}
          onChange={(e) => setAvailabilityStatus(e.target.value)}
        >
          <option value="inStock">In Stock</option>
          <option value="outStock">Out of Stock</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Price</label>
        <div className="d-flex justify-content-between">
          <span>{priceRange[0].toLocaleString()}$</span>
          <span>{priceRange[1].toLocaleString()}$</span>
        </div>
        <input
          type="range"
          className="form-range"
          min="0"
          max="100"
          value={priceRange[1]}
          onChange={handlePriceChange}
        />
      </div>
    </div>
  );
};

export default ProductFilter;
