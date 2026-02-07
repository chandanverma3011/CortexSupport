import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai/';

const analyzeTicket = async (text, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const response = await axios.post(API_URL + 'analyze', { text }, config);
    return response.data;
};

const aiService = {
    analyzeTicket
};

export default aiService;
