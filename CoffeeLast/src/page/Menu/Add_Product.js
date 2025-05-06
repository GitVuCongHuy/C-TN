import React, { useState, useEffect } from 'react';
import FileUpload from '../../components/Function/Upload/FileUpload';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    img: '',
    chian_id: '',
  });

  const [branches, setBranches] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('http://localhost:8082/chain/get_all', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (response.ok) {
          const data = await response.json();
          setBranches(data.map((item) => ({ id: item.chain_id, name: item.name })));
        }
      } catch (error) {
        console.error('Lỗi kết nối:', error);
      }
    };

    fetchBranches();
  }, []);

  const handleFileSelect = (file) => setSelectedFile(file);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPreviewData(formData);
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8082/product/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Sản phẩm đã được tạo thành công!');
        setFormData({ name: '', description: '', price: '', stock: '', img: '', chian_id: '' });
        setPreviewData(null);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    }
  };

  return (
    <div className="container my-5">
      <h2
        className="text-center mb-4"
        style={{ color: "#6F4E37" }}
      >
        Add new products
      </h2>
      <div className="card shadow-sm p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Describe</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="col-md-6">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Choose a facility</label>
              <select
                className="form-select"
                value={formData.chian_id}
                onChange={(e) => setFormData({ ...formData, chian_id: e.target.value })}
                required
              >
                <option value="">-- Choose --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-12">
              <label className="form-label">Image</label>
              <div className="d-flex align-items-center gap-3">
                <FileUpload onFileSelect={handleFileSelect} />
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: "#6F4E37",
                    borderColor: "#6F4E37",
                    color: "#fff",
                  }}
                  onClick={async () => {
                    if (!selectedFile) return alert("Please select file!");
                    setIsUploading(true);
                    const formDataToUpload = new FormData();
                    formDataToUpload.append("file", selectedFile);
                    formDataToUpload.append("upload_preset", "coffe_shop");
                    try {
                      const res = await fetch(
                        "https://api.cloudinary.com/v1_1/dp1fm5pqd/image/upload",
                        { method: "POST", body: formDataToUpload }
                      );
                      const data = await res.json();
                      if (data.secure_url) {
                        setUploadedUrl(data.secure_url);
                        setFormData({ ...formData, img: data.secure_url });
                      }
                    } catch (err) {
                      console.error(err);
                    }
                    setIsUploading(false);
                  }}
                >
                  {isUploading ? "loading..." : "Upload"}
                </button>

              </div>
              {uploadedUrl && <img src={uploadedUrl} alt="Preview" className="img-thumbnail mt-2" style={{ maxWidth: '200px' }} />}
            </div>
          </div>
          <button
            type="submit"
            className="btn mt-4 w-100"
            style={{ backgroundColor: "#6F4E37", borderColor: "#6F4E37", color: "#fff" }}
          >
            Preview
          </button>
        </form>
      </div>

      {previewData && (
        <div className="card mt-5 p-4 shadow-sm">
          <h4
            className="text-center"
            style={{ color: "#6F4E37" }}
          >

          </h4>
          <table className="table table-bordered">
            <tbody>
              <tr><th>Name</th><td>{previewData.name}</td></tr>
              <tr><th>Price</th><td>{previewData.price} $</td></tr>
              <tr><th>Image</th><td><img src={previewData.img} alt="Ảnh sản phẩm" style={{ width: '100px' }} /></td></tr>
            </tbody>
          </table>
          <button
            className="btn w-100"
            style={{ backgroundColor: "#6F4E37", borderColor: "#6F4E37", color: "#fff" }}
            onClick={submitProduct}
          >
            Add product
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
