import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const HomeDispatcher = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Loader />;

    if (!user) return <Navigate to="/login" />;

    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin" />;
        case 'agent':
            return <Navigate to="/agent" />;
        default:
            return <Navigate to="/dashboard" />;
    }
};

export default HomeDispatcher;
