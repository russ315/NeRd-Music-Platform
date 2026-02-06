const ApiClient = (function() {
    const BASE_URL = '/api';

    function getToken() {
        return localStorage.getItem('NeRuaD_token');
    }

    async function request(path, options) {
        const token = getToken();
        const headers = Object.assign(
            { 'Content-Type': 'application/json' },
            options && options.headers ? options.headers : {}
        );
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const message = data.message || 'Request failed';
            throw new Error(message);
        }
        return data;
    }

    return {
        getToken,
        request
    };
})();
