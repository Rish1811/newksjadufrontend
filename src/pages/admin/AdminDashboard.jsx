import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../config';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users');
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]); // State for banners
    const [newProduct, setNewProduct] = useState({
        name: '', price: '', category: '', countInStock: '', description: '', overview: '', howToUse: '', bulletPoints: ''
    });
    const [sizes, setSizes] = useState([]);
    const [image, setImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState(null);
    const [newBannerImage, setNewBannerImage] = useState(null); // State for new banner upload
    const [orders, setOrders] = useState([]); // State for orders
    const [trackingInfo, setTrackingInfo] = useState({ shippingDate: '', deliveryDate: '', deliveryTime: '', details: '' }); // State for tracking form
    const [selectedOrderId, setSelectedOrderId] = useState(null); // To show tracking form for specific order
    const [viewOrder, setViewOrder] = useState(null); // State for viewing order details
    const [showViewModal, setShowViewModal] = useState(false); // State for view modal
    const [notification, setNotification] = useState(null); // { message: '', type: 'success' | 'error' }
    const [policyForm, setPolicyForm] = useState({ type: 'terms-of-service', title: '', content: '' });
    const bannerFileInputRef = useRef(null); // Ref for banner file input

    const navigate = useNavigate();
    const adminUser = React.useMemo(() => JSON.parse(localStorage.getItem('adminUser')), []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users`, {
                headers: { Authorization: `Bearer ${adminUser.token}` }
            });
            if (response.ok) setUsers(await response.json());
        } catch (error) { console.error(error); }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/products`);
            if (response.ok) setProducts(await response.json());
        } catch (error) { console.error(error); }
    };

    const fetchPolicy = async (type) => {
        try {
            const response = await fetch(`${API_BASE}/api/policies/${type}`);
            if (response.ok) {
                const data = await response.json();
                setPolicyForm({ type: data.type, title: data.title, content: data.content });
            } else {
                setPolicyForm({ type, title: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), content: '' });
            }
        } catch (error) { console.error(error); }
    };

    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/banners`);
            if (response.ok) setBanners(await response.json());
        } catch (error) { console.error(error); }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/orders`, {
                headers: { Authorization: `Bearer ${adminUser.token}` }
            });
            if (response.ok) setOrders(await response.json());
        } catch (error) { console.error(error); }
    };

    const handleUpdatePolicy = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminUser.token}`
                },
                body: JSON.stringify(policyForm)
            });
            if (res.ok) {
                showNotification('Policy updated successfully');
            } else {
                showNotification('Failed to update policy', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error updating policy', 'error');
        }
    };

    useEffect(() => {
        if (!adminUser || !adminUser.isAdmin) {
            navigate('/admin/login');
            return;
        }
        fetchUsers();
        fetchProducts();
        fetchBanners();
        fetchOrders();
        fetchPolicy('terms-of-service');
        // Initial load only needs to run once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!newBannerImage) return;

        const formData = new FormData();
        formData.append('image', newBannerImage);

        try {
            const res = await fetch(`${API_BASE}/api/banners`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${adminUser.token}` },
                body: formData
            });

            if (res.ok) {
                showNotification('Banner Uploaded Successfully!');
                setNewBannerImage(null);
                if (bannerFileInputRef.current) {
                    bannerFileInputRef.current.value = ''; // Clear file input
                }
                fetchBanners();
            } else {
                showNotification('Failed to upload banner', 'error');
            }
        } catch (error) {
            showNotification('Error uploading banner', 'error');
        }
    };

    const handleDeleteBanner = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/banners/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${adminUser.token}` }
            });
            if (res.ok) {
                showNotification('Banner deleted successfully');
                fetchBanners();
            } else {
                showNotification('Failed to delete banner', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error deleting banner', 'error');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newProduct.name);
        formData.append('price', newProduct.price);
        formData.append('category', newProduct.category);
        formData.append('countInStock', newProduct.countInStock);
        formData.append('description', newProduct.description);
        formData.append('overview', newProduct.overview);
        formData.append('howToUse', newProduct.howToUse);
        const bulletsArray = newProduct.bulletPoints.split(',').map(b => b.trim()).filter(b => b);
        formData.append('bulletPoints', JSON.stringify(bulletsArray));
        formData.append('sizes', JSON.stringify(sizes));

        if (image) formData.append('image', image);
        if (additionalImages) {
            for (let i = 0; i < additionalImages.length; i++) {
                formData.append('additionalImages', additionalImages[i]);
            }
        }

        try {
            const res = await fetch(`${API_BASE}/api/products`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${adminUser.token}` },
                body: formData
            });
            if (res.ok) {
                showNotification('Product Created successfully!');
                setNewProduct({ name: '', price: '', category: '', countInStock: '', description: '', overview: '', howToUse: '', bulletPoints: '' });
                setImage(null);
                setAdditionalImages(null);
                setSizes([]);
                fetchProducts();
            } else {
                showNotification('Failed to create product', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error connecting to server', 'error');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${adminUser.token}` }
            });
            if (res.ok) {
                showNotification('Product deleted successfully');
                fetchProducts();
            } else {
                showNotification('Failed to delete product', 'error');
            }
        } catch (error) { console.error(error); }
    }

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminUser.token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                showNotification(`Order ${status} successfully`);
                fetchOrders();
            }
        } catch (error) { console.error(error); }
    };

    const handleUpdateTracking = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/orders/${selectedOrderId}/track`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${adminUser.token}`
                },
                body: JSON.stringify(trackingInfo)
            });
            if (res.ok) {
                showNotification('Tracking info updated');
                setTrackingInfo({ shippingDate: '', deliveryDate: '', deliveryTime: '', details: '' });
                setSelectedOrderId(null);
                fetchOrders();
            }
        } catch (error) { console.error(error); }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const handleAddSize = () => setSizes([...sizes, { label: '', size: '', price: '', originalPrice: '' }]);
    const handleRemoveSize = (index) => setSizes(sizes.filter((_, i) => i !== index));
    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8', position: 'relative' }}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: notification.type === 'error' ? '#f44336' : '#4caf50',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '5px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    animation: 'fadeIn 0.5s',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>{notification.type === 'error' ? '⚠️' : '✅'}</span>
                    {notification.message}
                </div>
            )}

            <header style={{
                backgroundColor: 'rgb(0, 0, 128)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard</span>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Admin</span>
                </div>
                <button onClick={handleLogout} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
            </header>

            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'users' ? 'rgb(0, 0, 128)' : '#ddd', color: activeTab === 'users' ? 'white' : '#333', cursor: 'pointer', borderRadius: '5px' }}>Users</button>
                    <button onClick={() => setActiveTab('products')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'products' ? 'rgb(0, 0, 128)' : '#ddd', color: activeTab === 'products' ? 'white' : '#333', cursor: 'pointer', borderRadius: '5px' }}>Products</button>
                    <button onClick={() => setActiveTab('banners')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'banners' ? 'rgb(0, 0, 128)' : '#ddd', color: activeTab === 'banners' ? 'white' : '#333', cursor: 'pointer', borderRadius: '5px' }}>Banners</button>
                    <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'orders' ? 'rgb(0, 0, 128)' : '#ddd', color: activeTab === 'orders' ? 'white' : '#333', cursor: 'pointer', borderRadius: '5px' }}>Orders</button>
                    <button onClick={() => setActiveTab('policies')} style={{ padding: '10px 20px', border: 'none', background: activeTab === 'policies' ? 'rgb(0, 0, 128)' : '#ddd', color: activeTab === 'policies' ? 'white' : '#333', cursor: 'pointer', borderRadius: '5px' }}>Policies</button>
                </div>

                {activeTab === 'users' ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                <tr>
                                    <th style={{ padding: '15px', color: '#666', fontWeight: '600' }}>User</th>
                                    <th style={{ padding: '15px', color: '#666', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '15px', color: '#666', fontWeight: '600' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px' }}>{user.name}</td>
                                        <td style={{ padding: '15px' }}>{user.email}</td>
                                        <td style={{ padding: '15px' }}>{user.isAdmin ? 'Admin' : 'Customer'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                No users found.
                            </div>
                        )}
                    </div>
                ) : activeTab === 'products' ? (
                    <div>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h3>Add New Product</h3>
                            <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <input type="text" placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Stock Count" value={newProduct.countInStock} onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />

                                <textarea placeholder="Short Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} style={{ gridColumn: '1 / -1', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Bullet Points (comma separated)" value={newProduct.bulletPoints} onChange={(e) => setNewProduct({ ...newProduct, bulletPoints: e.target.value })} style={{ gridColumn: '1 / -1', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <textarea placeholder="Overview (Details)" value={newProduct.overview} onChange={(e) => setNewProduct({ ...newProduct, overview: e.target.value })} style={{ gridColumn: '1 / -1', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <textarea placeholder="How to Use" value={newProduct.howToUse} onChange={(e) => setNewProduct({ ...newProduct, howToUse: e.target.value })} style={{ gridColumn: '1 / -1', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />

                                <div style={{ gridColumn: '1 / -1', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                                    <h4 style={{ marginBottom: '10px' }}>Sizes / Variants</h4>
                                    {sizes.map((s, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                            <input type="text" placeholder="Label (e.g. Most-Selling)" value={s.label} onChange={(e) => handleSizeChange(index, 'label', e.target.value)} style={{ flex: 1, padding: '5px' }} />
                                            <input type="text" placeholder="Size (e.g. 750ml)" required value={s.size} onChange={(e) => handleSizeChange(index, 'size', e.target.value)} style={{ flex: 1, padding: '5px' }} />
                                            <input type="number" placeholder="Price" required value={s.price} onChange={(e) => handleSizeChange(index, 'price', e.target.value)} style={{ flex: 1, padding: '5px' }} />
                                            <input type="number" placeholder="Orig. Price" value={s.originalPrice} onChange={(e) => handleSizeChange(index, 'originalPrice', e.target.value)} style={{ flex: 1, padding: '5px' }} />
                                            <button type="button" onClick={() => handleRemoveSize(index)} style={{ padding: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px' }}>X</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddSize} style={{ padding: '5px 10px', background: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Size Variant</button>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Main Image</label>
                                    <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ width: '100%' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Images (for gallery)</label>
                                    <input type="file" multiple onChange={(e) => setAdditionalImages(e.target.files)} style={{ width: '100%' }} />
                                </div>

                                <button type="submit" style={{ gridColumn: '1 / -1', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Add Product</button>
                            </form>
                        </div>

                        <h3>Product List</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {products.map(product => (
                                <div key={product._id} style={{ background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                    <img src={`http://localhost:5000${product.image}`} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
                                    <h4>{product.name}</h4>
                                    <p>₹{product.price}</p>
                                    <button onClick={() => handleDeleteProduct(product._id)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                        {products.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                No products found.
                            </div>
                        )}
                    </div>
                ) : activeTab === 'orders' ? (
                    <div>
                        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                    <tr>
                                        <th style={{ padding: '15px' }}>Order ID</th>
                                        <th style={{ padding: '15px' }}>User</th>
                                        <th style={{ padding: '15px' }}>Total</th>
                                        <th style={{ padding: '15px' }}>Status</th>
                                        <th style={{ padding: '15px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px' }}>{order._id}</td>
                                            <td style={{ padding: '15px' }}>{order.user?.name || 'Deleted User'}</td>
                                            <td style={{ padding: '15px' }}>₹{order.totalPrice}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    backgroundColor: order.status === 'Accepted' ? '#d4edda' : order.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                                                    color: order.status === 'Accepted' ? '#155724' : order.status === 'Rejected' ? '#721c24' : '#856404'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button
                                                        onClick={() => {
                                                            setViewOrder(order);
                                                            setShowViewModal(true);
                                                        }}
                                                        style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                                    >
                                                        View
                                                    </button>
                                                    {order.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => handleUpdateStatus(order._id, 'Accepted')} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Accept</button>
                                                            <button onClick={() => handleUpdateStatus(order._id, 'Rejected')} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Reject</button>
                                                        </>
                                                    )}
                                                    {order.status === 'Accepted' && (
                                                        <>
                                                            <button onClick={() => setSelectedOrderId(order._id)} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Track</button>
                                                            <button onClick={() => handleUpdateStatus(order._id, 'Delivered')} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Mark Delivered</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {showViewModal && viewOrder && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3500, backdropFilter: 'blur(5px)' }}>
                                <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '15px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative', color: 'rgb(0, 0, 128)' }}>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}
                                    >&times;</button>

                                    <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Order Details</h2>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                        <div>
                                            <h4 style={{ color: '#666', marginBottom: '5px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Customer</h4>
                                            <p style={{ fontWeight: 'bold', margin: 0 }}>{viewOrder.user?.name || 'Deleted User'}</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>{viewOrder.user?.email}</p>
                                        </div>
                                        <div>
                                            <h4 style={{ color: '#666', marginBottom: '5px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Order Status</h4>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                                backgroundColor: viewOrder.status === 'Delivered' ? '#e2e3e5' : viewOrder.status === 'Accepted' ? '#d4edda' : viewOrder.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                                                color: viewOrder.status === 'Delivered' ? '#383d41' : viewOrder.status === 'Accepted' ? '#155724' : viewOrder.status === 'Rejected' ? '#721c24' : '#856404'
                                            }}>
                                                {viewOrder.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ color: '#666', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Ordered Items</h4>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '10px', padding: '10px' }}>
                                            {viewOrder.orderItems.map((item, index) => (
                                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: index < viewOrder.orderItems.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f9f9f9', borderRadius: '5px', padding: '2px' }}>
                                                            <img src={`http://localhost:5000${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>{item.name}</p>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>₹{item.price} x {item.qty}</p>
                                                        </div>
                                                    </div>
                                                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '0 10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            <span>Total Amount:</span>
                                            <span>₹{viewOrder.totalPrice}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ color: '#666', marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Shipping Address</h4>
                                        <div style={{ backgroundColor: '#f9fbff', padding: '15px', borderRadius: '10px', border: '1px solid #e1e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            <p style={{ margin: 0 }}><strong>Address:</strong> {viewOrder.shippingAddress?.address}</p>
                                            <p style={{ margin: 0 }}><strong>City/PIN:</strong> {viewOrder.shippingAddress?.city} - {viewOrder.shippingAddress?.postalCode}</p>
                                            <p style={{ margin: 0 }}><strong>Phone:</strong> {viewOrder.shippingAddress?.phone}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        style={{ width: '100%', marginTop: '2rem', padding: '12px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >Close Details</button>
                                </div>
                            </div>
                        )}

                        {selectedOrderId && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', width: '400px' }}>
                                    <h3>Update Tracking Info</h3>
                                    <form onSubmit={handleUpdateTracking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                        <label>Shipping Date:</label>
                                        <input type="date" value={trackingInfo.shippingDate} onChange={(e) => setTrackingInfo({ ...trackingInfo, shippingDate: e.target.value })} style={{ padding: '8px' }} />
                                        <label>Expected Delivery Date:</label>
                                        <input type="date" value={trackingInfo.deliveryDate} onChange={(e) => setTrackingInfo({ ...trackingInfo, deliveryDate: e.target.value })} style={{ padding: '8px' }} />
                                        <label>Approx Delivery Time:</label>
                                        <input type="time" value={trackingInfo.deliveryTime} onChange={(e) => setTrackingInfo({ ...trackingInfo, deliveryTime: e.target.value })} style={{ padding: '8px' }} />
                                        <label>Extra Details:</label>
                                        <textarea value={trackingInfo.details} onChange={(e) => setTrackingInfo({ ...trackingInfo, details: e.target.value })} style={{ padding: '8px' }} />
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Save</button>
                                            <button type="button" onClick={() => setSelectedOrderId(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'banners' ? (
                    <div>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h3>Add New Banner</h3>
                            <form onSubmit={handleAddBanner} style={{ marginTop: '1rem' }}>
                                <input
                                    ref={bannerFileInputRef}
                                    type="file"
                                    onChange={(e) => setNewBannerImage(e.target.files[0])}
                                    style={{ marginBottom: '1rem' }}
                                />
                                <button type="submit" style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Upload Banner</button>
                            </form>
                        </div>

                        <h3>Current Banners</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            {banners.map(banner => (
                                <div key={banner._id} style={{ background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', position: 'relative' }}>
                                    <img src={`${API_BASE}${banner.image}`} alt="Banner" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px' }} />
                                    <button
                                        onClick={() => handleDeleteBanner(banner._id)}
                                        style={{
                                            position: 'absolute', top: '15px', right: '15px',
                                            padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                        {banners.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                No banners uploaded.
                            </div>
                        )}
                    </div>
                ) : activeTab === 'policies' ? (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3>Manage Policies</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update your website's legal documents here.</p>

                        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <label style={{ fontWeight: 'bold' }}>Select Policy:</label>
                            <select
                                value={policyForm.type}
                                onChange={(e) => {
                                    setPolicyForm({ ...policyForm, type: e.target.value });
                                    fetchPolicy(e.target.value);
                                }}
                                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                            >
                                <option value="terms-of-service">Terms of Service</option>
                                <option value="refund-policy">Refund & Return Policy</option>
                                <option value="privacy-policy">Privacy Policy</option>
                            </select>
                        </div>

                        <form onSubmit={handleUpdatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Page Title</label>
                                <input
                                    type="text"
                                    value={policyForm.title}
                                    onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content (Supports basic text & line breaks)</label>
                                <textarea
                                    value={policyForm.content}
                                    onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                                    required
                                    rows="15"
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', lineHeight: '1.6', color: '#000' }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '14px',
                                    background: 'rgb(0, 0, 128)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                }}
                            >
                                Save Policy
                            </button>
                        </form>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AdminDashboard;
