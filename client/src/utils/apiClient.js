import axios from 'axios';


const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000,
  withCredentials: true
});


apiClient.interceptors.request.use(
  config => {

    const token = localStorage.getItem('token');
   

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
   

    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      });
    }
   
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  response => {

    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  error => {

    const errorDetails = {
      message: error.message || 'Unknown error occurred',
      status: error.response?.status,
      data: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data ? JSON.parse(error.config.data) : null
      }
    };
   

    console.error('API Error:', errorDetails);
   

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
   

    if (error.response && error.response.status === 400) {

      if (typeof error.response.data === 'object' && error.response.data.message) {
        error.validationError = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        error.validationError = error.response.data;
      }
    }
   

    if (error.request && !error.response) {
      error.networkError = true;
    }
   
    return Promise.reject(error);
  }
);


const endpoints = {

  donors: {
    profile: '/api/donors/profile',
    updateProfile: '/api/donors/profile',
    medicalInfo: '/api/donors/medical-info',
    donationHistory: '/api/donors/donation-history',
    nextDonationDate: '/api/donors/next-donation-date',
    searchRequests: '/api/donors/requests',
    respondToRequest: '/api/donors/respond-to-request'
  },
  

  seekers: {
    profile: '/api/seekers/profile',
    updateProfile: '/api/seekers/profile',
    search: '/api/seekers/search-donors',
    sentRequests: '/api/seekers/requests',
    sendRequest: '/api/seekers/send-request',
    cancelRequest: '/api/seekers/cancel-request'
  },
 

  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password'
  },

  messages: {
    conversations: '/api/messages/conversations',
    send: '/api/messages/send',
    conversation: (userId) => `/api/messages/conversation/${userId}`,
    createConversation: '/api/messages/create-conversation',
    deleteConversation: (userId) => `/api/messages/conversation/${userId}`
  },
  
  users: {
    search: '/api/users/search'
  },

  doctors: {
    pendingVerifications: '/api/doctors/pending-verifications',
    statistics: '/api/doctors/statistics',
    reviewVerification: '/api/doctors/review-verification', 
    recordDonation: '/api/doctors/record-donation'
  },
};


export { apiClient, endpoints };
export default apiClient;