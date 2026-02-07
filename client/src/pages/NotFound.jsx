import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="text-center mt-20">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page Not Found</p>
            <Link to="/" className="btn-primary">Go Home</Link>
        </div>
    );
};

export default NotFound;
