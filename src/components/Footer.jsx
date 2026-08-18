import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

const SHOP_LINKS = [
    ['Dishwash', '/shop?category=dishwash'],
    ['Floor Cleaner', '/shop?category=Floor%20cleaner'],
    ['HandCare', '/shop?category=handwash'],
    ['Toilet Cleaner', '/shop?category=Toilet%20cleaner'],
];

const COMPANY_LINKS = [
    ['Our Story', '/our-story'],
    ['Ingredients', '/ingredients'],
    ['Blog', '/blog'],
    ['Wholesale', '/wholesale'],
];

const POLICY_LINKS = [
    ['Terms of Service', '/policy/terms-of-service'],
    ['Refund & Return Policy', '/policy/refund-policy'],
    ['Privacy Policy', '/policy/privacy-policy'],
];

const Footer = () => {
    const { toast } = useApp();
    const [isContactOpen, setContactOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await api.post('/api/contact', { ...contactForm, label: 'Contact Request' }, { auth: false });
            setStatus('success');
            setTimeout(() => {
                setContactOpen(false);
                setStatus(null);
                setContactForm({ name: '', email: '', subject: '', message: '' });
            }, 2500);
        } catch (err) {
            setStatus('error');
            toast(err.message || 'Message could not be sent.', 'error');
        }
    };

    // The newsletter box used to be a decorative input wired to nothing.
    // It now goes through the same contact endpoint so a signup actually lands.
    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newsletterEmail.trim())) {
            toast('Please enter a valid email address.', 'error');
            return;
        }
        setSubscribing(true);
        try {
            await api.post('/api/contact', {
                name: 'Newsletter subscriber',
                email: newsletterEmail.trim(),
                subject: 'Newsletter signup',
                message: `Please add ${newsletterEmail.trim()} to the newsletter list.`,
                label: 'Newsletter',
            }, { auth: false });
            setNewsletterEmail('');
            toast("You're on the list. Thanks!");
        } catch (err) {
            toast(err.message || 'Could not subscribe right now.', 'error');
        } finally {
            setSubscribing(false);
        }
    };

    const linkStyle = { color: '#dbe3ee', transition: 'color 180ms' };

    return (
        <footer style={{ backgroundColor: '#101c4e', color: '#fff', padding: '4rem 0 2rem', marginTop: 'auto' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.35rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/logo.png" alt="" width="30" height="30" style={{ height: 30, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                            K'S JADU
                        </h3>
                        <p style={{ color: '#a0b4cc', lineHeight: 1.7, fontSize: '0.9rem' }}>
                            Plant-based cleaning products that are safe for your family and kind to the planet.
                        </p>
                    </div>

                    {[['Shop', SHOP_LINKS], ['Company', COMPANY_LINKS], ['Policies', POLICY_LINKS]].map(([heading, links]) => (
                        <nav key={heading} aria-label={heading}>
                            <h4 style={{ marginBottom: '1.1rem', color: '#6cbf84', fontSize: '1rem' }}>{heading}</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', fontSize: '0.9rem' }}>
                                {links.map(([label, to]) => (
                                    <li key={label}>
                                        {/* These were plain <li> text before, so none of them
                                            were clickable despite looking like navigation. */}
                                        <Link to={to} style={linkStyle} className="footer-link">{label}</Link>
                                    </li>
                                ))}
                                {heading === 'Company' && (
                                    <li>
                                        <button type="button" onClick={() => setContactOpen(true)} style={{ ...linkStyle, fontSize: '0.9rem' }} className="footer-link">
                                            Contact Us
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </nav>
                    ))}

                    <div>
                        <h4 style={{ marginBottom: '1.1rem', color: '#6cbf84', fontSize: '1rem' }}>Stay Clean</h4>
                        <p style={{ marginBottom: '0.9rem', color: '#a0b4cc', fontSize: '0.9rem' }}>
                            Subscribe for offers and new launches.
                        </p>
                        <form onSubmit={handleSubscribe} style={{ display: 'flex' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                aria-label="Email address for newsletter"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                style={{ padding: 10, borderRadius: '8px 0 0 8px', border: 'none', width: '100%', minWidth: 0, outline: 'none' }}
                            />
                            <button
                                type="submit"
                                disabled={subscribing}
                                style={{ backgroundColor: '#6cbf84', color: '#101c4e', padding: '10px 16px', borderRadius: '0 8px 8px 0', fontWeight: 700, whiteSpace: 'nowrap' }}
                            >
                                {subscribing ? '…' : 'Subscribe'}
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.75rem', textAlign: 'center', color: '#7ba1c7', fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} K'S JADU. All rights reserved.
                </div>
            </div>

            {isContactOpen && (
                <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setContactOpen(false)}>
                    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="contact-heading" style={{ color: 'var(--color-text)' }}>
                        <button type="button" className="modal__close" onClick={() => setContactOpen(false)} aria-label="Close">✕</button>

                        {status === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
                                <h3 style={{ color: 'var(--color-success)', fontSize: '1.4rem', fontWeight: 800 }}>Message sent</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginTop: 6 }}>We'll get back to you shortly.</p>
                            </div>
                        ) : (
                            <>
                                <h2 id="contact-heading" style={{ marginBottom: 6, fontSize: '1.5rem', fontWeight: 800 }}>Contact us</h2>
                                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                                    Have a question? Drop us a message.
                                </p>

                                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="field">
                                        <label className="field__label" htmlFor="ct-name">Your name</label>
                                        <input id="ct-name" className="input" required autoComplete="name" value={contactForm.name}
                                            onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} />
                                    </div>
                                    <div className="field">
                                        <label className="field__label" htmlFor="ct-email">Your email</label>
                                        <input id="ct-email" className="input" type="email" required autoComplete="email" value={contactForm.email}
                                            onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} />
                                    </div>
                                    <div className="field">
                                        <label className="field__label" htmlFor="ct-subject">Subject</label>
                                        <input id="ct-subject" className="input" value={contactForm.subject}
                                            onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))} />
                                    </div>
                                    <div className="field">
                                        <label className="field__label" htmlFor="ct-message">Message</label>
                                        <textarea id="ct-message" className="input" required rows={4} style={{ resize: 'vertical' }} value={contactForm.message}
                                            onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))} />
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-block" disabled={status === 'sending'} style={{ marginTop: 6 }}>
                                        {status === 'sending' ? 'Sending…' : 'Send message'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`.footer-link:hover { color: #6cbf84 !important; }`}</style>
        </footer>
    );
};

export default Footer;
