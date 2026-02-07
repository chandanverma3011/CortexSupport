import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const AdminRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Loader />;

    if (!user) {
        return <Navigate to='/login' />;
    }

    if (user.role !== 'admin') {
        return <Navigate to='/' />;
    }

    return <Outlet />;
};

export default AdminRoute;
