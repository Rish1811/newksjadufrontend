import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const data = await api.post('/api/auth/login', { email, password }, { auth: false });

            if (!data.isAdmin) {
                // Same wording as a bad password, so this form can't be used to
                // work out which accounts have admin rights.
                setError('Invalid email or password.');
                return;
            }

            localStorage.setItem('adminUser', JSON.stringify(data));
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Could not sign in.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', backgroundColor: '#101c4e', padding: 20 }}>
            <div
                style={{
                    backgroundColor: '#fff',
                    padding: 'clamp(24px, 5vw, 44px)',
                    borderRadius: 18,
                    boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
                    width: '100%',
                    maxWidth: 400,
                    textAlign: 'center',
                    color: '#14161a',
                }}
            >
                <img src="/logo.png" alt="" width="56" height="56" style={{ height: 56, width: 'auto', marginBottom: '1.25rem' }} />
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 6 }}>Owner Administration</h1>
                <p style={{ color: '#5b6472', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Sign in to manage the store.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    <div className="field">
                        <label className="field__label" htmlFor="admin-email" style={{ color: '#5b6472' }}>Admin email</label>
                        <input
                            id="admin-email" className="input" type="email" required autoComplete="username"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            style={{ background: '#fff', color: '#14161a', borderColor: '#e3e6ec' }}
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="admin-password" style={{ color: '#5b6472' }}>Password</label>
                        <input
                            id="admin-password" className="input" type="password" required autoComplete="current-password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            style={{ background: '#fff', color: '#14161a', borderColor: '#e3e6ec' }}
                        />
                    </div>

                    {error && (
                        <p role="alert" style={{ color: '#b02a37', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            backgroundColor: '#101c4e', color: '#fff', padding: 13,
                            borderRadius: 10, fontSize: '1rem', fontWeight: 700, marginTop: 6,
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? 'Signing in…' : 'Access dashboard'}
                    </button>
                </form>

                <Link to="/" style={{ display: 'inline-block', marginTop: '1.5rem', fontSize: '0.85rem', color: '#5b6472' }}>
                    ← Back to store
                </Link>
            </div>
        </div>
    );
};

export default AdminLogin;
