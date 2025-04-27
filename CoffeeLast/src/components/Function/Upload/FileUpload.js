import React, { useState } from 'react';

function FileUpload({ onFileSelect }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];  
    setSelectedFile(file);
    setError(null); 

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];  
      if (!validTypes.includes(file.type)) {
        setError('Vui lòng chọn tệp ảnh (JPG, PNG, GIF).');  
        setSelectedFile(null);  
      } else {
        onFileSelect(file);  
      }
    } else {
      setError('Vui lòng chọn một tệp ảnh để tải lên.');  
    }
  };
  return (
    <div>
      <input 
        type="file" 
        accept="image/jpeg, image/png, image/gif"  
        onChange={handleFileChange}
      />
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}  
    </div>
  );
}

export default FileUpload;
