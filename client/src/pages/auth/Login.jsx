import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { email, password } = formData;
    const navigate = useNavigate();
    const { login, isLoading, user } = useAuth();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'agent') navigate('/agent');
            else navigate('/');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login({ email, password });
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-mesh-gradient font-sans relative overflow-hidden">
            {/* Floating Background Shapes */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-levitate z-0"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-levitate-delayed z-0"></div>

            <div className="flex w-full max-w-6xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 border border-white/60 dark:border-gray-700/50 overflow-hidden relative z-10 box-border">

                {/* Left Side - Clean Form */}
                <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-center relative">
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Cortex<span className="text-blue-600">Support</span></span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome Back!</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Detailed insights await. Please sign in.</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-slate-700 dark:text-white font-medium placeholder-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-slate-700 dark:text-white font-medium placeholder-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg bg-slate-50" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-slate-500">
                        Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link>
                    </p>
                </div>

                {/* Right Side - Whimsical Antigravity Illustration */}
                <div className="hidden md:flex w-[55%] relative overflow-hidden bg-indigo-50/30 dark:bg-indigo-900/10 items-center justify-center p-12">
                    {/* Decorative Floating Blobs */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-20 animate-levitate z-0"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-levitate-delayed z-0"></div>

                    {/* Main Content */}
                    <div className="relative z-10 text-center animate-levitate">
                        {/* 
                            PLACEHOLDER IMAGE 
                            Rationale: The generative AI service was temporarily unavailable. 
                            Using a high-quality Unsplash image that matches the 'friendly tech' vibe as a fallback.
                            TODO: Replace with custom 'Whimsical Agent' illustration when service is back.
                        */}
                        <div className="relative inline-block mb-10">
                            {/* Floating Elements mimicking the prompt's description visually via CSS */}
                            <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-levitate-delayed z-20">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div className="absolute top-1/2 -left-8 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center animate-float z-20">
                                <span className="text-xl">🚀</span>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-levitate z-20">
                                <span className="text-2xl">💬</span>
                            </div>

                            <img
                                src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Friendly Support Agent"
                                className="w-80 h-80 object-cover rounded-[3rem] shadow-2xl shadow-indigo-500/30 ring-8 ring-white/50 backdrop-blur-sm"
                            />
                        </div>

                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                            Elevate Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Customer Support</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                            Experience the future of ticket management. AI-powered, human-centric, and designed for zero-gravity efficiency.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
