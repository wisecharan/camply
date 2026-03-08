import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('student');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const fullName = `${firstName} ${lastName}`.trim();
        const payload = type === 'student' 
            ? { name: fullName, email, password, phone: '', department: '' }
            : { company_name: fullName, email, password, industry: '' };
            
        const endpoint = type === 'student' ? '/register/student' : '/register/company';

        try {
            const res = await api.post(endpoint, payload);
            setSuccessMessage(res.data.message || 'Account created successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1b2b4b] via-[#0a1128] to-[#050a18] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-[1100px] h-[90vh] min-h-[650px] max-h-[850px] bg-white rounded-[2.5rem] p-3 flex flex-col lg:flex-row shadow-2xl">
                
                <div className="relative hidden lg:block w-1/2 h-full rounded-[2rem] overflow-hidden bg-gray-900">
                    <img 
                        src="https://images.unsplash.com/photo-1511376979163-f804dff7ad7b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                        alt="VR Experience" 
                        className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-transparent to-red-900/30 mix-blend-multiply"></div>
                </div>

                <div className="w-full lg:w-1/2 h-full flex flex-col px-6 py-8 lg:px-14 overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-[420px] mx-auto my-auto">
                        
                        <div className="lg:hidden flex justify-center mb-8">
                            <span className="text-[36px] font-bold tracking-tight text-gray-900">
                                Camply<span className="text-white drop-shadow-md">.</span>
                            </span>
                        </div>

                        {!successMessage && (
                            <button onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-gray-900 transition-colors hidden lg:block">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                        )}

                        {successMessage ? (
                            <div className="text-center py-12">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-medium text-gray-900 mb-3">Registration Successful</h3>
                                <p className="text-gray-600 mb-8">{successMessage}</p>
                                <button onClick={() => window.open('/login', '_blank')} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 transition-colors">
                                    Go to Sign In
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-[36px] sm:text-[40px] leading-tight font-medium text-gray-900 mb-2">
                                    Create an Account
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Already have an account? <button onClick={() => navigate('/login')} className="text-gray-900 font-semibold hover:underline">Log in</button>
                                </p>

                                <div className="flex p-1 bg-gray-50 rounded-full mb-6 border border-gray-100">
                                    <button
                                        onClick={() => setType('student')}
                                        className={`w-1/2 py-1.5 text-xs font-medium rounded-full transition-all ${type === 'student' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        onClick={() => setType('company')}
                                        className={`w-1/2 py-1.5 text-xs font-medium rounded-full transition-all ${type === 'company' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Company
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">{error}</div>}
                                    
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-full sm:w-1/2">
                                            <label className="block text-sm font-medium text-gray-900 mb-1.5">{type === 'student' ? 'First Name' : 'Company'}</label>
                                            <input
                                                type="text"
                                                required
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder={type === 'student' ? "John" : "Acme"}
                                                className="block w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all sm:text-sm"
                                            />
                                        </div>
                                        <div className="w-full sm:w-1/2">
                                            <label className="block text-sm font-medium text-gray-900 mb-1.5">{type === 'student' ? 'Last Name' : 'Suffix (Inc/LLC)'}</label>
                                            <input
                                                type="text"
                                                required={type === 'student'}
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder={type === 'student' ? "Doe" : "Corp"}
                                                className="block w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            className="block w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password"
                                                className="block w-full px-5 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all sm:text-sm pr-12"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-3.5 px-4 mt-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 transition-colors"
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>

                                    <div className="flex items-center mt-4">
                                        <input
                                            id="terms"
                                            type="checkbox"
                                            required
                                            className="h-4 w-4 text-black focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                                        />
                                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                                            I agree to the <a href="#" className="font-semibold text-gray-900 hover:underline">Terms & Condition</a>
                                        </label>
                                    </div>
                                </form>

                                <div className="mt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-white text-gray-400">or</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                        <button type="button" className="flex items-center justify-center w-full sm:w-1/2 px-4 py-2.5 border border-gray-300 rounded-full shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Continue with Google
                                        </button>
                                        <button type="button" className="flex items-center justify-center w-full sm:w-1/2 px-4 py-2.5 border border-gray-300 rounded-full shadow-sm bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            <svg className="h-5 w-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                            Continue with Facebook
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Register;