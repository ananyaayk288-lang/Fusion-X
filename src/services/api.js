const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
    // Immediate mock bypass when offline or requested via configuration to prevent Chrome console network exceptions
    const isMock = typeof window !== 'undefined' && (
        process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE === 'true' || 
        !process.env.NEXT_PUBLIC_API_URL
    );

    if (isMock && (endpoint === '/auth/logout' || endpoint === '/auth/refresh')) {
        console.log(`[API Mock Bypass] Bypassing real network request for ${endpoint}`);
        return { success: true };
    }

    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include', // Automatically send cookies (refresh token)
        });
    } catch (networkError) {
        console.warn(`%c[API Network Fallback] Offline fallback triggered for ${endpoint}:`, "color: #fbbf24; font-weight: bold;", networkError.message);
        
        // Graceful resolutions for vital lifecycle steps when local server is offline
        if (endpoint === '/auth/logout' || endpoint === '/auth/refresh') {
            return { success: true };
        }
        
        throw new Error(`Offline network connection failed: ${networkError.message}`);
    }

    // Handle token expiration: attempt automatic refresh once
    if (response.status === 401 && !options._retry && endpoint !== '/auth/refresh' && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        options._retry = true;
        try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                setAccessToken(refreshData.accessToken);
                
                // Retry original request with the new access token
                const newHeaders = {
                    ...headers,
                    Authorization: `Bearer ${refreshData.accessToken}`,
                };
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...options,
                    headers: newHeaders,
                    credentials: 'include',
                });

                const data = await retryResponse.json();
                if (!retryResponse.ok) {
                    throw new Error(data.message || 'API request failed after refresh');
                }
                return data;
            } else {
                setAccessToken(null);
            }
        } catch (refreshErr) {
            console.warn("Silent token refresh bypassed or failed:", refreshErr.message || refreshErr);
            setAccessToken(null);
        }
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Auth API
export const authAPI = {
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    login: (email, password, role) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
    }),
    refresh: () => apiRequest('/auth/refresh', {
        method: 'POST',
    }),
    logout: () => apiRequest('/auth/logout', {
        method: 'POST',
    }),
    getMe: () => apiRequest('/auth/me'),
};

// Attendance API
export const attendanceAPI = {
    getAll: () => apiRequest('/attendance'),
    getSummary: () => apiRequest('/attendance/summary'),
    mark: (data) => apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Question Papers API
export const papersAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/papers${params ? `?${params}` : ''}`);
    },
    upload: (data) => apiRequest('/papers', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getPYQs: () => apiRequest('/papers/pyqs'),
    addPYQ: (data) => apiRequest('/papers/pyqs', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Notes API
export const notesAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/notes${params ? `?${params}` : ''}`);
    },
    upload: (data) => apiRequest('/notes', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Study Groups API
export const groupsAPI = {
    getAll: () => apiRequest('/groups'),
    create: (data) => apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    join: (id) => apiRequest(`/groups/${id}/join`, { method: 'POST' }),
};

// Marathons API
export const marathonsAPI = {
    getAll: () => apiRequest('/marathons'),
    create: (data) => apiRequest('/marathons', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    register: (id) => apiRequest(`/marathons/${id}/register`, { method: 'POST' }),
};

// P2P API
export const p2pAPI = {
    getAll: () => apiRequest('/p2p'),
    create: (data) => apiRequest('/p2p', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    register: (id) => apiRequest(`/p2p/${id}/register`, { method: 'POST' }),
};

// Library API
export const libraryAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/library${params ? `?${params}` : ''}`);
    },
    getMyBooks: () => apiRequest('/library/my-books'),
    borrow: (id) => apiRequest(`/library/${id}/borrow`, { method: 'POST' }),
    return: (id) => apiRequest(`/library/${id}/return`, { method: 'POST' }),
};

// Results API
export const resultsAPI = {
    getAll: () => apiRequest('/results'),
    add: (data) => apiRequest('/results', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// Doubts API
export const doubtsAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/doubts${params ? `?${params}` : ''}`);
    },
    ask: (data) => apiRequest('/doubts', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    answer: (id, answer) => apiRequest(`/doubts/${id}/answer`, {
        method: 'PUT',
        body: JSON.stringify({ answer }),
    }),
};

// Alumni API
export const alumniAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return apiRequest(`/alumni${params ? `?${params}` : ''}`);
    },
    add: (data) => apiRequest('/alumni', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// New Features API
export const extraAPI = {
    getPlacements: () => Promise.resolve([]), // Fallback if backend not ready
    getRoadmap: () => Promise.resolve([]),
    getGamification: () => Promise.resolve({}),
    getProjects: () => Promise.resolve([])
};
