import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loadingText, setLoadingText] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingText('Logging in...');

        try {
            const response = await api.post('/login', { email, password });
            login(response.data);

            const dashboardUrl = `/${response.data.role}/dashboard`;
            window.open(dashboardUrl, '_blank');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoadingText('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-lg shadow-sm border border-gray-100">

                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h2 className="text-2xl font-semibold tracking-tight mb-1">Log in</h2>
                    <p className="text-sm text-gray-500">Welcome back to Campus Placement Recruitment System.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Roll Number or Email</label>
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-colors pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            id="terms-login"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                        />
                        <label htmlFor="terms-login" className="ml-2 block text-sm text-gray-600">
                            I agree to the <a href="#" className="text-black hover:underline">Terms & Conditions</a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!!loadingText}
                        className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors mt-2"
                    >
                        {loadingText || 'Log in'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account? <button onClick={() => navigate('/register')} className="text-black font-medium hover:underline">Sign up</button>
                </p>
            </div>
        </div>
    );
};

export default Login;