import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../api/client';
import { useApp } from '../context/AppContext';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ProfileSidebar = ({ isOpen, onClose, onLogout }) => {
    const { user, login, toast } = useApp();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Revoke the object URL when the preview changes, or the browser leaks it.
    useEffect(() => {
        if (!file) return undefined;
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        if (!selected.type.startsWith('image/')) {
            toast('Please choose an image file.', 'error');
            return;
        }
        if (selected.size > MAX_AVATAR_BYTES) {
            toast('That image is larger than 5MB.', 'error');
            return;
        }
        setFile(selected);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const data = await api.upload('/api/users/profile/image', formData);
            // Persist through the context so the header avatar updates too.
            login({ ...user, image: data.image });
            setFile(null);
            toast('Profile photo updated');
        } catch (err) {
            toast(err.message || 'Upload failed.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // user.image is an absolute URL for Google accounts and Vercel Blob alike;
    // imageUrl only prefixes genuinely relative paths.
    const avatar = preview || (user?.image ? imageUrl(user.image, null) : null);

    return (
        <>
            {isOpen && <div className="overlay" onClick={onClose} aria-hidden="true" />}

            <aside
                className={`drawer ${isOpen ? 'drawer--open' : ''}`}
                style={{ maxWidth: 340, padding: '2rem 1.5rem', alignItems: 'center' }}
                role="dialog"
                aria-modal="true"
                aria-label="Your profile"
                aria-hidden={!isOpen}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close profile"
                    style={{ position: 'absolute', top: 16, right: 16, fontSize: '1.2rem', color: 'var(--color-text-muted)' }}
                >
                    ✕
                </button>

                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.75rem', alignSelf: 'flex-start' }}>My profile</h2>

                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <div
                        style={{
                            width: 116, height: 116, borderRadius: '50%', overflow: 'hidden',
                            border: '3px solid var(--color-border)', display: 'grid', placeItems: 'center',
                            backgroundColor: 'var(--color-surface-alt)',
                        }}
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 66, height: 66 }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        )}
                    </div>

                    <label
                        style={{
                            position: 'absolute', bottom: 2, right: 2,
                            backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)',
                            width: 34, height: 34, borderRadius: '50%',
                            display: 'grid', placeItems: 'center', cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)', fontSize: '0.9rem',
                        }}
                    >
                        📷
                        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Change profile photo</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                </div>

                {file && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                        <button type="button" className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                            {uploading ? 'Uploading…' : 'Save photo'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setFile(null)} disabled={uploading} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            Cancel
                        </button>
                    </div>
                )}

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>{user?.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center', wordBreak: 'break-word' }}>
                    {user?.email}
                </p>

                <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Link to="/my-orders" onClick={onClose} className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>📦 My orders</Link>
                    <Link to="/shop" onClick={onClose} className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>🛍️ Continue shopping</Link>
                    {user?.isAdmin && (
                        <Link to="/admin/dashboard" onClick={onClose} className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>⚙️ Admin dashboard</Link>
                    )}
                </nav>

                <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="btn btn-block"
                        style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
                    >
                        🚪 Sign out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ProfileSidebar;
