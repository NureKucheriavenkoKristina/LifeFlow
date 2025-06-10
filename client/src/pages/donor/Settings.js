import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const DonorSettings = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  

  const [formData, setFormData] = useState({
    allowProfileVisibility: false,
    consentToDataProcessing: false,
    weight: '',
    gender: '',
    birthDay: '',
    bloodType: '',
    bloodResus: '',
    email: '',
    firstName: '',
    surName: '',
    middleName: ''
  });
  

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        

        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/donors/profile`);
        setProfile(profileResponse.data.donorProfile);
        

        setFormData({
          allowProfileVisibility: profileResponse.data.donorProfile.allowProfileVisibility || false,
          consentToDataProcessing: profileResponse.data.donorProfile.consentToDataProcessing || false,
          weight: profileResponse.data.donorProfile.weight || '',
          gender: profileResponse.data.donorProfile.gender || '',
          birthDay: profileResponse.data.donorProfile.birthDay 
            ? new Date(profileResponse.data.donorProfile.birthDay).toISOString().split('T')[0] 
            : '',
          bloodType: profileResponse.data.donorProfile.bloodType || '',
          bloodResus: profileResponse.data.donorProfile.bloodResus || '',
          email: currentUser.email || '',
          firstName: currentUser.firstName || '',
          surName: currentUser.surName || '',
          middleName: currentUser.middleName || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to load your profile data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSecurityInputChange = (e) => {
    const { name, value } = e.target;
    setSecurityData({
      ...securityData,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      

      await axios.put(`${process.env.REACT_APP_API_URL}/api/donors/profile`, {
        allowProfileVisibility: formData.allowProfileVisibility,
        consentToDataProcessing: formData.consentToDataProcessing,
        weight: formData.weight,
        gender: formData.gender,
        birthDay: formData.birthDay,
        bloodType: formData.bloodType,
        bloodResus: formData.bloodResus
      });
      

      setSuccess(true);
      

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
      setSaving(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update your profile. Please try again.');
      setSaving(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    

    if (securityData.newPassword !== securityData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    if (securityData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      

      await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/change-password`, {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      

      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      

      setSuccess(true);
      

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
      setSaving(false);
    } catch (err) {
      console.error('Failed to update password:', err);
      setError(err.response?.data?.message || 'Failed to update your password. Please check your current password and try again.');
      setSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {

      const passwordPrompt = prompt('Please enter your password to confirm account deletion:');
      
      if (passwordPrompt !== null) {
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/delete-account`, {
            data: { password: passwordPrompt }
          });
          logout();
          window.location.href = '/login';
        } catch (err) {
          console.error('Failed to delete account:', err);
          setError(err.response?.data?.message || 'Failed to delete your account. Please try again later.');
        }
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Account Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile information and account preferences.
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Settings updated successfully!</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Information */}
      <form onSubmit={handleProfileSubmit} className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal details and donor preferences.
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Personal Information */}
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  disabled
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Contact support to change your name.</p>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="surName" className="block text-sm font-medium text-gray-700">
                Surname
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="surName"
                  id="surName"
                  value={formData.surName}
                  disabled
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                Middle Name (optional)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="middleName"
                  id="middleName"
                  value={formData.middleName}
                  disabled
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Contact support to change your email.</p>
            </div>
            
            {/* Blood Information */}
            <div className="sm:col-span-6">
              <div className="border-t border-gray-200 pt-5">
                <h4 className="text-md font-medium text-gray-900">Blood Information</h4>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                Blood Type
              </label>
              <div className="mt-1">
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select blood type</option>
                  <option value="I">O (I)</option>
                  <option value="II">A (II)</option>
                  <option value="III">B (III)</option>
                  <option value="IV">AB (IV)</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="bloodResus" className="block text-sm font-medium text-gray-700">
                Blood Resus Factor
              </label>
              <div className="mt-1">
                <select
                  id="bloodResus"
                  name="bloodResus"
                  value={formData.bloodResus}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select resus factor</option>
                  <option value="POSITIVE">Positive (+)</option>
                  <option value="NEGATIVE">Negative (-)</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="birthDay" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="birthDay"
                  id="birthDay"
                  value={formData.birthDay}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  min="50"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum weight required: 50kg</p>
            </div>
            
            {/* Privacy Settings */}
            <div className="sm:col-span-6">
              <div className="border-t border-gray-200 pt-5">
                <h4 className="text-md font-medium text-gray-900">Privacy Settings</h4>
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allowProfileVisibility"
                    name="allowProfileVisibility"
                    type="checkbox"
                    checked={formData.allowProfileVisibility}
                    onChange={handleInputChange}
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="allowProfileVisibility" className="font-medium text-gray-700">
                    Allow Profile Visibility
                  </label>
                  <p className="text-gray-500 text-sm">
                    Allow seekers to find and contact me for blood donation requests.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="consentToDataProcessing"
                    name="consentToDataProcessing"
                    type="checkbox"
                    checked={formData.consentToDataProcessing}
                    onChange={handleInputChange}
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="consentToDataProcessing" className="font-medium text-gray-700">
                    Consent to Data Processing
                  </label>
                  <p className="text-gray-500 text-sm">
                    I consent to the processing of my personal and medical data for the purpose of blood donation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              saving ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
      
      {/* Security Settings */}
      <form onSubmit={handlePasswordSubmit} className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your password and manage your account security.
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={securityData.currentPassword}
                  onChange={handleSecurityInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={securityData.newPassword}
                  onChange={handleSecurityInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  minLength="6"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long.</p>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={securityData.confirmPassword}
                  onChange={handleSecurityInputChange}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  minLength="6"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              saving ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : 'Update Password'}
          </button>
        </div>
      </form>
      
      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-red-700">Danger Zone</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Permanently delete your account and all of your data. This action cannot be undone.
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorSettings;