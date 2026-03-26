import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('student');
    const [successMessage, setSuccessMessage] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
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
            ? { name: fullName, roll_number: rollNumber, email, password, phone: '', department: '' }
            : { company_name: fullName, email, password, industry: '' };

        const endpoint = type === 'student' ? '/register/student' : '/register/company';

        try {
            const res = await api.post(endpoint, payload);
            setSuccessMessage(res.data.message || 'Account created successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-lg shadow-sm border border-gray-100">

                {!successMessage && (
                    <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                )}

                {successMessage ? (
                    <div className="text-center py-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-50 border border-gray-200 mb-4">
                            <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Registration Successful</h3>
                        <p className="text-sm text-gray-500 mb-6">{successMessage}</p>
                        <button onClick={() => window.open('/login', '_blank')} className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                            Go to Log in
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create an account</h2>
                            <p className="text-sm text-gray-500">Welcome to Campus Placement Recruitment System.</p>
                        </div>

                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setType('student')}
                                className={`pb-2 px-1 text-sm font-medium mr-6 transition-colors ${type === 'student' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setType('company')}
                                className={`pb-2 px-1 text-sm font-medium transition-colors ${type === 'company' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                Company
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <label className="text-sm font-medium text-gray-700">{type === 'student' ? 'First Name' : 'Company'}</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-colors"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-sm font-medium text-gray-700">{type === 'student' ? 'Last Name' : 'Suffix'}</label>
                                    <input
                                        type="text"
                                        required={type === 'student'}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            {type === 'student' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Roll Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={rollNumber}
                                        onChange={(e) => setRollNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-colors"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-colors"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Password</label>
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
                                    id="terms-register"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                                />
                                <label htmlFor="terms-register" className="ml-2 block text-sm text-gray-600">
                                    I agree to the <a href="#" className="text-black hover:underline">Terms & Conditions</a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors mt-2"
                            >
                                {loading ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account? <button onClick={() => navigate('/login')} className="text-black font-medium hover:underline">Log in</button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Register;