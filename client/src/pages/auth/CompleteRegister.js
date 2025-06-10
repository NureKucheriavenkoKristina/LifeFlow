import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import BiometricButton from '../../components/BiometricButton';
import { registerBiometricCredential } from '../../services/biometricService';

const CompleteRegister = () => {
  const [firstName, setFirstName] = useState('');
  const [surName, setSurName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [role, setRole] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  
  const { completeRegistration, verifyEmail, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, password, biometricVerified, verificationCodeText } = location.state || {};
  
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }

    const storedCredentialId = localStorage.getItem(`credential_${email}`);
    if (storedCredentialId) {
      setBiometricRegistered(true);
    }
  }, [email, navigate]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!surName) {
      newErrors.surName = 'Surname is required';
    }
    
    if (!role) {
      newErrors.role = 'Please select your role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      return;
    }
    
    setVerificationCode(verificationCodeText);
    setIsSubmitting(true);
    
    try {
  
      const userData = {
        email,
        password,
        firstName,
        surName,
        middleName: middleName || undefined,
        role
      };
      
      const user = await completeRegistration(userData);

      if (user.role === 'DONOR') {
        navigate('/donor/dashboard');
      } else if (user.role === 'SEEKER') {
        navigate('/seeker/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      console.error('Registration completion error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricRegistration = async () => {
    setErrors({});
    setBiometricLoading(true);
    
    try {
      if (!email) {
        throw new Error('Email is required for biometric registration');
      }

      const credentialId = await registerBiometricCredential(email);
      
      if (credentialId) {
        console.log('Biometric registration successful');
        setBiometricRegistered(true);
      }
    } catch (error) {
      console.error('Biometric registration failed', error);
      setErrors({ biometric: error.message || 'Biometric registration failed.' });
    } finally {
      setBiometricLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete your registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {biometricVerified 
            ? 'Biometric verification successful!' 
            : 'Email verification successful!'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email input (disabled, for display only) */}
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
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  value={email || ''}
                />
              </div>
            </div>

            {/* Verification Code - Only show if NOT using biometric auth */}
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  autoComplete="numeric"
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  value={verificationCodeText || 'hidden'}
                />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Rest of the form */}
            <div>
              <label htmlFor="surName" className="block text-sm font-medium text-gray-700">
                Surname
              </label>
              <div className="mt-1">
                <input
                  id="surName"
                  name="surName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.surName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  value={surName}
                  onChange={(e) => setSurName(e.target.value)}
                />
              </div>
              {errors.surName && (
                <p className="mt-2 text-sm text-red-600">{errors.surName}</p>
              )}
            </div>

            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                Middle Name (optional)
              </label>
              <div className="mt-1">
                <input
                  id="middleName"
                  name="middleName"
                  type="text"
                  autoComplete="additional-name"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Your Role
              </label>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="role-donor"
                    name="role"
                    type="radio"
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"
                    value="DONOR"
                    checked={role === 'DONOR'}
                    onChange={() => setRole('DONOR')}
                  />
                  <label htmlFor="role-donor" className="ml-3 block text-sm font-medium text-gray-700">
                    Donor (Blood Donor)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-seeker"
                    name="role"
                    type="radio"
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"
                    value="SEEKER"
                    checked={role === 'SEEKER'}
                    onChange={() => setRole('SEEKER')}
                  />
                  <label htmlFor="role-seeker" className="ml-3 block text-sm font-medium text-gray-700">
                    Seeker (Blood Recipient)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-doctor"
                    name="role"
                    type="radio"
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"
                    value="DOCTOR"
                    checked={role === 'DOCTOR'}
                    onChange={() => setRole('DOCTOR')}
                  />
                  <label htmlFor="role-doctor" className="ml-3 block text-sm font-medium text-gray-700">
                    Doctor-Admin
                  </label>
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role}</p>
              )}
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

            {errors.biometric && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{errors.biometric}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Register your biometric
                </span>
              </div>
            </div>

            {/* Biometric Registration Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleBiometricRegistration}
                disabled={biometricLoading || biometricRegistered}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  biometricLoading ? 'bg-blue-400' : 
                  biometricRegistered ? 'bg-green-500' : 
                  'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {biometricLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering Biometric...
                  </>
                ) : biometricRegistered ? (
                  <>
                    <svg className="h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Biometric Registered
                  </>
                ) : (
                  'Register Fingerprint/Face ID'
                )}
              </button>
            </div>

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
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegister;