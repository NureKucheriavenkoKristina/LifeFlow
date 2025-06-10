import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const SeekerDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        

        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/seekers/profile`);
        setProfile(profileResponse.data.seekerProfile);
        

        const requestsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/seekers/requests`);
        

        const pending = requestsResponse.data.requests.filter(req => req.status === 'PENDING');
        const accepted = requestsResponse.data.requests.filter(req => req.status === 'ACCEPTED');
        
        setPendingRequests(pending);
        setAcceptedRequests(accepted);
        

        try {
          const searchesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/seekers/search-history`);
          setRecentSearches(searchesResponse.data.searches || []);
        } catch (searchError) {
          console.log('No search history available');
          setRecentSearches([]);
        }
        
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
  

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
      {/* Header with user info */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome, {currentUser?.firstName}!
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Joined {formatDate(currentUser?.createdAt)}
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block ml-3">
              <Link
                to="/seeker/search"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Find Blood Donors
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
        {/* Accepted Requests card */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Accepted Donation Requests</h3>
            <Link
              to="/seeker/requests"
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              View all
            </Link>
          </div>
          <div className="mt-5">
            {acceptedRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No accepted donation requests yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {acceptedRequests.slice(0, 3).map((request) => (
                  <li key={request._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-lg">
                            {request.donorId.userId.firstName?.charAt(0) || ''}
                            {request.donorId.userId.surName?.charAt(0) || ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.donorId.userId.firstName} {request.donorId.userId.surName}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 truncate mr-2">
                            Blood Type: {request.donorId.bloodType} {request.donorId.bloodResus}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        {request.meetingLink && (
                          <a
                            href={request.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            Join Meeting Link
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Pending Requests card */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Donation Requests</h3>
            <Link
              to="/seeker/requests"
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              View all
            </Link>
          </div>
          <div className="mt-5">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No pending donation requests at the moment.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingRequests.slice(0, 3).map((request) => (
                  <li key={request._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-600 font-medium text-lg">
                            {request.donorId.userId.firstName?.charAt(0) || ''}
                            {request.donorId.userId.surName?.charAt(0) || ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.donorId.userId.firstName} {request.donorId.userId.surName}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 truncate mr-2">
                            Blood Type: {request.donorId.bloodType} {request.donorId.bloodResus}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Link
                          to={`/seeker/requests?id=${request._id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Blood Type Info card */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Type Compatibility</h3>
          <div className="mt-5 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Can Receive From
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Can Donate To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    O+
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    O+, O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    O+, A+, B+, AB+
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    All Blood Types
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    A+
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    A+, A-, O+, O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    A+, AB+
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    A-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    A-, O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    A+, A-, AB+, AB-
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    B+
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    B+, B-, O+, O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    B+, AB+
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    B-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    B-, O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    B+, B-, AB+, AB-
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    AB+
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    All Blood Types
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    AB+ only
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    AB-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    AB-, A-, B-, O-
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    AB+, AB-
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick actions card */}
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-red-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-red-800 truncate">
                      Find Donors
                    </dt>
                    <dd className="mt-1">
                      <Link
                        to="/seeker/search"
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        Search for available blood donors
                      </Link>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-blue-800 truncate">
                      Messages
                    </dt>
                    <dd className="mt-1">
                      <Link
                        to="/seeker/messages"
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        View your conversations with donors
                      </Link>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent searches card */}
      {recentSearches.length > 0 && (
        <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Searches</h3>
          </div>
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Link
                  key={index}
                  to={`/seeker/search?${search.queryString}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <svg className="mr-1.5 h-2 w-2 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  {search.bloodType && `Blood: ${search.bloodType}`}
                  {search.bloodResus && ` ${search.bloodResus}`}
                  {search.donationType && ` · Type: ${search.donationType.replace('_', ' ').toLowerCase()}`}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Blood Donation Information */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Blood Donation Information</h3>
        <div className="mt-5 prose max-w-none">
          <p>
            Blood donation is a life-saving act that helps countless patients in need. Here's some important information about blood donation:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Whole Blood Donation:</strong> The most common type of donation, taking about 45-60 minutes. You can donate every 56 days.
            </li>
            <li>
              <strong>Plasma Donation:</strong> Takes about 1.5 hours. You can donate up to twice a week, with at least 48 hours between donations.
            </li>
            <li>
              <strong>Platelet Donation:</strong> Takes about 2-3 hours. You can donate every 7 days, up to 24 times per year.
            </li>
            <li>
              <strong>O Negative:</strong> Universal donor for red blood cells. Only 7% of the population has this blood type.
            </li>
            <li>
              <strong>AB Positive:</strong> Universal recipient. Can receive blood from all types.
            </li>
          </ul>
          
          <h4 className="text-md font-medium mt-4">Why Blood Donation Matters</h4>
          <p>
            Every 2 seconds, someone needs blood. A single car accident victim can require up to 100 units of blood. Your donation can help save up to 3 lives!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;