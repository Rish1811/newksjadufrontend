import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../config';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users as UsersIcon, 
    Image as ImageIcon, 
    List, 
    Bell, 
    ShieldCheck, 
    LogOut, 
    Search, 
    MoreVertical,
    TrendingUp,
    DollarSign,
    Users as UsersGroup,
    Plus,
    Trash2,
    Eye,
    ChevronRight,
    CheckCircle,
    XCircle,
    Truck,
    Settings,
    CreditCard
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const AdminDashboard = () => {
    // Auth & Basic State
    const navigate = useNavigate();
    const adminUser = useMemo(() => JSON.parse(localStorage.getItem('adminUser')), []);
    const [activeTab, setActiveTab] = useState('overview');
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [videos, setVideos] = useState([]);
    const [concerns, setConcerns] = useState([]);
    
    // Form States
    const [newProduct, setNewProduct] = useState({
        name: '', price: '', originalPrice: '', category: '', countInStock: '', description: '', overview: '', howToUse: '', bulletPoints: '', displaySection: 'none'
    });
    const [sizes, setSizes] = useState([]);
    const [image, setImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState(null);
    const [newBannerImage, setNewBannerImage] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryFile, setNewCategoryFile] = useState(null);
    const [newCategoryBgColor, setNewCategoryBgColor] = useState('#f3e8ff');
    const [newCategoryBorderColor, setNewCategoryBorderColor] = useState('#8E59A6');
    const [newAnnouncementText, setNewAnnouncementText] = useState('');
    const [policyForm, setPolicyForm] = useState({ type: 'terms-of-service', title: '', content: '' });
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoProductLink, setNewVideoProductLink] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [newConcernTitle, setNewConcernTitle] = useState('');
    const [newConcernLink, setNewConcernLink] = useState('');
    const [concernFile, setConcernFile] = useState(null);
    
    // Order Specific
    const [viewOrder, setViewOrder] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [trackingInfo, setTrackingInfo] = useState({ shippingDate: '', deliveryDate: '', deliveryTime: '', details: '' });

    // Payment Settings State
    const [paymentSettings, setPaymentSettings] = useState({
        isRazorpayEnabled: false,
        environment: 'test',
        testKeyId: '',
        testKeySecret: '',
        liveKeyId: '',
        liveKeySecret: ''
    });

    const bannerFileInputRef = useRef(null);

    // Notifications
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Helper: Image URL
    const getImageUrl = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `${API_BASE}${path}`;
    };

    // Fetching Logic
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${adminUser.token}` };
            
            const [uRes, pRes, bRes, oRes, cRes, aRes, sRes, vRes, conRes] = await Promise.all([
                fetch(`${API_BASE}/api/users`, { headers }),
                fetch(`${API_BASE}/api/products`),
                fetch(`${API_BASE}/api/banners`),
                fetch(`${API_BASE}/api/orders`, { headers }),
                fetch(`${API_BASE}/api/categories`),
                fetch(`${API_BASE}/api/announcements`),
                fetch(`${API_BASE}/api/payment_settings/admin`, { headers }),
                fetch(`${API_BASE}/api/videos`),
                fetch(`${API_BASE}/api/concerns`)
            ]);

            if (uRes.ok) setUsers(await uRes.json());
            if (pRes.ok) setProducts(await pRes.json());
            if (bRes.ok) setBanners(await bRes.json());
            if (oRes.ok) setOrders(await oRes.json());
            if (cRes.ok) setCategories(await cRes.json());
            if (aRes.ok) setAnnouncements(await aRes.json());
            if (sRes.ok) setPaymentSettings(await sRes.json());
            if (vRes.ok) setVideos(await vRes.json());
            if (conRes.ok) setConcerns(await conRes.json());

        } catch (error) {
            console.error('Fetch error:', error);
            showNotification('Failed to sync data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePaymentSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/payment_settings/admin`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminUser.token}` 
                },
                body: JSON.stringify(paymentSettings)
            });
            if (res.ok) {
                showNotification('Payment settings updated');
                fetchData();
            }
        } catch (error) {
            showNotification('Failed to update settings', 'error');
        }
    };

    useEffect(() => {
        if (!adminUser || !adminUser.isAdmin) {
            navigate('/admin/login');
            return;
        }
        fetchData();
        fetchPolicy('terms-of-service');
    }, [adminUser, navigate]);

    // Policies
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

    const handleUpdatePolicy = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/policies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminUser.token}` },
                body: JSON.stringify(policyForm)
            });
            if (res.ok) showNotification('Policy updated');
            else showNotification('Failed to update policy', 'error');
        } catch (error) { showNotification('Error updating policy', 'error'); }
    };

    // Handlers (Simplified for brevity but fully functional)
    const handleLogout = () => { localStorage.removeItem('adminUser'); navigate('/admin/login'); };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newProduct).forEach(key => {
            if (key === 'bulletPoints') {
                formData.append(key, JSON.stringify(newProduct[key].split(',').map(b => b.trim()).filter(b => b)));
            } else {
                formData.append(key, newProduct[key]);
            }
        });
        formData.append('sizes', JSON.stringify(sizes.map(s => ({ label: s.label, size: s.size, price: s.price, originalPrice: s.originalPrice }))));
        sizes.forEach((s, i) => { if (s.imageFile) formData.append(`sizeImage_${i}`, s.imageFile); });
        if (image) formData.append('image', image);
        if (additionalImages) Array.from(additionalImages).forEach(img => formData.append('additionalImages', img));

        const res = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminUser.token}` },
            body: formData
        });
        if (res.ok) {
            showNotification('Product Created!');
            setNewProduct({ name: '', price: '', originalPrice: '', category: '', countInStock: '', description: '', overview: '', howToUse: '', bulletPoints: '', displaySection: 'none' });
            setSizes([]); fetchData();
        } else showNotification('Creation failed', 'error');
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Delete product?')) return;
        const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminUser.token}` } });
        if (res.ok) { showNotification('Product deleted'); fetchData(); }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!newBannerImage) return;
        const formData = new FormData();
        formData.append('image', newBannerImage);
        const res = await fetch(`${API_BASE}/api/banners`, { method: 'POST', headers: { Authorization: `Bearer ${adminUser.token}` }, body: formData });
        if (res.ok) { showNotification('Banner added'); setNewBannerImage(null); fetchData(); }
    };

    const handleDeleteBanner = async (id) => {
        const res = await fetch(`${API_BASE}/api/banners/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminUser.token}` } });
        if (res.ok) { showNotification('Banner deleted'); fetchData(); }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newCategoryName);
        formData.append('bgColor', newCategoryBgColor);
        formData.append('borderColor', newCategoryBorderColor);
        if (newCategoryFile) formData.append('image', newCategoryFile);
        const res = await fetch(`${API_BASE}/api/categories`, { method: 'POST', headers: { Authorization: `Bearer ${adminUser.token}` }, body: formData });
        if (res.ok) { 
            showNotification('Category added'); 
            setNewCategoryName(''); 
            setNewCategoryBgColor('#f3e8ff');
            setNewCategoryBorderColor('#8E59A6');
            fetchData(); 
        }
    };

    const handleDeleteCategory = async (id) => {
        const res = await fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminUser.token}` } });
        if (res.ok) { showNotification('Category deleted'); fetchData(); }
    };

    const handleAddAnnouncement = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_BASE}/api/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminUser.token}` },
            body: JSON.stringify({ text: newAnnouncementText, isActive: true })
        });
        if (res.ok) { showNotification('Announcement added'); setNewAnnouncementText(''); fetchData(); }
    };

    const handleDeleteAnnouncement = async (id) => {
        const res = await fetch(`${API_BASE}/api/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminUser.token}` } });
        if (res.ok) { showNotification('Announcement deleted'); fetchData(); }
    };

    const handleUpdateStatus = async (id, status) => {
        const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminUser.token}` },
            body: JSON.stringify({ status })
        });
        if (res.ok) { showNotification(`Order ${status}`); fetchData(); }
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        if (!videoFile) return;
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', newVideoTitle);
        formData.append('productLink', newVideoProductLink);
        
        const res = await fetch(`${API_BASE}/api/videos`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminUser.token}` },
            body: formData
        });
        if (res.ok) {
            showNotification('Video uploaded!');
            setNewVideoTitle('');
            setNewVideoProductLink('');
            setVideoFile(null);
            fetchData();
        } else {
            showNotification('Upload failed', 'error');
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('Delete this video?')) return;
        const res = await fetch(`${API_BASE}/api/videos/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminUser.token}` }
        });
        if (res.ok) {
            showNotification('Video deleted');
            fetchData();
        }
    };

    const handleAddConcern = async (e) => {
        e.preventDefault();
        if (!concernFile) return;
        const formData = new FormData();
        formData.append('image', concernFile);
        formData.append('title', newConcernTitle);
        formData.append('linkUrl', newConcernLink);
        
        const res = await fetch(`${API_BASE}/api/concerns`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminUser.token}` },
            body: formData
        });
        if (res.ok) {
            showNotification('Concern added!');
            setNewConcernTitle('');
            setNewConcernLink('');
            setConcernFile(null);
            fetchData();
        } else {
            showNotification('Upload failed', 'error');
        }
    };

    const handleDeleteConcern = async (id) => {
        if (!window.confirm('Delete this concern?')) return;
        const res = await fetch(`${API_BASE}/api/concerns/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminUser.token}` }
        });
        if (res.ok) {
            showNotification('Concern deleted');
            fetchData();
        }
    };

    // Dashboard Analysis REAL Data
    const realAnalysisData = useMemo(() => {
        if (!orders.length) return [];
        
        // Last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toISOString().split('T')[0],
                sales: 0,
                orders: 0
            };
        }).reverse();

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
            const dayEntry = last7Days.find(d => d.fullDate === orderDate);
            if (dayEntry) {
                dayEntry.sales += order.totalPrice;
                dayEntry.orders += 1;
            }
        });

        return last7Days;
    }, [orders]);

    const categoryDistribution = useMemo(() => {
        return categories.map(c => ({
            name: c.name,
            value: products.filter(p => p.category === c.name).length
        })).filter(item => item.value > 0);
    }, [categories, products]);

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    // Sub-components
    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div style={{
            background: 'rgba(26, 35, 51, 0.8)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '10px', background: `${color}22`, borderRadius: '12px' }}>
                    <Icon size={24} color={color} />
                </div>
                {trend && (
                    <span style={{ fontSize: '0.8rem', color: trend > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <p style={{ color: '#44516d', fontSize: '0.9rem', marginBottom: '4px', fontWeight: '600' }}>{title}</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{value}</h3>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Summary Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <StatCard title="Total Sales" value={`₹${orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()}`} icon={DollarSign} color="#10b981" />
                            <StatCard title="Total Orders" value={orders.length} icon={ShoppingCart} color="#6366f1" />
                            <StatCard title="Total Users" value={users.length} icon={UsersGroup} color="#f59e0b" />
                            <StatCard title="Active Products" value={products.length} icon={Package} color="#ec4899" />
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                            <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sales Performance (Last 7 Days)</h3>
                                <div style={{ height: '300px' }}>
                                    {realAnalysisData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={realAnalysisData}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Area type="monotone" dataKey="sales" stroke="#6366f1" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>No order data available</div>}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Category Mix</h3>
                                <div style={{ height: '300px' }}>
                                    {categoryDistribution.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {categoryDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>No products yet</div>}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Transactions</h3>
                                <button onClick={() => setActiveTab('orders')} style={{ color: '#6366f1', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>View All</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        <th style={{ padding: '12px' }}>Order ID</th>
                                        <th style={{ padding: '12px' }}>Customer</th>
                                        <th style={{ padding: '12px' }}>Amount</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 5).map(o => (
                                        <tr key={o._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', fontSize: '0.9rem', color: '#94a3b8' }}>#{o._id.slice(-6)}</td>
                                            <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: '600' }}>{o.user?.name || 'Guest'}</td>
                                            <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: '800', color: '#10b981' }}>₹{o.totalPrice}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    background: o.status === 'Accepted' ? '#10b98122' : o.status === 'Delivered' ? '#6366f122' : '#f59e0b22',
                                                    color: o.status === 'Accepted' ? '#10b981' : o.status === 'Delivered' ? '#6366f1' : '#f59e0b'
                                                }}>
                                                    {o.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'products':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                                <div style={{ background: '#ec489922', padding: '10px', borderRadius: '10px' }}><Package color="#ec4899" /></div>
                                <h2>Add New Product</h2>
                            </div>
                            <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <input type="number" placeholder="Selling Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                <input type="number" placeholder="Original Price (MRP)" value={newProduct.originalPrice} onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })} required style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                <select 
                                    value={newProduct.category} 
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} 
                                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                                <select 
                                    value={newProduct.displaySection} 
                                    onChange={(e) => setNewProduct({ ...newProduct, displaySection: e.target.value })} 
                                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option value="none">Normal Section</option>
                                    <option value="moms_favorite">Mom's Favorite</option>
                                    <option value="new_launch">New Launched</option>
                                    <option value="mega_saver">Mega Saver Pack</option>
                                    <option value="super_saver_refills">Super Saver Refills</option>
                                </select>
                                <input type="number" placeholder="Stock Count" value={newProduct.countInStock} onChange={(e) => setNewProduct({ ...newProduct, countInStock: e.target.value })} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                
                                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Catchy Overview (e.g. What if clean meant safer homes?)" 
                                        value={newProduct.overview} 
                                        onChange={(e) => setNewProduct({ ...newProduct, overview: e.target.value })} 
                                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} 
                                    />
                                    
                                    <textarea 
                                        placeholder="Detailed Description" 
                                        value={newProduct.description} 
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', minHeight: '100px' }} 
                                    />

                                    <textarea 
                                        placeholder="How to Use (Instructions)" 
                                        value={newProduct.howToUse} 
                                        onChange={(e) => setNewProduct({ ...newProduct, howToUse: e.target.value })} 
                                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', minHeight: '80px' }} 
                                    />

                                    <input 
                                        type="text" 
                                        placeholder="Features / Bullet Points (separate with commas, e.g. Eco-friendly, Strong scent)" 
                                        value={newProduct.bulletPoints} 
                                        onChange={(e) => setNewProduct({ ...newProduct, bulletPoints: e.target.value })} 
                                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} 
                                    />
                                </div>
                                
                                <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Product Variants (Sizes)</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {sizes.map((s, i) => (
                                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                                                <input type="text" placeholder="Size (e.g. 500ml)" value={s.size} onChange={e => {
                                                    const newSizes = [...sizes]; newSizes[i].size = e.target.value; setSizes(newSizes);
                                                }} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                <input type="number" placeholder="Price" value={s.price} onChange={e => {
                                                    const newSizes = [...sizes]; newSizes[i].price = e.target.value; setSizes(newSizes);
                                                }} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                <input type="number" placeholder="MRP" value={s.originalPrice} onChange={e => {
                                                    const newSizes = [...sizes]; newSizes[i].originalPrice = e.target.value; setSizes(newSizes);
                                                }} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                <input type="text" placeholder="Badge (e.g. Best Selling)" value={s.label} onChange={e => {
                                                    const newSizes = [...sizes]; newSizes[i].label = e.target.value; setSizes(newSizes);
                                                }} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                                                <button type="button" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setSizes([...sizes, { size: '', price: '', originalPrice: '', label: '' }])} style={{ alignSelf: 'flex-start', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>+ Add Variant</button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Main Product Photo</label>
                                        <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Additional Side Photos (Gallery)</label>
                                        <input type="file" multiple onChange={(e) => setAdditionalImages(e.target.files)} style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
                                    </div>
                                </div>
                                <button type="submit" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.2)' }}>Create Professional Listing</button>
                            </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            {products.map(p => (
                                <div key={p._id} style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '140px', background: '#fff', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden', padding: '10px' }}>
                                        <img src={getImageUrl(p.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <h4 style={{ marginBottom: '4px' }}>{p.name}</h4>
                                    <p style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '12px' }}>₹{p.price}</p>
                                    <button onClick={() => handleDeleteProduct(p._id)} style={{ width: '100%', background: '#ef444422', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                            <div style={{ background: '#6366f122', padding: '10px', borderRadius: '10px' }}><ShoppingCart color="#6366f1" /></div>
                            <h2>Manage Orders</h2>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '15px' }}>Date</th>
                                    <th style={{ padding: '15px' }}>Customer</th>
                                    <th style={{ padding: '15px' }}>Items</th>
                                    <th style={{ padding: '15px' }}>Amount</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                    <th style={{ padding: '15px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px', fontSize: '0.9rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem' }}>{o.user?.name || 'Guest'}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem' }}>{o.orderItems.length}</td>
                                        <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>₹{o.totalPrice}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem',
                                                background: o.status === 'Delivered' ? '#10b98122' : '#6366f122',
                                                color: o.status === 'Delivered' ? '#10b981' : '#6366f1'
                                            }}>{o.status}</span>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => { setViewOrder(o); setShowViewModal(true); }} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><Eye size={18} /></button>
                                                {o.status === 'Pending' && <button onClick={() => handleUpdateStatus(o._id, 'Accepted')} style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}><CheckCircle size={18} /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'categories':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3>Add Category</h3>
                            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required style={{ flex: 1, minWidth: '200px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', padding: '8px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Background:</label>
                                    <input type="color" value={newCategoryBgColor} onChange={(e) => setNewCategoryBgColor(e.target.value)} style={{ width: '40px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#0f172a', padding: '8px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Border:</label>
                                    <input type="color" value={newCategoryBorderColor} onChange={(e) => setNewCategoryBorderColor(e.target.value)} style={{ width: '40px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }} />
                                </div>
                                <input type="file" onChange={(e) => setNewCategoryFile(e.target.files[0])} style={{ color: '#94a3b8' }} />
                                <button type="submit" style={{ background: '#f59e0b', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Add</button>
                            </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {categories.map(c => (
                                <div key={c._id} style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ 
                                        width: '45px', 
                                        height: '45px', 
                                        borderRadius: '50%', 
                                        background: c.bgColor || '#f3e8ff', 
                                        border: `2px solid ${c.borderColor || '#8E59A6'}`, 
                                        padding: '5px', 
                                        overflow: 'hidden' 
                                    }}>
                                        <img src={getImageUrl(c.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <span style={{ flex: 1, fontWeight: '600' }}>{c.name}</span>
                                    <button onClick={() => handleDeleteCategory(c._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'ticker':
                return (
                    <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3>Announcement Bar</h3>
                        <form onSubmit={handleAddAnnouncement} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
                            <input type="text" placeholder="Add announcement..." value={newAnnouncementText} onChange={(e) => setNewAnnouncementText(e.target.value)} required style={{ flex: 1, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                            <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '0 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>Add</button>
                        </form>
                        {announcements.map(a => (
                            <div key={a._id} style={{ background: '#0f172a', padding: '12px 20px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{a.text}</span>
                                <button onClick={() => handleDeleteAnnouncement(a._id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                );
            case 'users':
                return (
                    <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                            <div style={{ background: '#f59e0b22', padding: '10px', borderRadius: '10px' }}><UsersGroup color="#f59e0b" /></div>
                            <h2>System Users</h2>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '15px' }}>Name</th>
                                    <th style={{ padding: '15px' }}>Email</th>
                                    <th style={{ padding: '15px' }}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>{u.name}</td>
                                        <td style={{ padding: '15px' }}>{u.email}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem',
                                                background: u.isAdmin ? '#ec489922' : '#94a3b822',
                                                color: u.isAdmin ? '#ec4899' : '#94a3b8'
                                            }}>{u.isAdmin ? 'Administrator' : 'Customer'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'banners':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3>Upload Homepage Banner</h3>
                            <form onSubmit={handleAddBanner} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <input type="file" onChange={(e) => setNewBannerImage(e.target.files[0])} style={{ color: '#94a3b8' }} />
                                <button type="submit" style={{ background: '#6366f1', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>Upload</button>
                            </form>
                        </div>
                        {banners.map(b => (
                            <div key={b._id} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <img src={getImageUrl(b.image)} alt="" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                                <button onClick={() => handleDeleteBanner(b._id)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px' }}><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>
                );
            case 'policies':
                return (
                    <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                            <div style={{ background: '#10b98122', padding: '10px', borderRadius: '10px' }}><ShieldCheck color="#10b981" /></div>
                            <h2>Legal Policies</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                            {['terms-of-service', 'privacy-policy', 'refund-policy', 'shipping-policy'].map(p => (
                                <button key={p} onClick={() => fetchPolicy(p)} style={{ 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    background: policyForm.type === p ? '#10b981' : '#0f172a',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}>{p.replace('-', ' ')}</button>
                            ))}
                        </div>
                        <form onSubmit={handleUpdatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input type="text" value={policyForm.title} onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }} />
                            <textarea value={policyForm.content} onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff', minHeight: '400px', lineHeight: '1.6' }} />
                            <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>Update Policy</button>
                        </form>
                    </div>
                );
            case 'payments':
                return (
                    <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ background: '#10b98122', padding: '10px', borderRadius: '12px' }}><CreditCard color="#10b981" /></div>
                                <h2 style={{ fontSize: '1.4rem' }}>RAZOR PAY</h2>
                            </div>
                            <div 
                                onClick={() => setPaymentSettings({ ...paymentSettings, isRazorpayEnabled: !paymentSettings.isRazorpayEnabled })}
                                style={{ 
                                    width: '60px', height: '32px', borderRadius: '20px', padding: '4px', cursor: 'pointer',
                                    background: paymentSettings.isRazorpayEnabled ? '#10b981' : '#1e293b',
                                    display: 'flex', alignItems: 'center', transition: 'all 0.3s',
                                    justifyContent: paymentSettings.isRazorpayEnabled ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: '40px', filter: 'brightness(0) invert(1)' }} />
                        </div>

                        <form onSubmit={handleSavePaymentSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>Razor Pay Environment</label>
                                <select 
                                    value={paymentSettings.environment} 
                                    onChange={(e) => setPaymentSettings({ ...paymentSettings, environment: e.target.value })}
                                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                >
                                    <option value="test">Test</option>
                                    <option value="production">Live</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>Razor Pay Test API Key</label>
                                    <input type="text" placeholder="Enter Razor Pay Test API Key" value={paymentSettings.testKeyId} onChange={(e) => setPaymentSettings({ ...paymentSettings, testKeyId: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>Razor pay Test Secret Key</label>
                                    <input type="password" placeholder="Enter Razor pay Test Secret Key" value={paymentSettings.testKeySecret} onChange={(e) => setPaymentSettings({ ...paymentSettings, testKeySecret: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: '#fff' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>Razor Pay Live API Key</label>
                                    <input type="text" placeholder="Enter Razor Pay Live API Key" value={paymentSettings.liveKeyId} onChange={(e) => setPaymentSettings({ ...paymentSettings, liveKeyId: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '10px', fontWeight: '600' }}>Razor Pay Secret Key</label>
                                    <input type="password" placeholder="Enter Razor Pay Secret Key" value={paymentSettings.liveKeySecret} onChange={(e) => setPaymentSettings({ ...paymentSettings, liveKeySecret: e.target.value })} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', color: '#fff' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" style={{ background: '#6366f1', color: '#fff', padding: '12px 40px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>Save Settings</button>
                            </div>
                        </form>
                    </div>
                );
            case 'videos':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3>Upload Reel</h3>
                            <form onSubmit={handleAddVideo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <input type="text" placeholder="Title" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} required style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                <select 
                                    value={newVideoProductLink} 
                                    onChange={(e) => setNewVideoProductLink(e.target.value)} 
                                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option value="">Link to Product (Optional)</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                                <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} style={{ color: '#94a3b8' }} />
                                <button type="submit" style={{ background: '#ec4899', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>Upload Video</button>
                            </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {videos.map(v => (
                                <div key={v._id} style={{ background: 'rgba(26, 35, 51, 0.8)', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                                    <video src={v.videoUrl} style={{ width: '100%', height: '300px', objectFit: 'cover' }} muted onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                                    <div style={{ padding: '10px' }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</p>
                                        <button onClick={() => handleDeleteVideo(v._id)} style={{ width: '100%', marginTop: '10px', background: '#ef444422', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'concerns':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3>Add New Concern</h3>
                            <form onSubmit={handleAddConcern} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <input type="text" placeholder="Title (e.g. Grease and Grime)" value={newConcernTitle} onChange={(e) => setNewConcernTitle(e.target.value)} required style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                <input type="text" placeholder="Link URL (e.g. /shop?query=kitchen)" value={newConcernLink} onChange={(e) => setNewConcernLink(e.target.value)} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#fff' }} />
                                <input type="file" accept="image/*" onChange={(e) => setConcernFile(e.target.files[0])} required style={{ color: '#94a3b8' }} />
                                <button type="submit" style={{ background: '#f59e0b', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}>Add Concern</button>
                            </form>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {concerns.map(c => (
                                <div key={c._id} style={{ background: 'rgba(26, 35, 51, 0.8)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                                        <img src={c.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 'bold' }}>{c.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#475569' }}>{c.linkUrl}</p>
                                    </div>
                                    <button onClick={() => handleDeleteConcern(c._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div>Under construction</div>;
        }
    };

    const SidebarItem = ({ icon: Icon, label, id, color }) => (
        <div 
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === id ? `${color}22` : 'transparent',
                color: activeTab === id ? color : '#94a3b8',
                marginBottom: '4px'
            }}
            onMouseOver={(e) => { if(activeTab !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseOut={(e) => { if(activeTab !== id) e.currentTarget.style.background = 'transparent'; }}
        >
            <Icon size={20} />
            <span style={{ fontSize: '0.95rem', fontWeight: activeTab === id ? '700' : '500' }}>{label}</span>
            {activeTab === id && <div style={{ marginLeft: 'auto', width: '4px', height: '16px', background: color, borderRadius: '2px' }} />}
        </div>
    );

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            backgroundColor: '#0b1120', // Darker navy background
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                backgroundColor: '#0f172a', // Solid dark sidebar
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
            }}>
                <style>{`
                    aside::-webkit-scrollbar {
                        width: 6px;
                    }
                    aside::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    aside::-webkit-scrollbar-thumb {
                        background-color: rgba(255,255,255,0.1);
                        border-radius: 30px;
                    }
                `}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem', padding: '0 10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>K'S JADU</h1>
                </div>

                <div style={{ flex: 1 }}>
                    <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '10px' }}>Dashboard</p>
                    <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" color="#6366f1" />
                    
                    <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: '2rem 0 1rem', paddingLeft: '10px' }}>Management</p>
                    <SidebarItem icon={Package} label="Products" id="products" color="#ec4899" />
                    <SidebarItem icon={ShoppingCart} label="Orders" id="orders" color="#6366f1" />
                    <SidebarItem icon={UsersIcon} label="Users" id="users" color="#f59e0b" />
                    <SidebarItem icon={CreditCard} label="Payments" id="payments" color="#10b981" />
                    
                    <p style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: '2rem 0 1rem', paddingLeft: '10px' }}>UI Elements</p>
                    <SidebarItem icon={ImageIcon} label="Banners" id="banners" color="#3b82f6" />
                    <SidebarItem icon={Eye} label="Videos/Reels" id="videos" color="#ec4899" />
                    <SidebarItem icon={List} label="Concerns" id="concerns" color="#f59e0b" />
                    <SidebarItem icon={List} label="Categories" id="categories" color="#f59e0b" />
                    <SidebarItem icon={Bell} label="Top Ticker" id="ticker" color="#10b981" />
                    <SidebarItem icon={ShieldCheck} label="Policies" id="policies" color="#10b981" />
                </div>

                <button onClick={handleLogout} style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '20px'
                }}>
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{
                    height: '80px',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(11, 17, 32, 0.8)',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 90,
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} size={18} />
                        <input 
                            type="text" 
                            placeholder="Search data, reports, orders..." 
                            style={{ 
                                width: '100%', 
                                background: '#0f172a', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                padding: '10px 10px 10px 40px', 
                                borderRadius: '10px',
                                color: '#fff'
                            }} 
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="#94a3b8" />
                            <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #0b1120' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{adminUser.name}</p>
                                <p style={{ fontSize: '0.7rem', color: '#475569' }}>Administrator</p>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {adminUser.name[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <main style={{ padding: '2rem', maxWidth: '1400px' }}>
                    {renderContent()}
                </main>
            </div>

            {/* View Order Modal */}
            {showViewModal && viewOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3500, backdropFilter: 'blur(5px)' }}>
                    <div style={{ backgroundColor: '#1a2333', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '700px', border: '1px solid rgba(255,255,255,0.1)' }}>
                         {/* Modal Content - Restyled for Dark Mode */}
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                             <h2>Order #{viewOrder._id.slice(-8)}</h2>
                             <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><XCircle /></button>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                             <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px' }}>
                                 <p style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>Customer Info</p>
                                 <p style={{ fontWeight: 'bold' }}>{viewOrder.user?.name}</p>
                                 <p style={{ color: '#94a3b8' }}>{viewOrder.user?.email}</p>
                                 <p style={{ marginTop: '10px', color: '#94a3b8' }}>{viewOrder.shippingAddress.phone}</p>
                             </div>
                             <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px' }}>
                                 <p style={{ color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px' }}>Status</p>
                                 <h3 style={{ color: '#10b981' }}>{viewOrder.status}</h3>
                                 <p style={{ marginTop: '10px', color: '#94a3b8' }}>{viewOrder.shippingAddress.city}, {viewOrder.shippingAddress.postalCode}</p>
                             </div>
                         </div>
                         <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '2rem' }}>
                             {viewOrder.orderItems.map((item, idx) => (
                                 <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                     <div style={{ width: '50px', height: '50px', background: '#fff', borderRadius: '8px', padding: '5px' }}>
                                         <img src={getImageUrl(item.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                     </div>
                                     <div style={{ flex: 1 }}>
                                         <p style={{ fontWeight: 'bold' }}>{item.name}</p>
                                         <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>₹{item.price} x {item.qty}</p>
                                     </div>
                                     <p style={{ fontWeight: 'bold' }}>₹{item.price * item.qty}</p>
                                 </div>
                             ))}
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: '800' }}>
                             <span>Total</span>
                             <span style={{ color: '#6366f1' }}>₹{viewOrder.totalPrice}</span>
                         </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    background: notification.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#fff', padding: '16px 24px', borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 4000,
                    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    {notification.type === 'error' ? <XCircle /> : <CheckCircle />}
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
