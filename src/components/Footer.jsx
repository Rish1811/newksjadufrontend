import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE from '../config';

const Footer = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitStatus, setSubmitStatus] = useState(null); // 'sending', 'success', 'error'

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('sending');

        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...contactForm,
                    label: 'Contact Request' // To identify in backend email
                })
            });

            if (res.ok) {
                setSubmitStatus('success');
                setTimeout(() => {
                    setIsContactOpen(false);
                    setSubmitStatus(null);
                    setContactForm({ name: '', email: '', subject: '', message: '' });
                }, 3000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error(error);
            setSubmitStatus('error');
        }
    };

    return (
        <footer style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src="/logo.png" alt="K'S JADU" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
                            K'S JADU
                        </h3>
                        <p style={{ color: '#a0b4cc', lineHeight: '1.7', fontSize: '0.9rem' }}>
                            Specially formulated plant-based cleaning products that are safe for you and the planet.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: '#6CBF84' }}>Shop</h4>
                        <ul style={{ color: '#e0e0e0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li>Laundry</li>
                            <li>Dishwashing</li>
                            <li>Surface Cleaners</li>
                            <li>Bathroom Care</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: '#6CBF84' }}>Company</h4>
                        <ul style={{ color: '#e0e0e0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li>Our Story</li>
                            <li>Ingredients</li>
                            <li>Blog</li>
                            <li
                                onClick={() => setIsContactOpen(true)}
                                style={{ cursor: 'pointer', transition: 'color 0.3s' }}
                                onMouseOver={(e) => e.target.style.color = '#6CBF84'}
                                onMouseOut={(e) => e.target.style.color = '#e0e0e0'}
                            >
                                Contact Us
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: '#6CBF84' }}>Policies</h4>
                        <ul style={{ color: '#e0e0e0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li>
                                <Link to="/policy/terms-of-service" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#6CBF84'} onMouseOut={(e) => e.target.style.color = '#e0e0e0'}>Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/policy/refund-policy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#6CBF84'} onMouseOut={(e) => e.target.style.color = '#e0e0e0'}>Refund & Return Policy</Link>
                            </li>
                            <li>
                                <Link to="/policy/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#6CBF84'} onMouseOut={(e) => e.target.style.color = '#e0e0e0'}>Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.2rem', color: '#6CBF84' }}>Stay Clean</h4>
                        <p style={{ marginBottom: '1rem', color: '#e0e0e0', fontSize: '0.9rem' }}>Subscribe to get special offers and once-in-a-lifetime deals.</p>
                        <div style={{ display: 'flex' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                style={{
                                    padding: '10px',
                                    borderRadius: '4px 0 0 4px',
                                    border: 'none',
                                    width: '100%',
                                    outline: 'none'
                                }}
                            />
                            <button style={{
                                backgroundColor: '#6CBF84',
                                color: 'var(--color-primary)',
                                padding: '10px 15px',
                                borderRadius: '0 4px 4px 0',
                                fontWeight: 'bold'
                            }}>Subscribe</button>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', textAlign: 'center', color: '#7ba1c7', fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} K'S JADU. All Rights Reserved.
                </div>
            </div>

            {/* Contact Us Modal */}
            {isContactOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '20px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', color: 'rgb(0, 0, 128)', position: 'relative' }}>
                        <button
                            onClick={() => setIsContactOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}
                        >&times;</button>

                        <h2 style={{ marginBottom: '0.5rem', color: 'rgb(0, 0, 128)' }}>Contact Us</h2>
                        <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>Have a question? Drop us a message and we'll get back to you soon.</p>

                        {submitStatus === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                                <h3 style={{ color: '#28a745' }}>Message Sent!</h3>
                                <p>Thank you for reaching out. We will contact you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Your Name</label>
                                    <input
                                        type="text" required placeholder="John Doe"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Your Email</label>
                                    <input
                                        type="email" required placeholder="john@example.com"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Subject</label>
                                    <input
                                        type="text" placeholder="Inquiry about product"
                                        value={contactForm.subject}
                                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Message</label>
                                    <textarea
                                        required placeholder="Write your message here..."
                                        rows="4"
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', resize: 'none' }}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitStatus === 'sending'}
                                    style={{
                                        marginTop: '1rem', padding: '14px',
                                        backgroundColor: 'rgb(0, 0, 128)', color: 'white',
                                        border: 'none', borderRadius: '8px',
                                        cursor: 'pointer', fontWeight: 'bold',
                                        transition: 'background 0.3s',
                                        opacity: submitStatus === 'sending' ? 0.7 : 1
                                    }}
                                >
                                    {submitStatus === 'sending' ? 'Sending...' : 'Send Message'}
                                </button>
                                {submitStatus === 'error' && <p style={{ color: '#dc3545', fontSize: '0.85rem', textAlign: 'center' }}>Something went wrong. Please try again.</p>}
                            </form>
                        )}
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
