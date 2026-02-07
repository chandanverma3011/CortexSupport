import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const AgentRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Loader />;

    if (!user) {
        return <Navigate to='/login' />;
    }

    // Allow both agents and admins (admin has all privileges)
    if (user.role !== 'agent' && user.role !== 'admin') {
        return <Navigate to='/' />;
    }

    return <Outlet />;
};

export default AgentRoute;
