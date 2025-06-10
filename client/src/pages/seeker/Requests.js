import React, { useState, useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import apiClient, {endpoints} from "../../utils/apiClient";

const SeekerRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestId = queryParams.get('id');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/seekers/requests`);
        setRequests(response.data.requests);
        if (requestId) {
          const selectedReq = response.data.requests.find(req => req._id === requestId);
          if (selectedReq) {
            setSelectedRequest(selectedReq);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setError('Failed to load donation requests. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [requestId]);

  const handleMessageClick = async (userId) => {
    try {
      const response = await apiClient.get(endpoints.messages.conversations);

      const existingConversation = response.data.conversations.find(
          conv => conv.user._id === userId
      );

      if (!existingConversation) {
        await apiClient.post(endpoints.messages.send, {
          receiverId: userId,
          content: "Hello!"
        });
      }
      navigate(`/seeker/messages/${userId}`);
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
      setError('Failed to open messaging. Please try again.');
    }
  };
  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setCancelSuccess(false);
    

    const newUrl = `${window.location.pathname}?id=${request._id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  const handleCancelRequest = async () => {
    if (!selectedRequest || selectedRequest.status !== 'PENDING') {
      return;
    }
    
    try {
      setCancelling(true);
      

      await axios.delete(`${process.env.REACT_APP_API_URL}/api/seekers/requests/${selectedRequest._id}`);
      

      const updatedRequests = requests.map(req => {
        if (req._id === selectedRequest._id) {
          const updatedRequest = {
            ...req,
            status: 'CANCELLED'
          };
          setSelectedRequest(updatedRequest);
          return updatedRequest;
        }
        return req;
      });
      
      setRequests(updatedRequests);
      setCancelSuccess(true);
      setTimeout(() => {
        setCancelSuccess(false);
      }, 3000);
      
      setCancelling(false);
    } catch (err) {
      console.error('Failed to cancel request:', err);
      setError('Failed to cancel the donation request. Please try again.');
      setCancelling(false);
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
  

  const groupedRequests = {
    pending: requests.filter(req => req.status === 'PENDING'),
    accepted: requests.filter(req => req.status === 'ACCEPTED'),
    other: requests.filter(req => req.status !== 'PENDING' && req.status !== 'ACCEPTED')
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
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Donation Requests</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your donation requests to donors.
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
      
      {cancelSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Request cancelled successfully!</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Requests list */}
        <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">All Requests</h3>
          
          {/* Pending requests */}
          {groupedRequests.pending.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Pending ({groupedRequests.pending.length})
              </h4>
              <ul className="divide-y divide-gray-200">
                {groupedRequests.pending.map((request) => (
                  <li 
                    key={request._id} 
                    className={`py-4 cursor-pointer ${selectedRequest?._id === request._id ? 'bg-red-50' : ''}`}
                    onClick={() => handleRequestSelect(request)}
                  >
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
                        <p className="text-sm text-gray-500 truncate">
                          Requested: {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Accepted requests */}
          {groupedRequests.accepted.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Accepted ({groupedRequests.accepted.length})
              </h4>
              <ul className="divide-y divide-gray-200">
                {groupedRequests.accepted.map((request) => (
                  <li 
                    key={request._id} 
                    className={`py-4 cursor-pointer ${selectedRequest?._id === request._id ? 'bg-red-50' : ''}`}
                    onClick={() => handleRequestSelect(request)}
                  >
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
                        <p className="text-sm text-gray-500 truncate">
                          Accepted: {formatDate(request.updatedAt || request.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Other requests (rejected/cancelled) */}
          {groupedRequests.other.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Other Requests ({groupedRequests.other.length})
              </h4>
              <ul className="divide-y divide-gray-200">
                {groupedRequests.other.map((request) => (
                  <li 
                    key={request._id} 
                    className={`py-4 cursor-pointer ${selectedRequest?._id === request._id ? 'bg-red-50' : ''}`}
                    onClick={() => handleRequestSelect(request)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-lg">
                            {request.donorId.userId.firstName?.charAt(0) || ''}
                            {request.donorId.userId.surName?.charAt(0) || ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.donorId.userId.firstName} {request.donorId.userId.surName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {request.status}: {formatDate(request.updatedAt || request.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {requests.length === 0 && (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't sent any donation requests yet.
              </p>
            </div>
          )}
        </div>
        
        {/* Request details */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          {selectedRequest ? (
            <div>
              <div className="border-b border-gray-200 pb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Request Details
                </h3>
                <div className="mt-2 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    Requested on {formatDate(selectedRequest.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="py-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Donor Information</h4>
                  <div className="mt-3 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-medium text-lg">
                          {selectedRequest.donorId.userId.firstName?.charAt(0) || ''}
                          {selectedRequest.donorId.userId.surName?.charAt(0) || ''}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedRequest.donorId.userId.firstName} {selectedRequest.donorId.userId.surName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Blood Type: {selectedRequest.donorId.bloodType} {selectedRequest.donorId.bloodResus}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedRequest.status === 'ACCEPTED' && (
                  <div>
                    {/* Request Details section */}
                    <div className="mt-5">
                      <h4 className="text-sm font-medium text-gray-500">Request Details</h4>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-900">
                          <strong>Blood Type:</strong> {selectedRequest.bloodType || 'Any'}
                        </p>
                        <p className="text-sm text-gray-900">
                          <strong>Resus Factor:</strong> {selectedRequest.resusFactor || 'Any'}
                        </p>
                        <p className="text-sm text-gray-900">
                          <strong>Donation Type:</strong> {selectedRequest.donationType || 'Whole Blood'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-5 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Request Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                      true ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Request sent</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedRequest.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-5 w-5 rounded-full ${
                      selectedRequest.status !== 'PENDING' ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Donor responded</p>
                      <p className="text-sm text-gray-500">
                        {selectedRequest.status !== 'PENDING'
                          ? formatDate(selectedRequest.updatedAt || selectedRequest.createdAt)
                          : 'Waiting for response'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRequest.status === 'PENDING' && (
                <div className="mt-5 border-t border-gray-200 pt-5">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Request Actions</h4>
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={cancelling}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      cancelling ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                  >
                    {cancelling ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancel Request
                      </>
                    )}
                  </button>
                  <button
                      type="button"
                      onClick={() => handleMessageClick(selectedRequest.donorId.userId._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    Message
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No request selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a request from the list to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerRequests;