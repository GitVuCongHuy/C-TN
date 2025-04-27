import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Context from '../../Context/Context';
import { Spinner, Alert } from 'react-bootstrap';

const UpdateUser = () => {
    const { token, setAvatar } = useContext(Context);

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        img: '', 
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            setResponseMessage('');
            try {
                const response = await fetch(
                    'http://localhost:8082/api/user_data/get_user',
                    {
                        method: 'POST', 
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setUserData({ ...data, img: data.img || '' });
                    setAvatar(data.img);
                } else {
                    throw new Error(`Failed to load user data (Status: ${response.status})`);
                }
            } catch (error) {
                console.error('Error loading user info:', error);
                setResponseMessage('Could not load user information.');
            } finally {
                setIsLoading(false);
            }
        };
        if (token) { fetchUserData(); }
        else { setResponseMessage('Please log in to view/update your profile.'); }
    }, [token, setAvatar]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResponseMessage('');

        const payload = {
            name: userData.name,
            email: userData.email,
            phone_number: userData.phone_number,
            address: userData.address,
            img: userData.img
        };

        console.log("Submitting JSON payload:", payload); 

        try {
            const response = await fetch('http://localhost:8082/api/user_data/update_user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload), 
            });

            const responseData = await response.json();

            if (response.ok) {
                alert('Update Successful!');
                setUserData({ ...responseData, img: responseData.img || '' });
                setAvatar(responseData.img); 
                console.log("Avatar context updated with URL:", responseData.img);
                navigate('/');
            } else {
                const errorMessage = responseData?.message || `Update failed (Status: ${response.status})`;
                console.error("Update failed:", errorMessage);
                setResponseMessage(errorMessage);
                alert(`Update Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Connection Error:', error);
            const errorMsg = 'Connection error. Please try again.';
            setResponseMessage(errorMsg);
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Update Profile</h2>

            {responseMessage && (
                <Alert variant={responseMessage.toLowerCase().includes('error') || responseMessage.toLowerCase().includes('fail') || responseMessage.toLowerCase().includes('could not') ? 'danger' : 'info'}>
                    {responseMessage}
                </Alert>
            )}

            <form
                className="border p-4 rounded shadow-sm bg-light"
                style={{ maxWidth: '600px', margin: 'auto', marginBottom: '120px' }}
                onSubmit={handleSubmit}
            >
                 <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" id="name" name="name" className="form-control" value={userData.name} onChange={handleChange} required />
                 </div>
                 <div className="mb-3">
                     <label htmlFor="email" className="form-label">Email</label>
                     <input type="email" id="email" name="email" className="form-control" value={userData.email} onChange={handleChange} required />
                 </div>
                 <div className="mb-3">
                     <label htmlFor="phone_number" className="form-label">Phone number</label>
                     <input type="tel" id="phone_number" name="phone_number" className="form-control" value={userData.phone_number} onChange={handleChange} required />
                 </div>
                 <div className="mb-3">
                     <label htmlFor="address" className="form-label">Address</label>
                     <input type="text" id="address" name="address" className="form-control" value={userData.address} onChange={handleChange} required />
                 </div>


                <div className="mb-3">
                    <label htmlFor="img" className="form-label">Profile Image URL</label>
                    <input
                        type="url" 
                        id="img"
                        name="img" 
                        className="form-control"
                        value={userData.img} 
                        onChange={handleChange} 
                        placeholder="Enter image URL (e.g., https://...)"
                    />
                    {userData.img && (
                         <div className="mt-2 text-center">
                             <img
                                 src={userData.img}
                                 alt="Avatar Preview"
                                 style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }}
                                 onError={(e) => {
                                     e.target.onerror = null;
                                     e.target.style.display='none'; 
                                     console.warn("Image URL failed to load:", userData.img);
                                 }}
                                 onLoad={(e) => { e.target.style.display = 'inline-block'; }}
                             />
                         </div>
                     )}
                </div>
                {/* ------------------------------------------- */}

                <button type="submit" className="btn btn-danger w-100" disabled={isLoading}>
                    {isLoading ? (<><Spinner size="sm" className="me-2"/> Updating...</>) : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default UpdateUser;