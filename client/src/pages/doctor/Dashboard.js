import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, endpoints } from '../../utils/apiClient';
import { AuthContext } from '../../contexts/AuthContext';

const DoctorDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [stats, setStats] = useState({
    userCounts: [],
    donationCounts: [],
    monthlyDonations: []
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        

        const verificationsResponse = await apiClient.get(endpoints.doctors.pendingVerifications);
        setPendingVerifications(verificationsResponse.data.pendingVerifications.slice(0, 5));
        

        const statsResponse = await apiClient.get(endpoints.doctors.statistics);
        setStats(statsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
  

  const getTotalDonations = () => {
    return stats.donationCounts.reduce((total, item) => total + item.count, 0);
  };
  

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
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
      {/* Header with user info */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome, Dr. {currentUser?.firstName}!
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatDate(new Date())}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Admin Access
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block ml-3">
              <Link
                to="/doctor/verifications"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verify Donors
              </Link>
            </span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
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
      
      {/* Dashboard grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Platform statistics card */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Platform Statistics</h3>
          
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Users card */}
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Users
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.userCounts.reduce((total, item) => total + item.count, 0)}
              </dd>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>Donors:</div>
                  <div className="font-medium">
                    {stats.userCounts.find(item => item._id === 'DONOR')?.count || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>Seekers:</div>
                  <div className="font-medium">
                    {stats.userCounts.find(item => item._id === 'SEEKER')?.count || 0}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>Doctors:</div>
                  <div className="font-medium">
                    {stats.userCounts.find(item => item._id === 'DOCTOR')?.count || 0}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total donations card */}
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Donations
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {getTotalDonations()}
              </dd>
              <div className="mt-3">
                {stats.donationCounts.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-sm text-gray-600">
                    <div>{getDonationTypeLabel(item._id)}:</div>
                    <div className="font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* This month donations card */}
            <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Donations This Month
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.monthlyDonations.length > 0 ? 
                  stats.monthlyDonations[stats.monthlyDonations.length - 1].count : 0}
              </dd>
              <div className="mt-3">
                <div className="text-sm text-gray-600">
                  {stats.monthlyDonations.length > 1 ? (
                    <div className="flex items-center">
                      {stats.monthlyDonations[stats.monthlyDonations.length - 1].count > 
                       stats.monthlyDonations[stats.monthlyDonations.length - 2].count ? (
                        <>
                          <svg className="h-5 w-5 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-600">
                            Increased from last month
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red-600">
                            Decreased from last month
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div>No previous month data</div>
                  )}
                </div>
              </div>
            </div>
          </dl>
        </div>
        
        {/* Monthly donations chart */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Monthly Donations</h3>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              {stats.monthlyDonations.length === 0 ? 'No data available' : ''}
            </div>
            <div className="h-64 flex items-end space-x-2">
              {stats.monthlyDonations.map((item, index) => (
                <div key={`${item._id.year}-${item._id.month}`} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${Math.max(5, (item.count / Math.max(...stats.monthlyDonations.map(d => d.count))) * 100)}%` 
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getMonthName(item._id.month).substring(0, 3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending verifications card */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Verifications</h3>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <Link
              to="/doctor/verifications"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="mt-6">
          {pendingVerifications.length === 0 ? (
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
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Donor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Blood Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Submission Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medical Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingVerifications.map((donor) => (
                    <tr key={donor._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {donor.userId.firstName?.charAt(0) || ''}
                              {donor.userId.surName?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {donor.userId.firstName} {donor.userId.surName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donor.userId.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{donor.bloodType} {donor.bloodResus}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(donor.updatedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {donor.hasChronicDiseases ? 'Has chronic conditions' : 'Awaiting review'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/doctor/verifications?id=${donor._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick actions card */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Verify Donors
                  </dt>
                  <dd className="mt-1">
                    <Link
                      to="/doctor/verifications"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Review and verify donor profiles
                    </Link>
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    View Statistics
                  </dt>
                  <dd className="mt-1">
                    <Link
                      to="/doctor/statistics"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Review donation statistics and user metrics
                    </Link>
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Record Donation
                  </dt>
                  <dd className="mt-1">
                    <Link
                      to="/doctor/record-donation"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Record a new donation from verified donors
                    </Link>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;