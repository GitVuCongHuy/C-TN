import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../../components/Function/Upload/FileUpload';

const AddBranch = () => {
  const [selectedFile, setSelectedFile] = useState(null);  // Store the selected file
  const [uploadedUrl, setUploadedUrl] = useState('');  // Store the uploaded file URL
  const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
  const [isUploading, setIsUploading] = useState(false);  // Track upload state
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_info: '',
    manager: '',
    img: '',
  });
  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setIsUploadSuccessful(false);  
  };

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();

    if (!isUploadSuccessful && !selectedFile) {
      alert('Vui lòng chọn tệp để tải lên!');
      return;
    }

    if (!isUploadSuccessful) {
      setIsUploading(true);
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', selectedFile);
      formDataToUpload.append('upload_preset', 'coffe_shop');  // Upload Preset của Cloudinary

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dp1fm5pqd/image/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (!response.ok) {
          throw new Error('Lỗi khi tải tệp lên Cloudinary!');
        }

        const data = await response.json();
        if (data.secure_url) {
          setUploadedUrl(data.secure_url);
          setFormData((prevData) => ({ ...prevData, img: data.secure_url }));
          setIsUploadSuccessful(true);
        } else {
          alert('Không có URL nào được trả về!');
          setIsUploadSuccessful(false);
        }
      } catch (error) {
        console.error('Lỗi khi tải lên:', error);
        alert('Đã có lỗi xảy ra khi tải lên tệp.');
        setIsUploadSuccessful(false);
      } finally {
        setIsUploading(false);
      }
    }

    if (isUploadSuccessful) {
      if (!formData.name || !formData.location || !formData.contact_info || !formData.manager || !formData.img) {
        setError('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      try {
        setIsUploading(true);
        const response = await fetch(`http://localhost:8082/chain/create_new/${formData.manager}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          alert('Tạo cơ sở thành công!');
          setError(null);
          navigate('/list_base');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Đã có lỗi xảy ra!');
        }
      } catch (error) {
        setError('Tài Khoản Sai');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Add new facility</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleUploadAndSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contact</label>
          <input
            type="text"
            className="form-control"
            value={formData.contact_info}
            onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Manager</label>
          <input
            type="text"
            className="form-control"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isUploading || (!isUploadSuccessful && !selectedFile)}
        >
          {isUploading ? 'Đang tải lên...' : (isUploadSuccessful ? 'Thêm cơ sở' : 'Tải lên')}
        </button>
      </form>
    </div>
  );
};

export default AddBranch;
