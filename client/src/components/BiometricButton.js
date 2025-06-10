import React, { useState, useEffect } from 'react';
import { Fingerprint } from 'lucide-react';
import { checkBiometricAvailability } from '../services/biometricService';

const BiometricButton = ({
  onClick = () => {},
  loading = false,
  text = 'Use Biometrics', 
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await checkBiometricAvailability();
        setIsAvailable(available);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setError('Error checking biometric availability');
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, []);

  const renderIcon = (extraClass = '') => (
    <Fingerprint className={`w-5 h-5 mr-2 ${extraClass}`} />
  );

  const baseClass =
    'w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50';

  if (isChecking) {
    return (
      <button className={baseClass} disabled>
        {renderIcon('animate-pulse')} Checking biometric support...
      </button>
    );
  }

  if (error) {
    return (
      <button className={baseClass} disabled>
        {renderIcon()} {error}
      </button>
    );
  }

  if (!isAvailable) {
    return (
      <button className={baseClass} disabled>
        {renderIcon()} Biometrics not available
      </button>
    );
  }

  return (
    <button
      className={baseClass}
      onClick={onClick}
      disabled={loading}
    >
      {renderIcon(loading ? 'animate-pulse text-blue-500' : '')}
      {loading ? 'Verifying...' : text}
    </button>
  );
};

export default BiometricButton;
