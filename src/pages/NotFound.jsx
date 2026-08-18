import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="container">
        <div className="state-panel" style={{ minHeight: '60vh' }}>
            <div className="state-panel__icon">🧭</div>
            <h1 className="state-panel__title">Page not found</h1>
            <p className="state-panel__text">
                The page you were looking for has moved or never existed.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/" className="btn btn-primary">Back to home</Link>
                <Link to="/shop" className="btn btn-outline">Browse products</Link>
            </div>
        </div>
    </div>
);

export default NotFound;
