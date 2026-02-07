import { createContext, useState, useContext } from 'react';
import ticketService from '../services/ticketService';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
    const [tickets, setTickets] = useState([]);
    const [ticket, setTicket] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');

    const createTicket = async (ticketData) => {
        setIsLoading(true);
        try {
            const newTicket = await ticketService.createTicket(ticketData);
            setTickets([...tickets, newTicket]);
            setIsLoading(false);
            return newTicket;
        } catch (error) {
            setIsLoading(false);
            setIsError(true);
            const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setMessage(msg);
            throw error;
        }
    };

    const getTickets = async () => {
        setIsLoading(true);
        try {
            const data = await ticketService.getTickets();
            setTickets(data);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setIsError(true);
            const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setMessage(msg);
        }
    };

    const getTicket = async (id) => {
        setIsLoading(true);
        try {
            const data = await ticketService.getTicket(id);
            setTicket(data);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            setIsError(true);
            const msg = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            setMessage(msg);
        }
    };

    return (
        <TicketContext.Provider value={{ tickets, ticket, isLoading, isError, message, createTicket, getTickets, getTicket }}>
            {children}
        </TicketContext.Provider>
    );
};

export default TicketContext;
