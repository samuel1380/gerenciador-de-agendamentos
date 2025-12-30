const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

const api = {
    async request(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                // Extract title from HTML or take first 100 chars
                const match = text.match(/<title>(.*?)<\/title>/i);
                const title = match ? match[1] : text.substring(0, 100);
                throw new Error(`Server Error (${response.status}): ${title}`);
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    if (!endpoint.includes('/auth')) {
                        // Adjust path based on where we are (admin or client)
                        const loginPath = window.location.pathname.includes('/admin') ? '../client/login.html' : 'login.html';
                        // window.location.href = loginPath; // Optional: auto-redirect
                    }
                }
                throw new Error(data.error || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) { return this.request(endpoint, 'GET'); },
    post(endpoint, body) { return this.request(endpoint, 'POST', body); },
    put(endpoint, body) { return this.request(endpoint, 'PUT', body); },
};

(function () {
    if (typeof window === 'undefined') return;
    const existing = window.ClientCache || {};
    function getPayload(data) {
        if (!data) return null;
        if (typeof data.value !== 'undefined') return data.value;
        if (Array.isArray(data.items)) return data.items;
        return null;
    }
    existing.set = function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify({ value, updatedAt: Date.now() }));
        } catch (e) {
        }
    };
    existing.get = function (key, maxAgeMs) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            const updatedAt = parsed.updatedAt;
            if (typeof updatedAt !== 'number') return null;
            if (typeof maxAgeMs === 'number' && maxAgeMs > 0) {
                const age = Date.now() - updatedAt;
                if (age > maxAgeMs) return null;
            }
            return getPayload(parsed);
        } catch (e) {
            return null;
        }
    };
    window.ClientCache = existing;
})();

try {
    window.dispatchEvent(new Event('client-api-ready'));
} catch (e) {
}
