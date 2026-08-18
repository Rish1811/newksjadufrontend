import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', phone: '' };

const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '1070866083693-kc2hs31jq8p8rbvc27sibmg9nt3taekp.apps.googleusercontent.com';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, openCart, toast } = useApp();

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const redirectTo = new URLSearchParams(location.search).get('redirect');

    const setField = (name, value) => {
        setFormData((f) => ({ ...f, [name]: value }));
        setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
    };

    const validate = () => {
        const next = {};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
            next.email = 'Enter a valid email address.';
        }
        if (!formData.password) {
            next.password = 'Password is required.';
        } else if (!isLogin && formData.password.length < 8) {
            // Matches the server rule, so signup can't fail on a round trip.
            next.password = 'Password must be at least 8 characters.';
        }
        if (!isLogin) {
            if (!formData.firstName.trim()) next.firstName = 'First name is required.';
            if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
                next.phone = 'Enter a valid 10-digit mobile number.';
            }
        }
        return next;
    };

    /** Send the user where they were headed before signing in. */
    const finishLogin = (userData) => {
        login(userData);
        if (redirectTo === 'cart') {
            navigate('/', { replace: true });
            setTimeout(openCart, 250);
        } else if (redirectTo === 'orders') {
            navigate('/my-orders', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        try {
            const payload = isLogin
                ? { email: formData.email.trim(), password: formData.password }
                : {
                    name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    phone: formData.phone || undefined,
                };

            const data = await api.post(isLogin ? '/api/auth/login' : '/api/auth/register', payload, { auth: false });
            finishLogin(data);
        } catch (err) {
            toast(err.message || 'Something went wrong.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setSubmitting(true);
            try {
                // Only the access token is sent; the server calls Google itself
                // to read the profile, so the email can't be spoofed.
                const data = await api.post('/api/auth/social-login', {
                    accessToken: tokenResponse.access_token,
                    provider: 'Google',
                }, { auth: false });
                finishLogin(data);
            } catch (err) {
                toast(err.message || 'Google sign-in failed.', 'error');
            } finally {
                setSubmitting(false);
            }
        },
        onError: () => toast('Google sign-in was cancelled.', 'info'),
    });

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'grid',
                placeItems: 'center',
                padding: 20,
                background: 'radial-gradient(circle at 50% 30%, #17203f 0%, #080b16 100%)',
                position: 'relative',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 460,
                    backgroundColor: 'rgba(20, 24, 40, 0.82)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 28,
                    padding: 'clamp(24px, 5vw, 40px)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.55)',
                    color: '#fff',
                }}
            >
                <Link
                    to="/"
                    aria-label="Back to the store"
                    style={{
                        position: 'absolute', top: 24, right: 24,
                        backgroundColor: 'rgba(255,255,255,0.07)',
                        width: 34, height: 34, borderRadius: '50%',
                        display: 'grid', placeItems: 'center', color: '#fff',
                    }}
                >
                    ✕
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                    <img src="/logo.png" alt="" width="40" height="40" style={{ height: 40, width: 'auto' }} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800 }}>K'S JADU</span>
                </div>

                <div
                    role="tablist"
                    style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.35)', padding: 4, borderRadius: 22, width: 'fit-content', marginBottom: 26 }}
                >
                    {[[true, 'Sign in'], [false, 'Sign up']].map(([mode, label]) => (
                        <button
                            key={label}
                            type="button"
                            role="tab"
                            aria-selected={isLogin === mode}
                            onClick={() => { setIsLogin(mode); setErrors({}); }}
                            style={{
                                padding: '8px 22px',
                                borderRadius: 20,
                                backgroundColor: isLogin === mode ? 'rgba(255,255,255,0.13)' : 'transparent',
                                color: isLogin === mode ? '#fff' : '#8a93a8',
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>
                    {isLogin ? 'Welcome back' : 'Create your account'}
                </h1>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {!isLogin && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <input
                                    className="input" style={darkInput} autoComplete="given-name"
                                    placeholder="First name" aria-label="First name"
                                    value={formData.firstName}
                                    onChange={(e) => setField('firstName', e.target.value)}
                                />
                                {errors.firstName && <span style={errorText}>{errors.firstName}</span>}
                            </div>
                            <input
                                className="input" style={darkInput} autoComplete="family-name"
                                placeholder="Last name" aria-label="Last name"
                                value={formData.lastName}
                                onChange={(e) => setField('lastName', e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <input
                            className="input" style={darkInput} type="email" autoComplete="email"
                            placeholder="Enter your email" aria-label="Email address"
                            value={formData.email}
                            onChange={(e) => setField('email', e.target.value)}
                        />
                        {errors.email && <span style={errorText}>{errors.email}</span>}
                    </div>

                    {!isLogin && (
                        <div>
                            <input
                                className="input" style={darkInput} type="tel" inputMode="numeric" maxLength={10}
                                autoComplete="tel" placeholder="Mobile number (optional)" aria-label="Mobile number"
                                value={formData.phone}
                                onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
                            />
                            {errors.phone && <span style={errorText}>{errors.phone}</span>}
                        </div>
                    )}

                    <div>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="input" style={{ ...darkInput, paddingRight: 68 }}
                                type={showPassword ? 'text' : 'password'}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                                aria-label="Password"
                                value={formData.password}
                                onChange={(e) => setField('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8a93a8', fontSize: 12, fontWeight: 600 }}
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>
                        {errors.password && <span style={errorText}>{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            backgroundColor: '#fff', color: '#0b0f1a', padding: 14,
                            borderRadius: 12, fontSize: 15, fontWeight: 700, marginTop: 6,
                            opacity: submitting ? 0.7 : 1,
                        }}
                    >
                        {submitting ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0' }}>
                    <span style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#5b6478', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>OR CONTINUE WITH</span>
                    <span style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                </div>

                <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    disabled={submitting}
                    style={{
                        width: '100%', backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                        padding: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 10, color: '#fff', fontWeight: 600, fontSize: 14,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Google
                </button>

                <p style={{ color: '#5b6478', fontSize: 12, textAlign: 'center', marginTop: 26, lineHeight: 1.5 }}>
                    By continuing you agree to our{' '}
                    <Link to="/policy/terms-of-service" style={{ color: '#8a93a8', textDecoration: 'underline' }}>Terms of Service</Link>.
                </p>
            </div>
        </div>
    );
};

/**
 * The Google SDK is only mounted here rather than around the whole app, so the
 * ~30KB Google Identity client is no longer part of the bundle every shopper
 * downloads just to see the home page.
 */
const Login = () => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginForm />
    </GoogleOAuthProvider>
);

const darkInput = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14,
};

const errorText = {
    display: 'block',
    marginTop: 6,
    fontSize: 12,
    color: '#fca5a5',
    fontWeight: 600,
};

export default Login;
