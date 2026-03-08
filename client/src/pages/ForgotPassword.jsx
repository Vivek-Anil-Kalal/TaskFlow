import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

// Step 1: Enter email
// Step 2: Enter 6-digit code received via email
// Step 3: Enter new password

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    // Step 1: Request reset code
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccessMsg('A 6-digit code has been sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify code
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-reset-code', { email, code });
            setSuccessMsg('Code verified! Now set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { email, code, newPassword });
            toast.success('Password reset successfully', {
                style: {
                    borderRadius: '10px',
                },
            });
            setSuccessMsg('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password', {
                style: {
                    borderRadius: '10px',
                },
            });
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = ['Forgot Password', 'Enter Reset Code', 'Set New Password'];
    const stepDescs = [
        'Enter your account email and we\'ll send you a reset code.',
        `Enter the 6-digit code sent to ${email}.`,
        'Choose a strong new password.',
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 transition-colors duration-200">
            <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-mint-600 mb-2">TaskFlow</h1>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{stepTitles[step - 1]}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{stepDescs[step - 1]}</p>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-mint text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-mint' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                        </div>
                    ))}
                </div>

                {/* Error / Success */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-xl text-sm">
                        {successMsg}
                    </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleRequestCode} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint/50 outline-none transition-all"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-mint text-white rounded-xl font-semibold shadow-lg shadow-mint/30 hover:bg-mint-600 active:scale-95 transition-all disabled:opacity-70"
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {/* Step 2: Code */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">6-Digit Code</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint/50 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full py-3 bg-mint text-white rounded-xl font-semibold shadow-lg shadow-mint/30 hover:bg-mint-600 active:scale-95 transition-all disabled:opacity-70"
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setError(''); setSuccessMsg(''); setCode(''); }}
                            className="w-full text-sm text-gray-500 hover:text-mint transition-colors"
                        >
                            ← Use a different email
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint/50 outline-none transition-all"
                                placeholder="Minimum 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-mint/50 outline-none transition-all"
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-mint text-white rounded-xl font-semibold shadow-lg shadow-mint/30 hover:bg-mint-600 active:scale-95 transition-all disabled:opacity-70"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-mint hover:text-mint-600 transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
