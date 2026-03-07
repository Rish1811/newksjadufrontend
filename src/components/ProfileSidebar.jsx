import React, { useState, useEffect } from 'react';
import API_BASE from '../config';

const ProfileSidebar = ({ isOpen, onClose, user, onLogout, onUpdateUser }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user?.image ? `${API_BASE}${user.image}` : null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.image) {
            setPreview(`${API_BASE}${user.image}`);
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append('image', image);

        setLoading(true);
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const response = await fetch(`${API_BASE}/api/users/profile/image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                // Update local user state
                const updatedUser = { ...user, image: data.image };
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updatedUser }));
                onUpdateUser(updatedUser);
                alert('Profile image updated!');
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: isOpen ? 0 : '-350px',
            width: '320px',
            height: '100vh',
            backgroundColor: 'white',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
            transition: 'right 0.3s ease',
            zIndex: 1001,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                }}
            >
                ✕
            </button>

            <h2 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Profile</h2>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #f0f0f0',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    {preview ? (
                        <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    )}
                </div>

                <label style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                    📷
                    <input type="file" style={{ display: 'none' }} onChange={handleImageChange} accept="image/*" />
                </label>
            </div>

            {image && (
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    style={{
                        marginBottom: '1rem',
                        padding: '8px 16px',
                        backgroundColor: 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Uploading...' : 'Save Photo'}
                </button>
            )}

            <h3 style={{ fontSize: '1.4rem', color: '#333', marginBottom: '0.5rem' }}>{user?.name}</h3>
            <p style={{ color: '#666', marginBottom: '3rem' }}>{user?.email}</p>

            <div style={{ width: '100%', borderTop: '1px solid #eee', paddingTop: '2rem', marginTop: 'auto' }}>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#fee',
                        color: '#d32f2f',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfileSidebar;
