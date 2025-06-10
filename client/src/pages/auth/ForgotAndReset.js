import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {Link, useNavigate} from 'react-router-dom';

const ForgotAndReset = () => {
    const { forgotPassword, error, clearError } =
        useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState({});

    useEffect(() => {
        clearError();
    }, []);

    const validateEmailForm = () => {
        const errs = {};
        if (!email) {
            errs.email = 'Email required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errs.email = 'Invalid email format';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateResetForm = () => {
        const errs = {};
        if (!code) {
            errs.code = 'Confirmation code required';
        } else if (code.length !== 6) {
            errs.code = 'Code must be 6 digits';
        }

        if (!newPassword) {
            errs.newPassword = 'New password required';
        } else if (newPassword.length < 6) {
            errs.newPassword = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            errs.confirmPassword = 'Confirm password';
        } else if (newPassword !== confirmPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        clearError();

        if (!validateEmailForm()) return;

        setIsSubmitting(true);
        try {
            await forgotPassword({ email });
            setSuccessMessage(`Code successfully sent to ${email}`);
            setTimeout(() => {
                setStep(1);
                setSuccessMessage('');
            }, 2000);
        } catch (err) {
            console.error('Forgot password error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        clearError();

        if (!validateResetForm()) return;

        setIsSubmitting(true);
        try {
            await forgotPassword({
                email,
                verificationCode: code,
                newPassword
            });
            setSuccessMessage('Password successfully changed. Now we will redirect to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            console.error('Reset password error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const moveToLogin = async () => {
        clearError();
        setErrors({});
        navigate('/');
    };

    const handleResend = async () => {
        clearError();
        setErrors({});
        setIsSubmitting(true);
        try {
            await forgotPassword({ email });
            alert('A new code has been sent to your email.');
        } catch (err) {
            setErrors({ resend: 'Failed to send code. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {/* вибір іконки залежить від кроку */}
                            {step === 0 ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 12h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2m4-4v8"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            )}
                        </svg>
                    </div>
                </div>

                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {step === 0 ? 'Forgot your password?' : 'Reset your password'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {step === 0
                        ? "Enter your email and we will send you a password reset code."
                        : `A code has been sent to ${email}. Enter it below and choose a new password.`}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {successMessage && (
                        <div className="mb-4 text-center text-green-600">{successMessage}</div>
                    )}

                    {/* Крок 0: форма для введення email */}
                    {step === 0 && (
                        <form className="space-y-6" onSubmit={handleSendCode}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        autoFocus
                                        className={`appearance-none block w-full px-3 py-2 border ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                        placeholder="your@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-red-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        isSubmitting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Code'
                                    )}
                                </button>
                            </div>
                            <div className="text-sm text-center space-y-2">
                                <p className="text-gray-600">
                                    Remember your password?{' '}
                                    <button
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500"
                                        onClick={moveToLogin}
                                        disabled={isSubmitting}
                                    >
                                        Go to Login
                                    </button>
                                </p>
                                <p className="text-gray-600">
                                    Or{' '}
                                    <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                                        create a new account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}

                    {/* Крок 1: форма для введення коду і пароля */}
                    {step === 1 && (
                        <form className="space-y-6" onSubmit={handleReset}>
                            <div>
                                <label
                                    htmlFor="verificationCode"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Verification Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="verificationCode"
                                        name="verificationCode"
                                        type="text"
                                        required
                                        autoFocus
                                        className={`appearance-none block w-full px-3 py-2 border ${
                                            errors.code ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                        placeholder="Enter 6-digit code"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                                        }
                                        maxLength={6}
                                    />
                                </div>
                                {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code}</p>}
                                <p className="mt-1 text-xs text-gray-500">
                                    Please find the code in your email (including spam).
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        required
                                        className={`appearance-none block w-full px-3 py-2 border ${
                                            errors.newPassword ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Confirm New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className={`appearance-none block w-full px-3 py-2 border ${
                                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-red-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errors.resend && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-red-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">{errors.resend}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                        isSubmitting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </div>

                            <div className="text-sm text-center space-y-2">
                                <p className="text-gray-600">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500"
                                        onClick={handleResend}
                                        disabled={isSubmitting}
                                    >
                                        Resend code
                                    </button>
                                </p>
                                <p>
                                    <button
                                        type="button"
                                        className="font-medium text-red-600 hover:text-red-500"
                                        onClick={() => {
                                            // повернутися назад до email-форми
                                            setStep(0);
                                            setErrors({});
                                            clearError();
                                        }}
                                    >
                                        Back to Enter Email
                                    </button>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotAndReset;
