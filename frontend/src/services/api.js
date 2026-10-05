// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
    };

    const config = {
        ...options,
        headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || data.message || 'API Error');
    }
    return data;
}

export const authApi = {
    register: (body) => fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getProfile: () => fetchApi('/api/auth/profile'),
};

export const busApi = {
    getAll: () => fetchApi('/api/buses'),
    getById: (id) => fetchApi(`/api/buses/${id}`),
    create: (body) => fetchApi('/api/buses', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => fetchApi(`/api/buses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => fetchApi(`/api/buses/${id}`, { method: 'DELETE' }),
};

export const routeApi = {
    getAll: () => fetchApi('/api/routes'),
    getById: (id) => fetchApi(`/api/routes/${id}`),
    create: (body) => fetchApi('/api/routes', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => fetchApi(`/api/routes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => fetchApi(`/api/routes/${id}`, { method: 'DELETE' }),
};

export const tripApi = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchApi(`/api/trips?${query}`);
    },
    getById: (id) => fetchApi(`/api/trips/${id}`),
    getSeats: (id) => fetchApi(`/api/trips/${id}/seats`),
    create: (body) => fetchApi('/api/trips', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => fetchApi(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => fetchApi(`/api/trips/${id}`, { method: 'DELETE' }),
};

export const bookingApi = {
    getAll: () => fetchApi('/api/bookings'),
    getById: (id) => fetchApi(`/api/bookings/${id}`),
    create: (body) => fetchApi('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
    cancel: (id) => fetchApi(`/api/bookings/${id}/cancel`, { method: 'POST' }),
    updateStatus: (id, status) => fetchApi(`/api/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const adminApi = {
    getDashboard: () => fetchApi('/api/admin/dashboard'),
    getUsers: () => fetchApi('/api/admin/users'),
};
