import React, { useState, useEffect, useContext } from 'react';
import { apiClient, endpoints } from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const DoctorUsersList = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [createConversationLoading, setCreateConversationLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get(endpoints.users.search, {
          params: { query: '.' }
        });
        
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  useEffect(() => {

    let result = [...users];
    

    if (roleFilter !== 'ALL') {
      result = result.filter(user => user.role === roleFilter);
    }
    

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.firstName.toLowerCase().includes(query) || 
        user.surName.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  }, [searchQuery, roleFilter, users]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    
    try {

      let userDetailsData = { user };
      
      if (user.role === 'DONOR') {

        const response = await apiClient.get(`/api/doctors/admin/users/${user._id}/donor-details`);
        userDetailsData = {
          ...userDetailsData,
          donorProfile: response.data.donorProfile,
          medicalInfo: response.data.medicalInfo
        };
      } else if (user.role === 'SEEKER') {

        const response = await apiClient.get(`/api/doctors/admin/users/${user._id}/seeker-details`);
        userDetailsData = {
          ...userDetailsData,
          seekerProfile: response.data.seekerProfile,
          donationCount: response.data.donationCount
        };
      } else if (user.role === 'DOCTOR') {

        const response = await apiClient.get(`/api/doctors/admin/users/${user._id}/doctor-details`);
        userDetailsData = {
          ...userDetailsData,
          doctorProfile: response.data.doctorProfile
        };
      }
      
      setUserDetails(userDetailsData);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setError('Failed to load user details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUser = async (userId) => {
    try {
      setCreateConversationLoading(true);
      

      const user = users.find(u => u._id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      

      const response = await apiClient.post(endpoints.messages.createConversation, {
        userId: userId
      });
      
      console.log('Conversation created or found:', response.data);
      

      const doctorFirstName = currentUser?.firstName || '';
      const doctorLastName = currentUser?.surName || '';
      

      await apiClient.post(endpoints.messages.send, {
        receiverId: userId,
        content: `Hi, I'm Dr ${doctorFirstName} ${doctorLastName}. I started this conversation because I have a few questions for you.`
      });
      

      localStorage.setItem('lastConversationUserId', userId);
      localStorage.setItem('lastConversationUserName', `${user.firstName} ${user.surName}`);
      localStorage.setItem('lastConversationUserRole', user.role);
      

      window.location.href = `/doctor/messages/${userId}`;
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
      setError('Failed to start conversation. Please try again later.');
    } finally {
      setCreateConversationLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'DONOR':
        return 'bg-red-100 text-red-700';
      case 'SEEKER':
        return 'bg-blue-100 text-blue-700';
      case 'DOCTOR':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'DONOR':
        return 'Donor';
      case 'SEEKER':
        return 'Seeker';
      case 'DOCTOR':
        return 'Doctor';
      default:
        return role;
    }
  };


  const renderUserDetailsModal = () => {
    if (!userDetails) return null;
    
    const { user } = userDetails;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 overflow-auto max-h-[90vh]">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.surName}
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            
            {/* User basic info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">User ID</p>
                <p className="mt-1 text-sm text-gray-900">{user._id}</p>
              </div>
            </div>
            
            {/* Role-specific details */}
            {user.role === 'DONOR' && userDetails.donorProfile && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Donor Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Blood Type</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {userDetails.donorProfile.bloodType} {userDetails.donorProfile.bloodResus}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Weight</p>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.donorProfile.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.donorProfile.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Verification Status</p>
                      <p className={`mt-1 text-sm ${userDetails.donorProfile.verificationStatus === 'APPROVED' ? 'text-green-600' : userDetails.donorProfile.verificationStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {userDetails.donorProfile.verificationStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Available</p>
                      <p className={`mt-1 text-sm ${userDetails.donorProfile.available ? 'text-green-600' : 'text-red-600'}`}>
                        {userDetails.donorProfile.available ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {userDetails.medicalInfo && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
                    <div className="mt-2 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Donation Type Offered</p>
                        <p className="mt-1 text-sm text-gray-900">{userDetails.medicalInfo.donationTypeOffered}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Donation Date</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {userDetails.medicalInfo.lastDonationDate 
                            ? new Date(userDetails.medicalInfo.lastDonationDate).toLocaleDateString() 
                            : 'No donation recorded'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Yearly Donation Count</p>
                        <p className="mt-1 text-sm text-gray-900">{userDetails.medicalInfo.yearlyDonationsCount || 0}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Health Conditions</p>
                        <div className="mt-2 space-y-2">
                          {[
                            { label: 'HIV/AIDS', value: userDetails.medicalInfo.HIV_AIDS },
                            { label: 'Hepatitis B or C', value: userDetails.medicalInfo.hepatitisBorC },
                            { label: 'Tuberculosis', value: userDetails.medicalInfo.tuberculosisActiveOrPast },
                            { label: 'Diabetes Mellitus', value: userDetails.medicalInfo.diabetesMellitus },
                            { label: 'Heart and Vascular Disease', value: userDetails.medicalInfo.heartAndVascularDiseases },
                            { label: 'Blood Diseases', value: userDetails.medicalInfo.bloodDiseases }
                          ].map((condition, idx) => (
                            <div key={idx} className="flex items-center">
                              <div className={`h-4 w-4 rounded-full ${condition.value ? 'bg-red-500' : 'bg-green-500'}`}></div>
                              <span className="ml-2 text-sm text-gray-700">{condition.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {user.role === 'SEEKER' && userDetails.seekerProfile && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Seeker Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Donation Requests</p>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.donationCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {user.role === 'DOCTOR' && userDetails.doctorProfile && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Doctor Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hospital</p>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.doctorProfile.hospital || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Specialization</p>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.doctorProfile.specialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">License Number</p>
                      <p className="mt-1 text-sm text-gray-900">{userDetails.doctorProfile.licenseNumber || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => handleMessageUser(user._id)}
                disabled={createConversationLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createConversationLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
                {createConversationLoading ? "Starting Conversation..." : "Message"}
              </button>
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
          All Users
        </h2>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
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
          
          {/* Role filter dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full sm:w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="ALL">All Roles</option>
            <option value="DONOR">Donors</option>
            <option value="SEEKER">Seekers</option>
            <option value="DOCTOR">Doctors</option>
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
      
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
      
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr 
                  key={user._id} 
                  onClick={() => handleUserClick(user)}
                  className="hover:bg-gray-50 cursor-pointer transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.surName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageUser(user._id);
                      }}
                      disabled={createConversationLoading}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createConversationLoading ? "Starting..." : "Message"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* User details modal */}
      {showModal && renderUserDetailsModal()}
    </div>
  );
};

export default DoctorUsersList;