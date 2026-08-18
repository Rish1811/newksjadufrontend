import React from 'react';

/**
 * Stops one broken component from blanking the whole site.
 * Without this, a render error leaves the user staring at an empty page.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('Render error:', error, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;

        return (
            <div className="state-panel" style={{ minHeight: '60vh' }}>
                <div className="state-panel__icon">⚠️</div>
                <h2 className="state-panel__title">Something went wrong</h2>
                <p className="state-panel__text">
                    Sorry about that. Reloading the page usually fixes it.
                </p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Reload page
                </button>
            </div>
        );
    }
}

export default ErrorBoundary;
