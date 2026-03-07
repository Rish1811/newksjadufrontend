import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const { name, email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isLogin
            ? `${API_BASE}/api/auth/login`
            : `${API_BASE}/api/auth/register`;

        const body = isLogin
            ? { email, password }
            : { name, email, password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Success! Welcome ${data.name}`);
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/'; // Simple redirect
            } else {
                alert(data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server');
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: 'calc(100vh - 80px)', // Minus navbar height
            backgroundColor: '#f8f9fa'
        }}>
            {/* Left Side - Image */}
            <div className="login-image-section" style={{
                flex: 1,
                backgroundImage: 'url(/login-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 128, 0.4)' // Navy overlay
                }}></div>

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        Join the Revolution
                    </h2>
                    <p style={{ fontSize: '1.2rem', maxWidth: '400px', margin: '0 auto', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                        Discover plant-based power for a cleaner, safer home today.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: 'white'
            }}>
                <div style={{ width: '100%', maxWidth: '450px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </h1>
                        <p style={{ color: '#666' }}>
                            {isLogin ? 'Please enter your details to sign in.' : 'Fili in the form below to get started.'}
                        </p>
                    </div>

                    {/* Toggle Buttons */}
                    <div style={{
                        display: 'flex',
                        backgroundColor: '#f1f1f1',
                        padding: '5px',
                        borderRadius: '50px',
                        marginBottom: '2rem'
                    }}>
                        <button
                            onClick={() => setIsLogin(true)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '50px',
                                border: 'none',
                                backgroundColor: isLogin ? 'white' : 'transparent',
                                color: isLogin ? 'var(--color-primary)' : '#666',
                                fontWeight: '600',
                                boxShadow: isLogin ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '50px',
                                border: 'none',
                                backgroundColor: !isLogin ? 'white' : 'transparent',
                                color: !isLogin ? 'var(--color-primary)' : '#666',
                                fontWeight: '600',
                                boxShadow: !isLogin ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {!isLogin && (
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={onChange}
                                    placeholder="John Doe"
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-secondary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>
                        )}

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="you@example.com"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-secondary)'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-secondary)'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>

                        {isLogin && (
                            <div style={{ textAlign: 'right' }}>
                                <a href="#" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</a>
                            </div>
                        )}

                        <button type="submit" style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            transition: 'background 0.3s'
                        }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#142a4a'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
                        >
                            {isLogin ? 'Log In' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        Or continue with
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                        {['Google', 'Facebook'].map(provider => (
                            <button key={provider} style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.3s'
                            }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                {provider}
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
