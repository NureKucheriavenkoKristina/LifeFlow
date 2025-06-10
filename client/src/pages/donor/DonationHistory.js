import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient, {endpoints} from "../../utils/apiClient";

const DonorDonationHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationRecords, setDonationRecords] = useState([]);
  const [nextDonationDate, setNextDonationDate] = useState(null);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [stats, setStats] = useState({
    totalDonations: 0,
    wholeBloodCount: 0,
    plasmaCount: 0,
    plateletsCount: 0
  });
  useEffect(() => {
    const fetchNextDonationDate = async () => {
      try {
        const response = await apiClient.get(`${process.env.REACT_APP_API_URL}/api/donors/next-donation-date`);
        if (response.data.nextDonationDate) {
          setNextDonationDate(new Date(response.data.nextDonationDate));
        } else {
          setNextDonationDate(null);
        }
      } catch (err) {
        console.error('Failed to fetch next donation date:', err);
        setNextDonationDate(null);
      }
    };

    fetchNextDonationDate();
  }, []);

  useEffect(() => {
    const fetchDonationHistory = async () => {
      try {
        setLoading(true);
        

        const recordsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/donors/donation-history`);
        const records = recordsResponse.data.donationRecords;
        setDonationRecords(records);
        

        const wholeBloodRecords = records.filter(record => record.donationType === 'WHOLE_BLOOD');
        const plasmaRecords = records.filter(record => record.donationType === 'PLASMA');
        const plateletsRecords = records.filter(record => record.donationType === 'PLATELETS');
        
        setStats({
          totalDonations: records.length,
          wholeBloodCount: wholeBloodRecords.length,
          plasmaCount: plasmaRecords.length,
          plateletsCount: plateletsRecords.length
        });
        
        setStatsLoaded(true);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch donation history:', err);
        setError('Failed to load donation history. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDonationHistory();
  }, []);
  

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  

  const getDonationTypeBadgeColor = (type) => {
    switch (type) {
      case 'WHOLE_BLOOD':
        return 'bg-red-100 text-red-800';
      case 'PLASMA':
        return 'bg-yellow-100 text-yellow-800';
      case 'PLATELETS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  

  const getDonationTypeIcon = (type) => {
    switch (type) {
      case 'WHOLE_BLOOD':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        );
      case 'PLASMA':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
          </svg>
        );
      case 'PLATELETS':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Format donation type for display
  const formatDonationType = (type) => {
    return type.replace('_', ' ');
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
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Donation History</h2>
        <p className="mt-1 text-sm text-gray-500">
          View your donation records and statistics.
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
        {/* Next donation date card */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Next Available Donation Date</h3>
          <div className="mt-5">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {nextDonationDate ? nextDonationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Donation stats card */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Donation Statistics</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden shadow rounded-lg bg-white border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Donations
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {statsLoaded ? stats.totalDonations : '-'}
                  </dd>
                </dl>
              </div>
            </div>
            
            <div className="overflow-hidden shadow rounded-lg bg-white border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Whole Blood
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">
                    {statsLoaded ? stats.wholeBloodCount : '-'}
                  </dd>
                </dl>
              </div>
            </div>
            
            <div className="overflow-hidden shadow rounded-lg bg-white border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Plasma & Platelets
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                    {statsLoaded ? (stats.plasmaCount + stats.plateletsCount) : '-'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Donation records card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Donation Records</h3>
        
        {donationRecords.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donation records</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't made any donations yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donation Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donationRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.numberOfDonation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getDonationTypeIcon(record.donationType)}
                        </div>
                        <div className="ml-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDonationTypeBadgeColor(record.donationType)}`}>
                            {formatDonationType(record.donationType)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Donation benefits info card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Benefits of Regular Donation</h3>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p className="text-gray-700">
            Regular blood donation not only helps save lives but also provides several health benefits for the donor:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-700">
            <li>Free health check-up each time you donate</li>
            <li>Detection of serious diseases during screening tests</li>
            <li>Reduced risk of heart and liver ailments</li>
            <li>Reduced blood viscosity, which can help prevent heart attacks</li>
            <li>Enhanced production of new blood cells, improving overall health</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <h4 className="text-md font-medium text-gray-900">Whole Blood</h4>
            </div>
            <p className="text-sm text-gray-500">
              Donate every 56 days (8 weeks). The most common type of donation, helping accident victims, surgical patients, and more.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <h4 className="text-md font-medium text-gray-900">Plasma</h4>
            </div>
            <p className="text-sm text-gray-500">
              Donate every 14 days, up to 12 times per year. Helps patients with bleeding disorders, immune deficiencies, and serious burns.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h4 className="text-md font-medium text-gray-900">Platelets</h4>
            </div>
            <p className="text-sm text-gray-500">
              Donate every 14 days, up to 24 times per year. Vital for cancer patients undergoing chemotherapy and people with blood disorders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDonationHistory;