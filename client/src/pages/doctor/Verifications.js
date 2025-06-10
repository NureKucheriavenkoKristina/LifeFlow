import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient, endpoints } from '../../utils/apiClient';

const DoctorVerifications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const donorId = queryParams.get('id');
  
  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        setLoading(true);
        

        const response = await apiClient.get(endpoints.doctors.pendingVerifications);
        setPendingDonors(response.data.pendingVerifications);
        

        if (donorId) {
          const selectedDonorData = response.data.pendingVerifications.find(donor => donor._id === donorId);
          if (selectedDonorData) {
            setSelectedDonor(selectedDonorData);
            console.log('Selected donor data:', selectedDonorData);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch pending verifications:', err);
        setError('Failed to load pending verifications. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPendingVerifications();
  }, [donorId]);

  const DISQUALIFYING_LABELS = {
    HIV_AIDS: 'HIV/AIDS',
    hepatitisBorC: 'Hepatitis B or C',
    syphilis: 'Syphilis',
    tuberculosisActiveOrPast: 'Tuberculosis (Active or Past)',
    oncologicalDiseases: 'Oncological Diseases (Cancer)',
    diabetesMellitus: 'Diabetes Mellitus',
    heartAndVascularDiseases: 'Heart and Vascular Diseases',
    centralNervousSystemDiseases: 'Central Nervous System Diseases',
    autoimmuneDiseases: 'Autoimmune Diseases',
    bloodDiseases: 'Blood Diseases or Disorders'
  };

  const TEMPORARY_LABELS = {
    hasRecentUpgade: 'Recent Tattoo/Piercing/Permanent Makeup',
    acuteRespiratoryInfections: 'Recent Respiratory Infection (cold, flu etc.)',
    antibioticTherapy: 'Recent Antibiotic Therapy',
    vaccination: 'Recent Vaccination',
    surgeriesInjuriesStitches: 'Recent Surgery/Injury/Stitches',
    pregnancy: 'Pregnancy/Recent Delivery',
    dentalPocedures: 'Recent Dental Procedure',
    herpesSimplex: 'Recent Herpes Simplex Outbreak (Cold Sores)'
  };

  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor);
    setFeedback('');
    setSuccess(false);
    

    const newUrl = `${window.location.pathname}?id=${donor._id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  const handleReview = async (decision) => {
    if (!selectedDonor) return;
    
    try {
      setProcessing(true);
      

      await apiClient.post(endpoints.doctors.reviewVerification, {
        donorId: selectedDonor._id,
        decision,
        feedback
      });
      

      setPendingDonors(pendingDonors.filter(donor => donor._id !== selectedDonor._id));
      
      setSuccess(true);
      setSelectedDonor(null);
      setFeedback('');
      

      const newUrl = window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
      

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
      setProcessing(false);
    } catch (err) {
      console.error('Failed to review verification:', err);
      setError('Failed to process verification. Please try again.');
      setProcessing(false);
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  

  const getBloodTypeLabel = (type) => {
    switch (type) {
      case 'I': return 'O (I)';
      case 'II': return 'A (II)';
      case 'III': return 'B (III)';
      case 'IV': return 'AB (IV)';
      default: return type;
    }
  };
  

  const getBloodResusLabel = (resus) => {
    return resus === 'POSITIVE' ? 'Positive (+)' : 'Negative (-)';
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Donor Verifications</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and verify donor applications to ensure they meet medical standards.
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
              <h3 className="text-sm font-medium text-green-800">Verification processed successfully!</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending donors list */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Verifications</h3>
          
          {pendingDonors.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending verifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                All donor profiles have been verified.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pendingDonors.map((donor) => (
                <li 
                  key={donor._id} 
                  className={`py-4 cursor-pointer ${selectedDonor?._id === donor._id ? 'bg-blue-50' : ''}`}
                  onClick={() => handleDonorSelect(donor)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {donor.userId.firstName?.charAt(0) || ''}
                          {donor.userId.surName?.charAt(0) || ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {donor.userId.firstName} {donor.userId.surName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Blood Type: {getBloodTypeLabel(donor.bloodType)} {getBloodResusLabel(donor.bloodResus)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Submitted: {formatDate(donor.updatedAt || donor.createdAt)}
                      </p>
                    </div>
                    <div>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Donor details and review form */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg divide-y divide-gray-200">
          {selectedDonor ? (
            <>
              {/* Donor header */}
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Donor Details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review medical information before approving or rejecting.
                </p>
              </div>
              
              {/* Donor personal info */}
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
                    <div className="mt-3">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {selectedDonor.userId.firstName?.charAt(0) || ''}
                              {selectedDonor.userId.surName?.charAt(0) || ''}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedDonor.userId.firstName} {selectedDonor.middleName ? selectedDonor.userId.middleName + ' ' : ''}{selectedDonor.userId.surName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedDonor.userId.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="text-sm text-gray-900">
                            {selectedDonor.gender === 'MALE' ? 'Male' : 'Female'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Birth Date</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(selectedDonor.birthDay)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="text-sm text-gray-900">
                            {selectedDonor.weight} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Blood Type</p>
                          <p className="text-sm text-gray-900">
                            {getBloodTypeLabel(selectedDonor.bloodType)} {getBloodResusLabel(selectedDonor.bloodResus)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Medical Status</h4>
                    <div className="mt-3">
                      <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                              <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Medical Review Required
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              {(() => {
                                const info = selectedDonor.medicalInfo || {};
                                // Перевіряємо, чи хоча б одне булеве поле true
                                const hasAnyIssue = Object.keys(DISQUALIFYING_LABELS).some(
                                    (key) => info[key] === true
                                ) || Object.keys(TEMPORARY_LABELS).some(
                                    (key) => info[key] === true
                                );
                                return hasAnyIssue
                                    ? 'Donor has one or more disqualifying or temporary conditions. Please review all details below.'
                                    : 'Donor reported no medical restrictions.';
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 mt-4">Disqualifying Conditions</h5>
                        <div className="space-y-2">
                          {Object.entries(DISQUALIFYING_LABELS).map(([key, label]) => {
                            const value = selectedDonor.medicalInfo?.[key];
                            if (value) {
                              return (
                                  <div key={key} className="flex items-center">
                                    <svg
                                        className="h-5 w-5 text-red-500 mr-2"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                      <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                          clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-sm text-gray-900">{label}</span>
                                  </div>
                              );
                            }
                            return null;
                          })}
                          {Object.keys(DISQUALIFYING_LABELS).every(
                              (key) => !selectedDonor.medicalInfo?.[key]
                          ) && (
                              <p className="text-sm text-gray-500">No disqualifying conditions reported.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 mt-4">Temporary Restrictions</h5>
                        <div className="space-y-2">
                          {Object.entries(TEMPORARY_LABELS).map(([key, label]) => {
                            const boolVal = selectedDonor.medicalInfo?.[key];
                            const dateKey = `${key}Date`;
                            const dateVal = selectedDonor.medicalInfo?.[dateKey];
                            if (boolVal) {
                              return (
                                  <div key={key} className="flex flex-col">
                                    <div className="flex items-center">
                                      <svg
                                          className="h-5 w-5 text-blue-500 mr-2"
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                      >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-9.5V6a.75.75 0 00-1.5 0v3.25c0 .207.067.396.182.556l2.062 2.78a.75.75 0 001.174-.932l-2.06-2.774c-.065-.088-.101-.192-.101-.3z"
                                            clipRule="evenodd"
                                        />
                                      </svg>
                                      <span className="text-sm text-gray-900">{label}</span>
                                    </div>
                                    {dateVal && (
                                        <p className="text-xs text-gray-500 ml-7">
                                          Date: {formatDate(dateVal)}
                                        </p>
                                    )}
                                  </div>
                              );
                            }
                            return null;
                          })}
                          {Object.keys(TEMPORARY_LABELS).every(
                              (key) => !selectedDonor.medicalInfo?.[key]
                          ) && (
                              <p className="text-sm text-gray-500">No temporary restrictions reported.</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">Donation Type Offered</p>
                        <p className="text-sm text-gray-900">
                          {selectedDonor.medicalInfo?.donationTypeOffered?.replace('_', ' ') || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Review form */}
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => handleReview('approve')}
                      disabled={processing}
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        processing ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve Donor
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview('reject')}
                      disabled={processing}
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        processing ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    >
                      {processing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject Donor
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 py-16 sm:px-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donor selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a donor from the list to review their application.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorVerifications;