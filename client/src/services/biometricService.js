export const isBiometricsSupported = () => {
  return window.PublicKeyCredential !== undefined && 
         typeof window.PublicKeyCredential === 'function' &&
         typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
};

export const checkBiometricAvailability = async () => {
  if (!isBiometricsSupported()) {
    return false;
  }

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const registerBiometricCredential = async (email) => {
  if (!isBiometricsSupported()) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Secure Auth App',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(email),
        name: email,
        displayName: email,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    const credentialId = arrayBufferToBase64(credential.rawId);

    localStorage.setItem(`credential_${email}`, credentialId);
    
    return credentialId;
  } catch (error) {
    console.error('Error registering biometric credential:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Biometric authentication was cancelled or not allowed.');
    } else if (error.name === 'AbortError') {
      throw new Error('Biometric authentication aborted.');
    } else if (error.name === 'InvalidStateError') {
      throw new Error('Biometric credentials already registered.');
    } else {
      throw new Error('Biometric registration failed. Please try again.');
    }
  }
};

export const verifyBiometricCredential = async (email) => {
  if (!isBiometricsSupported()) {
    throw new Error('Biometric authentication is not supported on this device');
  }

  try {
    const storedCredentialId = localStorage.getItem(`credential_${email}`);
    
    if (!storedCredentialId) {
      throw new Error('No biometric credential found for this user');
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: base64ToArrayBuffer(storedCredentialId),
        type: 'public-key',
      }],
      timeout: 60000,
      userVerification: 'required',
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (!assertion) {
      throw new Error('Biometric authentication failed');
    }
    return true;
  } catch (error) {
    console.error('Error registering biometric credential:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Biometric authentication was cancelled or not allowed.');
    } else if (error.name === 'AbortError') {
      throw new Error('Biometric authentication aborted.');
    } else if (error.name === 'InvalidStateError') {
      throw new Error('Biometric credentials already registered.');
    } else {
      throw new Error('Biometric registration failed. Please try again.');
    }
  }
};