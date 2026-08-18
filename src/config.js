/**
 * API base URL.
 *
 * Local / LAN development is the default. Set VITE_API_BASE in a .env file to
 * point somewhere else (see .env.development and .env.production).
 *
 * Hosted backend - re-enable by setting VITE_API_BASE in .env.production:
 * const API_BASE = 'https://newksjadubackend.netlify.app';
 */

const envBase = import.meta.env.VITE_API_BASE;

/**
 * With no explicit base we use a same-origin relative path, which Vite proxies
 * to the local backend in dev. That means opening the site from a phone on the
 * same Wi-Fi "just works" - the API is reached through whatever host the page
 * was loaded from, so there is no hardcoded localhost to get wrong.
 */
const API_BASE = (envBase ?? '').replace(/\/$/, '');

export default API_BASE;
