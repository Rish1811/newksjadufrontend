import React from 'react';
import { useApp } from '../context/AppContext';

const ICONS = { success: '✓', error: '!', info: 'i' };

/** Stacked notifications, replacing the blocking window.alert() calls. */
const Toaster = () => {
    const { toasts, dismissToast } = useApp();

    if (toasts.length === 0) return null;

    return (
        <div className="toaster" role="status" aria-live="polite">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast--${t.type}`} onClick={() => dismissToast(t.id)}>
                    <span className="toast__icon" aria-hidden="true">{ICONS[t.type] || ICONS.info}</span>
                    <span className="toast__message">{t.message}</span>
                    <button
                        type="button"
                        className="toast__close"
                        aria-label="Dismiss notification"
                        onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toaster;
