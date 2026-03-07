import React, { useState } from 'react';
import API_BASE from '../config';

const Wholesale = () => {
    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        subject: 'Wholesale Inquiry',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState(null); // 'sending', 'success', 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('sending');

        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.businessName,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    label: 'Wholesale Request' // To identify in backend email
                })
            });

            if (res.ok) {
                setSubmitStatus('success');
                setFormData({ businessName: '', email: '', subject: 'Wholesale Inquiry', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting wholesale form:', error);
            setSubmitStatus('error');
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '600px', minHeight: '80vh' }}>
            <h1 className="section-title">Partner With Us</h1>
            <p className="section-subtitle">Interested in stocking K'S JADU products? Get in touch!</p>

            {submitStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f0f9f0', borderRadius: '12px', border: '1px solid #d4edda' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>Request Received!</h2>
                    <p style={{ color: '#155724' }}>Thank you for your interest in K'S JADU wholesale. We will review your request and get back to you at {formData.email} soon.</p>
                    <button
                        onClick={() => setSubmitStatus(null)}
                        style={{ marginTop: '1.5rem', padding: '10px 20px', backgroundColor: 'rgb(0, 0, 128)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Send Another Inquiry
                    </button>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#f9f9f9', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee' }}
                >
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'rgb(0, 0, 128)' }}>Business Name</label>
                        <input
                            type="text" required
                            placeholder="Enter your company name"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'rgb(0, 0, 128)' }}>Business Email Address</label>
                        <input
                            type="email" required
                            placeholder="email@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'rgb(0, 0, 128)' }}>Detailed Inquiry (Products/Quantity)</label>
                        <textarea
                            rows="5" required
                            placeholder="Please mention products and approximate quantities you're looking for..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', resize: 'none' }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={submitStatus === 'sending'}
                        className="btn btn-primary"
                        style={{
                            width: '100%', padding: '14px', fontSize: '1.1rem',
                            backgroundColor: 'rgb(0, 0, 128)', color: 'white',
                            border: 'none', borderRadius: '8px',
                            cursor: 'pointer', fontWeight: 'bold',
                            opacity: submitStatus === 'sending' ? 0.7 : 1,
                            transition: 'all 0.3s'
                        }}
                    >
                        {submitStatus === 'sending' ? 'Sending Inquiry...' : 'Submit Wholesale Request'}
                    </button>

                    {submitStatus === 'error' && (
                        <p style={{ color: '#dc3545', textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>Something went wrong. Please try again or contact us via email.</p>
                    )}
                </form>
            )}
        </div>
    );
};

export default Wholesale;
