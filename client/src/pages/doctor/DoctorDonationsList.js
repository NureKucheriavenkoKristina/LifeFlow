import React, { useState, useEffect } from 'react';
import { apiClient, endpoints } from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';

const DoctorDonationsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [donationTypes, setDonationTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get('/api/doctors/admin/donations');
        
        setDonations(response.data.donations);
        setFilteredDonations(response.data.donations);
        

        const types = [...new Set(response.data.donations.map(d => d.donationType))];
        setDonationTypes(types);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch donations:', err);
        setError('Failed to load donations. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDonations();
  }, []);

  useEffect(() => {

    let result = [...donations];
    

    if (selectedType !== 'ALL') {
      result = result.filter(donation => donation.donationType === selectedType);
    }
    

    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(donation => new Date(donation.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      result = result.filter(donation => new Date(donation.date) <= end);
    }
    

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(donation => 
        (donation.donor?.firstName?.toLowerCase().includes(query) || 
         donation.donor?.surName?.toLowerCase().includes(query) ||
         donation.seeker?.firstName?.toLowerCase().includes(query) || 
         donation.seeker?.surName?.toLowerCase().includes(query))
      );
    }
    
    setFilteredDonations(result);
  }, [searchQuery, startDate, endDate, selectedType, donations]);

  const handleDonationClick = async (donation) => {
    setSelectedDonation(donation);
    setShowModal(true);
  };

  const handleMessageUser = (userId) => {

    window.location.href = `/doctor/messages/${userId}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDonationTypeLabel = (type) => {
    switch (type) {
      case 'WHOLE_BLOOD':
        return 'Whole Blood';
      case 'PLASMA':
        return 'Plasma';
      case 'PLATELETS':
        return 'Platelets';
      default:
        return type;
    }
  };

  const getDonationTypeBadgeColor = (type) => {
    switch (type) {
      case 'WHOLE_BLOOD':
        return 'bg-red-100 text-red-700';
      case 'PLASMA':
        return 'bg-blue-100 text-blue-700';
      case 'PLATELETS':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };


  const renderDonationDetailsModal = () => {
    if (!selectedDonation) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 overflow-auto max-h-[90vh]">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              Donation Details
            </h2>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDonationTypeBadgeColor(selectedDonation.donationType)}`}>
                {getDonationTypeLabel(selectedDonation.donationType)}
              </span>
            </div>
            
            {/* Donation basic info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Donation ID</p>
                <p className="mt-1 text-sm text-gray-900">{selectedDonation._id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedDonation.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Donation Number</p>
                <p className="mt-1 text-sm text-gray-900">#{selectedDonation.numberOfDonation}</p>
              </div>
            </div>
            
            {/* Donor and Seeker information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Donor information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Donor</h3>
                {selectedDonation.donor ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedDonation.donor.firstName} {selectedDonation.donor.surName}
                        </p>
                        {selectedDonation.donorProfile?.bloodType && (
                          <p className="text-sm text-gray-500">
                            Blood Type: {selectedDonation.donorProfile.bloodType}{selectedDonation.donorProfile.bloodResus}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleMessageUser(selectedDonation.donor._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full justify-center"
                    >
                      Message Donor
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Donor information not available</p>
                )}
              </div>
              
              {/* Seeker information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Seeker</h3>
                {selectedDonation.seeker ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedDonation.seeker.firstName} {selectedDonation.seeker.surName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMessageUser(selectedDonation.seeker._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center"
                    >
                      Message Seeker
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No specific seeker for this donation</p>
                )}
              </div>
            </div>
            
            {/* Notes or additional info */}
            {selectedDonation.notes && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedDonation.notes}</p>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-4 sm:mb-0">
          All Donations
        </h2>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by donor/seeker name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64 sm:text-sm border-gray-300 rounded-md"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Date filters */}
          <div className="flex space-x-2">
            <div>
              <label htmlFor="start-date" className="sr-only">From</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="sr-only">To</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Donation type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="block w-full sm:w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="ALL">All Types</option>
            {donationTypes.map(type => (
              <option key={type} value={type}>{getDonationTypeLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
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
      
      {!loading && !error && filteredDonations.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
      
      {!loading && !error && filteredDonations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seeker
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr 
                  key={donation._id} 
                  onClick={() => handleDonationClick(donation)}
                  className="hover:bg-gray-50 cursor-pointer transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(donation.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {donation.donor ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donor.firstName} {donation.donor.surName}
                          </div>
                          {donation.donorProfile?.bloodType && (
                            <div className="text-xs text-gray-500">
                              {donation.donorProfile.bloodType}{donation.donorProfile.bloodResus}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {donation.seeker ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.seeker.firstName} {donation.seeker.surName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">General Donation</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDonationTypeBadgeColor(donation.donationType)}`}>
                      {getDonationTypeLabel(donation.donationType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{donation.numberOfDonation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Donation details modal */}
      {showModal && renderDonationDetailsModal()}
    </div>
  );
};

export default DoctorDonationsList;