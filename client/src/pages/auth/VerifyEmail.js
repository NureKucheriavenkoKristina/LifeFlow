import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { verifyEmail, resendVerificationCode } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  

  const { email, password, verificationCodeText } = location.state || {};
  
  useEffect(() => {

    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {

      await verifyEmail(email, verificationCode);
      const verificationCodeText = verificationCode;

      navigate('/complete-register', { 
        state: { 
          email, 
          password,
          verificationCodeText 
        } 
      });
    } catch (err) {

      const errorMessage = err.response?.data?.message || 'Failed to verify email';
      setError(errorMessage);
      

      if (errorMessage.includes('expired')) {
        setError(errorMessage + '. Please request a new code.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendCode = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      await resendVerificationCode(email);

      alert('A new verification code has been sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to: <span className="font-semibold">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  autoFocus
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Please check your inbox and spam folder for the verification code
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
            
            <div className="text-sm text-center">
              <p className="text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className="font-medium text-red-600 hover:text-red-500"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Resend code
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;