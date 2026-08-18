import API_BASE from '../config';

/**
 * One place for every network call.
 *
 * Handles the auth header, JSON encoding, error messages, an expired-session
 * redirect, plus a small client-side cache so repeated GETs for the same data
 * (the home page asks for the product list from several sections) hit the
 * network once instead of five times.
 */

const TOKEN_KEY = 'user';

export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(TOKEN_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        localStorage.removeItem(TOKEN_KEY);
        return null;
    }
};

export class ApiError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

/* --------------------------- GET cache + dedupe --------------------------- */

const CACHE_TTL_MS = 30_000;
const cache = new Map();      // url -> { data, expiresAt }
const inFlight = new Map();   // url -> Promise

/** Drop cached GETs whose URL contains any of the given fragments. */
export const invalidateCache = (...fragments) => {
    if (fragments.length === 0) return cache.clear();
    for (const key of cache.keys()) {
        if (fragments.some((f) => key.includes(f))) cache.delete(key);
    }
};

/* -------------------------------- core ---------------------------------- */

const buildUrl = (path) => (path.startsWith('http') ? path : `${API_BASE}${path}`);

const parseBody = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const request = async (path, { method = 'GET', body, auth = true, signal, isFormData = false } = {}) => {
    const headers = {};
    const user = getStoredUser();

    if (auth && user?.token) headers.Authorization = `Bearer ${user.token}`;
    // Let the browser set the multipart boundary itself for FormData.
    if (body && !isFormData) headers['Content-Type'] = 'application/json';

    let response;
    try {
        response = await fetch(buildUrl(path), {
            method,
            headers,
            body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
            signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw err;
        throw new ApiError('Could not reach the server. Check your connection.', 0, null);
    }

    const data = await parseBody(response);

    if (!response.ok) {
        // An expired or revoked token should log the user out rather than
        // leaving the UI in a half-authenticated state.
        if (response.status === 401 && user) {
            localStorage.removeItem(TOKEN_KEY);
            window.dispatchEvent(new Event('authChanged'));
        }
        const message =
            (data && typeof data === 'object' && data.message) ||
            (typeof data === 'string' && data) ||
            `Request failed (${response.status})`;
        throw new ApiError(message, response.status, data);
    }

    return data;
};

export const api = {
    /**
     * Cached GET. Concurrent callers for the same URL share one request.
     * Pass `{ fresh: true }` to bypass the cache.
     *
     * The caller's `signal` deliberately does NOT abort the underlying fetch:
     * several components share a single in-flight request, so letting one of
     * them unmount and abort would cancel the data everyone else is waiting
     * for. Instead the signal only detaches this caller from the result.
     */
    async get(path, { fresh = false, auth = true, signal } = {}) {
        const key = `${path}|${auth}`;

        let shared;
        if (!fresh) {
            const hit = cache.get(key);
            if (hit && hit.expiresAt > Date.now()) shared = Promise.resolve(hit.data);
            else shared = inFlight.get(key);
        }

        if (!shared) {
            shared = request(path, { auth })
                .then((data) => {
                    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
                    return data;
                })
                .finally(() => inFlight.delete(key));
            inFlight.set(key, shared);
        }

        if (!signal) return shared;

        // Reject this caller's view as soon as it aborts, while the shared
        // request carries on for anyone else who asked for the same URL.
        return Promise.race([
            shared,
            new Promise((_, reject) => {
                const abort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
                if (signal.aborted) abort();
                else signal.addEventListener('abort', abort, { once: true });
            }),
        ]);
    },

    post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
    put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
    del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),

    /** Multipart upload (product images, review photos, avatars). */
    upload: (path, formData, { method = 'POST' } = {}) =>
        request(path, { method, body: formData, isFormData: true }),
};

/** Turn a stored path into something an <img src> can use. */
export const imageUrl = (path, fallback = '/logo.png') => {
    if (!path) return fallback;
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
    return `${API_BASE}${path}`;
};

/** ₹ formatting in one place so totals look the same everywhere. */
export const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
