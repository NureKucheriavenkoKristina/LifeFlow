import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DoctorStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCounts: [],
    donationCounts: [],
    monthlyDonations: []
  });
  const [timeframe, setTimeframe] = useState('all');
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/doctors/statistics`);
        setStats(response.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setError('Failed to load statistics. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  

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
  

  const getRoleLabel = (role) => {
    switch (role) {
      case 'DONOR':
        return 'Donors';
      case 'SEEKER':
        return 'Seekers';
      case 'DOCTOR':
        return 'Doctors';
      default:
        return role;
    }
  };
  

  const getFilteredMonthlyDonations = () => {
    if (timeframe === 'all' || stats.monthlyDonations.length === 0) {
      return stats.monthlyDonations;
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (timeframe === 'year') {
      return stats.monthlyDonations.filter(item => item._id.year === currentYear);
    } else if (timeframe === 'month') {
      return stats.monthlyDonations.filter(
        item => item._id.year === currentYear && item._id.month === currentMonth
      );
    }
    
    return stats.monthlyDonations;
  };
  

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };
  

  const getMaxMonthlyCount = () => {
    const filtered = getFilteredMonthlyDonations();
    if (filtered.length === 0) return 0;
    return Math.max(...filtered.map(item => item.count));
  };
  

  const getChartHeight = (count) => {
    const maxCount = getMaxMonthlyCount();
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
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
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Donation Statistics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive overview of platform usage and donation statistics.
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
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total users card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.userCounts.reduce((total, item) => total + item.count, 0)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <div className="font-medium text-gray-500">User Distribution</div>
              <ul className="mt-1 space-y-1">
                {stats.userCounts.map((item) => (
                  <li key={item._id} className="flex justify-between">
                    <span className="text-gray-600">{getRoleLabel(item._id)}</span>
                    <span className="text-gray-900 font-medium">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              to="/doctor/users" 
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
            >
              View all users
              <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* Total donations card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Donations
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {getTotalDonations()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <div className="font-medium text-gray-500">Donation Types</div>
              <ul className="mt-1 space-y-1">
                {stats.donationCounts.map((item) => (
                  <li key={item._id} className="flex justify-between">
                    <span className="text-gray-600">{getDonationTypeLabel(item._id)}</span>
                    <span className="text-gray-900 font-medium">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              to="/doctor/donations" 
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
            >
              View all donations
              <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        {/* This month donations card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Average
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {stats.monthlyDonations.length > 0
                        ? Math.round(
                            stats.monthlyDonations.reduce((sum, item) => sum + item.count, 0) / 
                            stats.monthlyDonations.length
                          )
                        : 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <div className="font-medium text-gray-500">Recent Trend</div>
              <div className="mt-1">
                {stats.monthlyDonations.length > 1 ? (
                  (() => {
                    const lastMonth = stats.monthlyDonations[stats.monthlyDonations.length - 1];
                    const previousMonth = stats.monthlyDonations[stats.monthlyDonations.length - 2];
                    const change = lastMonth.count - previousMonth.count;
                    const percentChange = Math.round((change / previousMonth.count) * 100);
                    
                    return (
                      <div className="flex items-center">
                        {change >= 0 ? (
                          <>
                            <svg className="h-5 w-5 text-green-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-600">
                              {change} donation{change !== 1 ? 's' : ''} (+{percentChange}%) from previous month
                            </span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-600">
                              {Math.abs(change)} donation{Math.abs(change) !== 1 ? 's' : ''} ({percentChange}%) from previous month
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <span className="text-gray-600">Not enough data for trend analysis</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Monthly donations chart */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Donations</h3>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setTimeframe('month')}
                className={`inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 ${
                  timeframe === 'month'
                    ? 'bg-blue-100 text-blue-700 border-blue-500 z-10'
                    : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('year')}
                className={`-ml-px inline-flex items-center px-4 py-2 border border-gray-300 ${
                  timeframe === 'year'
                    ? 'bg-blue-100 text-blue-700 border-blue-500 z-10'
                    : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              >
                This Year
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('all')}
                className={`-ml-px inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 ${
                  timeframe === 'all'
                    ? 'bg-blue-100 text-blue-700 border-blue-500 z-10'
                    : 'bg-white text-gray-700'
                } text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          {stats.monthlyDonations.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donation data</h3>
              <p className="mt-1 text-sm text-gray-500">
                No donations have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="relative h-64">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-64 flex items-end">
                <div className="w-full flex space-x-2 justify-around">
                  {getFilteredMonthlyDonations().map((item) => (
                    <div 
                      key={`${item._id.year}-${item._id.month}`} 
                      className="flex flex-col items-center flex-1"
                    >
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${getChartHeight(item.count)}%` }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {getChartHeight(item.count) > 15 && (
                            <span className="text-white text-xs font-bold">
                              {item.count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        <div>{getMonthName(item._id.month).substring(0, 3)}</div>
                        <div>{item._id.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Donation comparison chart */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Donation Type Comparison</h3>
        
        {stats.donationCounts.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donation data</h3>
            <p className="mt-1 text-sm text-gray-500">
              No donations have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <div className="relative pt-1">
              {stats.donationCounts.map((item, index) => {
                const total = getTotalDonations();
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const colors = [
                  'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500'
                ];
                
                return (
                  <div key={item._id} className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {getDonationTypeLabel(item._id)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-200">
                      <div
                        className={`${colors[index % colors.length]} h-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* User role distribution pie chart */}
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Distribution</h3>
        
        {stats.userCounts.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No user data</h3>
            <p className="mt-1 text-sm text-gray-500">
              No users have been registered yet.
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto">
                {/* Simple SVG pie chart */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {(() => {
                    const totalUsers = stats.userCounts.reduce((total, item) => total + item.count, 0);
                    let startAngle = 0;
                    const colors = ['#EF4444', '#F59E0B', '#3B82F6']; // Red, Yellow, Blue
                    
                    return stats.userCounts.map((item, index) => {
                      const percentage = totalUsers > 0 ? (item.count / totalUsers) * 100 : 0;
                      const angle = (percentage / 100) * 360;
                      const endAngle = startAngle + angle;
                      
                      // Convert angles to radians
                      const startRad = (startAngle - 90) * (Math.PI / 180);
                      const endRad = (endAngle - 90) * (Math.PI / 180);
                      
                      // Calculate points
                      const x1 = 50 + 50 * Math.cos(startRad);
                      const y1 = 50 + 50 * Math.sin(startRad);
                      const x2 = 50 + 50 * Math.cos(endRad);
                      const y2 = 50 + 50 * Math.sin(endRad);
                      
                      // Create path
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      
                      const path = (
                        <path
                          key={item._id}
                          d={pathData}
                          fill={colors[index % colors.length]}
                        />
                      );
                      
                      startAngle += angle;
                      return path;
                    });
                  })()}
                </svg>
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-4">
                  {stats.userCounts.map((item, index) => {
                    const totalUsers = stats.userCounts.reduce((total, item) => total + item.count, 0);
                    const percentage = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0;
                    const bgColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500'];
                    
                    return (
                      <div key={item._id}>
                        <div className="flex items-center">
                          <div className={`h-4 w-4 ${bgColors[index % bgColors.length]} rounded-full mr-2`}></div>
                          <div className="text-sm font-medium text-gray-900">{getRoleLabel(item._id)}</div>
                          <div className="ml-auto text-sm font-medium text-gray-500">
                            {item.count} ({percentage}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorStatistics;