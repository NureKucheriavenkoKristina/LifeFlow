import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient, { endpoints } from '../../utils/apiClient';
import axios from 'axios';

const SeekerSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState(null);
  

  const [searchForm, setSearchForm] = useState({
    bloodType: queryParams.get('bloodType') || '',
    bloodResus: queryParams.get('bloodResus') || '',
    donationType: queryParams.get('donationType') || ''
  });
  

  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  
  useEffect(() => {

    if (searchForm.bloodType || searchForm.bloodResus || searchForm.donationType) {
      handleSearch();
    }
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm({
      ...searchForm,
      [name]: value
    });
  };
  
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    

    setDonors([]);
    setSelectedDonor(null);
    setError(null);
    setRequestSuccess(false);
    setRequestError(null);
    

    console.log('Search form values:', searchForm);
    
    try {
      setSearching(true);
      

      const queryParams = new URLSearchParams();
      if (searchForm.bloodType) queryParams.append('bloodType', searchForm.bloodType);
      if (searchForm.bloodResus) queryParams.append('bloodResus', searchForm.bloodResus);
      if (searchForm.donationType) queryParams.append('donationType', searchForm.donationType);
      navigate(`/seeker/search?${queryParams.toString()}`);
      

      console.log('Query parameters:', queryParams.toString());
      console.log('Donation type:', searchForm.donationType);
      

      const response = await apiClient.get(endpoints.seekers.search, { 
        params: {
          bloodType: searchForm.bloodType,
          bloodResus: searchForm.bloodResus,
          donationType: searchForm.donationType
        }
      });
      

      console.log('Search response:', response.data);
      
      setDonors(response.data.donors);
      setSearching(false);
    } catch (err) {
      console.error('Search error detail:', err.response?.data || err.message);
      setError('Failed to search for donors. Please try again later.');
      setSearching(false);
    }
  }
  
  const handleDonorSelect = (donor) => {
    setSelectedDonor(donor);
    setRequestSuccess(false);
    setRequestError(null);
  };
  
  const handleSendRequest = async () => {
    if (!selectedDonor) return;
    
    try {
      setLoading(true);
      setRequestError(null);
      

      await apiClient.post(endpoints.seekers.sendRequest, {
        donorId: selectedDonor.id
      });
      
      setRequestSuccess(true);
      setLoading(false);
      

      setTimeout(() => {
        setRequestSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Request error:', err);
      setRequestError(err.response?.data?.message || 'Failed to send request. Please try again.');
      setLoading(false);
    }
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
  
  const formatDonationType = (type) => {
    if (!type) return '';
    return type.replace('_', ' ').toLowerCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Find Blood Donors</h2>
        <p className="mt-1 text-sm text-gray-500">
          Search for available donors based on blood type and donation type.
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
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Search form */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg divide-y divide-gray-200">
          <form onSubmit={handleSearch} className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Search Criteria</h3>
            
            <div className="space-y-6">
              {/* Blood Type */}
              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                  Blood Type
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={searchForm.bloodType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="I">O (I)</option>
                  <option value="II">A (II)</option>
                  <option value="III">B (III)</option>
                  <option value="IV">AB (IV)</option>
                </select>
              </div>
              
              {/* Blood Resus Factor */}
              <div>
                <label htmlFor="bloodResus" className="block text-sm font-medium text-gray-700">
                  Resus Factor
                </label>
                <select
                  id="bloodResus"
                  name="bloodResus"
                  value={searchForm.bloodResus}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="POSITIVE">Positive (+)</option>
                  <option value="NEGATIVE">Negative (-)</option>
                </select>
              </div>
              
              {/* Donation Type */}
              <div>
                <label htmlFor="donationType" className="block text-sm font-medium text-gray-700">
                  Donation Type
                </label>
                <select
                  id="donationType"
                  name="donationType"
                  value={searchForm.donationType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  <option value="">Any</option>
                  <option value="WHOLE_BLOOD">Whole Blood</option>
                  <option value="PLASMA">Plasma</option>
                  <option value="PLATELETS">Platelets</option>
                </select>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={searching}
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    searching ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  {searching ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : 'Search Donors'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Blood Compatibility Quick Guide
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-16 font-medium">O+</div>
                <div className="text-gray-500">can receive from O+, O-</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">O-</div>
                <div className="text-gray-500">can receive from O-</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">A+</div>
                <div className="text-gray-500">can receive from A+, A-, O+, O-</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">A-</div>
                <div className="text-gray-500">can receive from A-, O-</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">B+</div>
                <div className="text-gray-500">can receive from B+, B-, O+, O-</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">B-</div>
                <div className="text-gray-500">can receive from B-, O-</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">AB+</div>
                <div className="text-gray-500">Universal recipient (all types)</div>
              </div>
              <div className="flex items-center">
                <div className="w-16 font-medium">AB-</div>
                <div className="text-gray-500">can receive from AB-, A-, B-, O-</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Search Results</h3>
              {donors.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Found {donors.length} {donors.length === 1 ? 'donor' : 'donors'} matching your criteria
                </p>
              )}
            </div>
            
            {searching ? (
              <div className="px-4 py-5 sm:p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : donors.length === 0 ? (
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center justify-center h-64">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No donors found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria to find more results.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {donors.map((donor) => (
                    <div
                      key={donor.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedDonor && selectedDonor.id === donor.id ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-200'
                      }`}
                      onClick={() => handleDonorSelect(donor)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 font-medium text-lg">
                              {donor.firstName.charAt(0)}
                              {donor.surName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {donor.firstName} {donor.surName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Blood Type: {getBloodTypeLabel(donor.bloodType)} {getBloodResusLabel(donor.bloodResus)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Selected donor details */}
          {selectedDonor && (
            <div className="mt-6 bg-white shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Donor Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review details and send a donation request.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 font-medium text-xl">
                        {selectedDonor.firstName.charAt(0)}
                        {selectedDonor.surName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedDonor.firstName} {selectedDonor.surName}
                    </h4>
                    <p className="text-gray-500">
                      Blood Type: {getBloodTypeLabel(selectedDonor.bloodType)} {getBloodResusLabel(selectedDonor.bloodResus)}
                    </p>
                  </div>
                </div>
                
                {requestSuccess && (
                  <div className="rounded-md bg-green-50 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Request sent successfully!
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            The donor will review your request and respond soon. You can track all your requests in the 'My Requests' section.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {requestError && (
                  <div className="rounded-md bg-red-50 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{requestError}</h3>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="prose max-w-none text-sm text-gray-500 mb-4">
                  <p>
                    When you send a request, the donor will be notified and can choose to accept or decline.
                    If accepted, you'll receive a meeting link where you can communicate directly with the donor.
                  </p>
                </div>
                
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={loading || requestSuccess}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      loading || requestSuccess
                        ? 'bg-red-400'
                        : 'bg-red-600 hover:bg-red-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Request...
                      </>
                    ) : requestSuccess ? (
                      <>
                        <svg className="h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Request Sent
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send Donation Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerSearch;