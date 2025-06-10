
import React, {useState, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';
import {AuthContext} from '../../contexts/AuthContext';
import apiClient, {endpoints} from '../../utils/apiClient';

const DonorDashboard = () => {
    const {currentUser} = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [medicalInfo, setMedicalInfo] = useState(null);
    const [nextDonationDate, setNextDonationDate] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);
    const [stats, setStats] = useState({
        totalDonations: 0,
        lastDonationDate: null,
        verificationStatus: 'PENDING'
    });
    const [restrictions, setRestrictions] = useState([]);
    const formatRestrictionType = (type) => {
        switch (type) {
            case 'hasRecentUpgade':
                return 'Tattoo/Piercing Restriction';
            case 'acuteRespiratoryInfections':
                return 'Respiratory Infections';
            case 'antibioticTherapy':
                return 'Antibiotic Therapy';
            case 'vaccination':
                return 'Vaccination Restriction';
            case 'surgeriesInjuriesStitches':
                return 'Surgeries/Injuries';
            case 'pregnancy':
                return 'Pregnancy Restriction';
            case 'dentalPocedures':
                return 'Dental Procedures';
            case 'herpesSimplex':
                return 'Herpes Simplex';
            default:
                return 'Medical Restriction';
        }
    };
    useEffect(() => {
        const storedNextDonationDate = localStorage.getItem('nextDonationDate');
        const storedRestrictions = localStorage.getItem('medicalRestrictions');

        if (storedNextDonationDate) {
            setNextDonationDate(storedNextDonationDate);
        }
        if (storedRestrictions) {
            setRestrictions(JSON.parse(storedRestrictions));
        }
    }, []);

    useEffect(() => {
      const fetchDashboardData = async () => {
        setLoading(true);

        try {

          const profileResponse = await apiClient.get(endpoints.donors.profile);
          setProfile(profileResponse.data.donorProfile);
          setMedicalInfo(profileResponse.data.medicalInfo);


          try {
            const nextDonationResponse = await apiClient.get(endpoints.donors.nextDonationDate);
            setNextDonationDate(nextDonationResponse.data.nextDonationDate);
            setRestrictions(nextDonationResponse.data.medicalRestrictions || []);
          } catch (donationErr) {
            if (donationErr.response?.status === 404) {
              console.warn('No next donation date found — probably new user.');
              setNextDonationDate(null);
              setRestrictions([]);
            } else {
              console.error('Failed to fetch next donation date:', donationErr);
              throw donationErr;
            }
          }


          try {
            const requestsResponse = await apiClient.get(endpoints.donors.searchRequests);
            const pendingReqs = requestsResponse.data.searchRequests.filter(req => req.status === 'PENDING');
            setPendingRequests(pendingReqs);
          } catch (requestsErr) {
            console.error('Failed to fetch donation requests:', requestsErr);
          }


          try {
            const historyResponse = await apiClient.get(endpoints.donors.donationHistory);
            setRecentDonations(historyResponse.data.donationRecords.slice(0, 3));

            setStats({
              totalDonations: historyResponse.data.donationRecords.length,
              lastDonationDate: historyResponse.data.donationRecords[0]?.date || null,
              verificationStatus: profileResponse.data.donorProfile.verificationStatus
            });
          } catch (historyErr) {
            console.error('Failed to fetch donation history:', historyErr);
          }

        } catch (err) {
          console.error('Failed to fetch dashboard data:', err);
          setError('Failed to load dashboard data. Please try again later.');
        } finally {
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


    const getVerificationBadgeColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };


    const getVerificationBadgeText = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'Verified';
            case 'REJECTED':
                return 'Verification Rejected';
            default:
                return 'Pending Verification';
        }
    };


    const needsQuestionnaire = !medicalInfo;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                             fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"/>
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        <div className="mt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with verification status */}
            <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Welcome, {currentUser?.firstName}!
                        </h2>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                          clipRule="evenodd"/>
                                </svg>
                                Joined {formatDate(currentUser?.createdAt)}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                          clipRule="evenodd"/>
                                </svg>
                                Blood Type: {profile?.bloodType || 'Not set'} {profile?.bloodResus || ''}
                            </div>
                            <div className="mt-2 flex items-center">
                <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationBadgeColor(stats.verificationStatus)}`}>
                  {getVerificationBadgeText(stats.verificationStatus)}
                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block ml-3">
              <Link
                  to="/donor/settings"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"/>
                </svg>
                Profile Settings
              </Link>
            </span>
                    </div>
                </div>
            </div>

            {/* Action required alerts */}
            {needsQuestionnaire && (
                <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Action required</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Please complete the medical questionnaire to become eligible for donation.
                                </p>
                            </div>
                            <div className="mt-4">
                                <div className="-mx-2 -my-1.5 flex">
                                    <Link
                                        to="/donor/questionnaire"
                                        className="px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100"
                                    >
                                        Complete Questionnaire
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {stats.verificationStatus === 'REJECTED' && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Verification Rejected</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>
                                    Your donor profile verification was rejected. Please update your medical information
                                    and submit for review again.
                                </p>
                            </div>
                            <div className="mt-4">
                                <div className="-mx-2 -my-1.5 flex">
                                    <Link
                                        to="/donor/questionnaire"
                                        className="px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                                    >
                                        Update Medical Information
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Next donation date card */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Next Available Donation Date</h3>
                    <div className="mt-5">
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {nextDonationDate ? formatDate(nextDonationDate) : 'Not available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 🔥 New Block: Medical Restrictions */}
                        {restrictions.length > 0 && (
                            <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                                <h4 className="text-md font-semibold text-yellow-800 mb-2">Current Medical
                                    Restrictions</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                                    {restrictions.map((restriction) => (
                                        <li key={restriction.type}>
                                            {formatRestrictionType(restriction.type)} —
                                            until {formatDate(restriction.date)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-4">
                            <p className="text-sm text-gray-500">
                                {stats.lastDonationDate ? `Last donation: ${formatDate(stats.lastDonationDate)}` : 'No donation records yet'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Total donations: {stats.totalDonations}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending requests card */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Donation Requests</h3>
                        <Link
                            to="/donor/requests"
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="mt-5">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500">No pending requests at the moment.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {pendingRequests.map((request) => (
                                    <li key={request._id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div
                                                    className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-medium text-lg">
                            {request.seekerId.userId.firstName?.charAt(0) || ''}
                              {request.seekerId.userId.surName?.charAt(0) || ''}
                          </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {request.seekerId.userId.firstName} {request.seekerId.userId.surName}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    Requested: {formatDate(request.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/donor/requests?id=${request._id}`}
                                                    className="inline-flex items-center shadow-sm px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Respond
                                                </Link>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recent donations card */}
                <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Donations</h3>
                        <Link
                            to="/donor/history"
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="mt-5">
                        {recentDonations.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500">No donation records yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {recentDonations.map((donation) => (
                                    <li key={donation._id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div
                                                    className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                    {donation.donationType === 'WHOLE_BLOOD' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                             className="h-6 w-6 text-red-600" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                                                        </svg>
                                                    )}
                                                    {donation.donationType === 'PLASMA' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                             className="h-6 w-6 text-yellow-600" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                                                        </svg>
                                                    )}
                                                    {donation.donationType === 'PLATELETS' && (
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                             className="h-6 w-6 text-purple-600" fill="none"
                                                             viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                                  strokeWidth={2}
                                                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {donation.donationType.replace('_', ' ')} Donation
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {formatDate(donation.date)}
                                                </p>
                                            </div>
                                            <div>
                        <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          #{donation.numberOfDonation}
                        </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg"
                                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt className="text-sm font-medium text-red-800 truncate">
                                            Update Medical Info
                                        </dt>
                                        <dd className="mt-1">
                                            <Link
                                                to="/donor/questionnaire"
                                                className="text-sm text-red-600 hover:text-red-500"
                                            >
                                                Complete or update your medical questionnaire
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
                                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg"
                                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt className="text-sm font-medium text-blue-800 truncate">
                                            Messages
                                        </dt>
                                        <dd className="mt-1">
                                            <Link
                                                to="/donor/messages"
                                                className="text-sm text-blue-600 hover:text-blue-500"
                                            >
                                                View your conversations with seekers and doctors
                                            </Link>
                                        </dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;