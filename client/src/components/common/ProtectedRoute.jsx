import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <Loader />;

    return user ? <Outlet /> : <Navigate to='/login' />;
};

export default ProtectedRoute;
