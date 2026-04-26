import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE from '../config';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
    });

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const redirectTo = queryParams.get('redirect');

    const { firstName, lastName, email, password, phone } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const url = isLogin
            ? `${API_BASE}/api/auth/login`
            : `${API_BASE}/api/auth/register`;

        const body = isLogin
            ? { email, password }
            : { name: `${firstName} ${lastName}`, email, password, phone };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                if (redirectTo === 'cart') {
                    localStorage.setItem('autoOpenCart', 'true');
                }
                window.location.href = '/';
            } else {
                alert(data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server');
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch user info from Google using the access token
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await res.json();
                
                // Now call our backend with this info
                const backendRes = await fetch(`${API_BASE}/api/auth/social-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: googleUser.email,
                        name: googleUser.name,
                        image: googleUser.picture,
                        provider: 'Google'
                    }),
                });

                const data = await backendRes.json();
                if (backendRes.ok) {
                    localStorage.setItem('user', JSON.stringify(data));
                    window.location.href = '/';
                }
            } catch (err) {
                console.error('Google login error:', err);
                alert('Failed to login with Google');
            }
        },
        onError: () => alert('Google Login Failed'),
    });

    const handleSocialLogin = async (provider) => {
        if (provider === 'Google') {
            loginWithGoogle();
        } else if (provider === 'Apple') {
            alert('Apple Sign-In requires a verified domain and SSL. Please contact support to set this up.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#000',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Element (Subtle Blur) */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'linear-gradient(45deg, #1e3a8a 0%, #701a75 50%, #000 100%)',
                filter: 'blur(100px)',
                opacity: 0.3,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 0
            }}></div>

            {/* Main Auth Card */}
            <div style={{
                width: '100%',
                maxWidth: '460px',
                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '40px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 1,
                position: 'relative'
            }}>
                {/* Close Button */}
                <button 
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '24px',
                        right: '24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#fff',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >✕</button>

                {/* Toggle */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    padding: '4px',
                    borderRadius: '24px',
                    width: 'fit-content',
                    marginBottom: '32px'
                }}>
                    <button 
                        onClick={() => setIsLogin(false)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            backgroundColor: !isLogin ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            color: !isLogin ? '#fff' : '#888',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none'
                        }}
                    >Sign up</button>
                    <button 
                        onClick={() => setIsLogin(true)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '20px',
                            backgroundColor: isLogin ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            color: isLogin ? '#fff' : '#888',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none'
                        }}
                    >Sign in</button>
                </div>

                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>
                    {isLogin ? 'Sign in to account' : 'Create an account'}
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {!isLogin && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <input 
                                type="text" 
                                name="firstName"
                                value={firstName}
                                onChange={onChange}
                                placeholder="John" 
                                style={inputStyle} 
                            />
                            <input 
                                type="text" 
                                name="lastName"
                                value={lastName}
                                onChange={onChange}
                                placeholder="Last name" 
                                style={inputStyle} 
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>✉️</span>
                        <input 
                            type="email" 
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="Enter your email" 
                            style={{ ...inputStyle, paddingLeft: '44px' }} 
                        />
                    </div>

                    {!isLogin && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <div style={{ 
                                position: 'absolute', 
                                left: '16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                color: '#fff',
                                fontSize: '14px'
                            }}>
                                <span style={{ fontSize: '18px' }}>🇺🇸</span>
                                <span>⌄</span>
                            </div>
                            <input 
                                type="tel" 
                                name="phone"
                                value={phone}
                                onChange={onChange}
                                placeholder="(775) 351-6501" 
                                style={{ ...inputStyle, paddingLeft: '70px' }} 
                            />
                        </div>
                    )}

                    <input 
                        type="password" 
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="••••••••" 
                        style={inputStyle} 
                    />

                    <button 
                        type="submit"
                        style={{
                            backgroundColor: '#fff',
                            color: '#000',
                            padding: '14px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '700',
                            border: 'none',
                            marginTop: '8px',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        {isLogin ? 'Sign in' : 'Create an account'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                    <span style={{ color: '#555', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>OR SIGN IN WITH</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button 
                        onClick={() => handleSocialLogin('Google')}
                        style={socialButtonStyle}
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('Apple')}
                        style={socialButtonStyle}
                    >
                        <svg width="20" height="20" viewBox="0 0 384 512" fill="white">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
                        </svg>
                    </button>
                </div>

                <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '32px', lineHeight: '1.5' }}>
                    By creating an account, you agree to our <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Terms & Service</a>
                </p>
            </div>
        </div>
    );
};

const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s'
};

const socialButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
};

export default Login;
