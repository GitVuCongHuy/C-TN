import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_info: '',
    img: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('http://localhost:8082/chain/get_all', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Gửi dữ liệu nếu cần thiết
        });

        if (response.ok) {
          const data = await response.json();
          setBranches(
            data.map((item) => ({
              id: item.chain_id,
              name: item.name,
              location: item.location || 'Không có địa điểm',
              contact_info: item.contact_info || 'Không có thông tin liên hệ',
              img: item.img || 'https://via.placeholder.com/150',
            }))
          );
        } else {
          console.error('Lỗi khi lấy dữ liệu từ server');
        }
      } catch (error) {
        console.error('Lỗi kết nối:', error);
      }
    };

    fetchBranches();
  }, []);

  const handleEdit = (branch) => {
    setEditId(branch.id);
    setFormData({ ...branch });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location || !formData.contact_info || !formData.img) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8082/chain/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chain_id: editId,
          name: formData.name,
          location: formData.location,
          contact_info: formData.contact_info,
          img: formData.img,
        }),
      });
  
      if (response.ok) {
        const updatedBranch = await response.json();
        setBranches((prevBranches) =>
          prevBranches.map((branch) =>
            branch.id === editId ? { ...branch, ...formData } : branch
          )
        );
        setEditId(null);
        setFormData({ name: '', location: '', contact_info: '', img: '' });
      } else {
        console.error('Error updating branch');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setFormData({ name: '', location: '', contact_info: '', img: '' });
  };

  const handleDeleteBranch = async (branchId) => {
    if (window.confirm('Bạn có chắc muốn xóa cơ sở này không?')) {
      try {
        const response = await fetch(`http://localhost:8082/chain/delete/${branchId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          setBranches((prevBranches) =>
            prevBranches.filter((branch) => branch.id !== branchId)
          );
        } else {
          console.error('Error deleting branch');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleAddBranch = () => {
    navigate(`/add-branch`);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Danh sách cơ sở</h2>
      <button className="btn btn-success mb-3" onClick={handleAddBranch}>
        Thêm cơ sở mới
      </button>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Cơ sở</th>
            <th>Liên hệ</th>
            <th>Ảnh</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              {editId === branch.id ? (
                <>
                  <td>{branch.id}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact_info}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_info: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.img}
                      onChange={(e) =>
                        setFormData({ ...formData, img: e.target.value })
                      }
                    />
                  </td>
                  {/* <td>
                    <button className="btn btn-success me-2" onClick={handleSave}>
                      Save
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancel}>
                      CanC
                    </button>
                  </td> */}
                </>
              ) : (
                <>
                  <td>{branch.id}</td>
                  <td>{branch.name}</td>
                  <td>{branch.location}</td>
                  <td>{branch.contact_info}</td>
                  <td>
                    <img
                      src={branch.img}
                      alt={branch.name}
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>
                    <div className="d-flex justify-content-between">
                      {/* <button
                        className="btn btn-warning w-100 me-2"
                        onClick={() => handleEdit(branch)}
                      >
                        Edit
                      </button> */}
                      <button
                        className="btn btn-danger w-100"
                        onClick={() => handleDeleteBranch(branch.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchList;
