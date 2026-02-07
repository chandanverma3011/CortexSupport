import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';

const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);

    // Backend returns { success, data: { _id, name, email, role, token } }
    if (response.data && response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
    }

    return response.data;
};

const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);

    // Backend returns { success, data: { _id, name, email, role, token } }
    if (response.data && response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
    }

    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const authService = {
    register,
    login,
    logout,
};

export default authService;
