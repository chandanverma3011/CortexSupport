import api from './api';

const createTicket = async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data.data;
};

const getTickets = async () => {
    const response = await api.get('/tickets/my');
    return response.data.data;
};

const getTicket = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data.data;
};

const predictTicketDetails = async (title) => {
    const response = await api.post('/tickets/predict', { title });
    return response.data.data;
};

const generateDescription = async (title) => {
    const response = await api.post('/tickets/generate-description', { title });
    return response.data.data.description;
};

const ticketService = {
    createTicket,
    getTickets,
    getTicket,
    predictTicketDetails,
    generateDescription
};

export default ticketService;
