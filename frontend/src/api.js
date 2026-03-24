import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Helper to construct full image URLs
API.getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x500?text=No+Image';
    if (imagePath.startsWith('http')) {
        // Fix potential double URL concatenation bug reported by subagent
        if (imagePath.includes('http://localhost:5000http://localhost:5000')) {
            return imagePath.replace('http://localhost:5000http://localhost:5000', 'http://localhost:5000');
        }
        return imagePath;
    }
    return `${API.defaults.baseURL}${imagePath}`;
};

// Optional: Add requested interceptors for Auth
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
});

export default API;
