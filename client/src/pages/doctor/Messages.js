import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, endpoints } from '../../utils/apiClient';
import { AuthContext } from '../../contexts/AuthContext';

const DoctorMessages = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  
  const messagesEndRef = useRef(null);
  const searchRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const previousUserIdRef = useRef(userId);


  const fetchConversationsData = async (isInitialLoad = false) => {
    try {
      const response = await apiClient.get(endpoints.messages.conversations);


      setConversations(response.data.conversations);


      if (isInitialLoad) {

        if (userId) {
          const conversation = response.data.conversations.find(
            conv => conv.user._id === userId
          );

          if (conversation) {
            setSelectedConversation(conversation);
            fetchMessages(conversation.user._id);
          } else if (response.data.conversations.length > 0) {

            const firstConversation = response.data.conversations[0];
            setSelectedConversation(firstConversation);
            fetchMessages(firstConversation.user._id);
            navigate(`/doctor/messages/${firstConversation.user._id}`, { replace: true });
          }
        }

        else if (!userId && response.data.conversations.length > 0) {
          const firstConversation = response.data.conversations[0];
          setSelectedConversation(firstConversation);
          fetchMessages(firstConversation.user._id);
          navigate(`/doctor/messages/${firstConversation.user._id}`, { replace: true });
        }

        setInitialLoadComplete(true);
      } else if (selectedConversation) {

        const updatedConversation = response.data.conversations.find(
          conv => conv.user._id === selectedConversation.user._id
        );

        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }

      if (loading) setLoading(false);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      if (loading) {
        setError('Failed to load conversations. Please try again later.');
        setLoading(false);
      }
    }
  };


  const fetchMessages = async (userId) => {
    if (!userId) return;

    try {
      const response = await apiClient.get(endpoints.messages.conversation(userId));


      if (messages.length !== response.data.messages.length ||
          (messages.length > 0 && response.data.messages.length > 0 &&
           messages[messages.length - 1]._id !== response.data.messages[response.data.messages.length - 1]._id)) {
        setMessages(response.data.messages);


        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages. Please try again later.');
    }
  };
  

  useEffect(() => {
    setLoading(true);
    fetchConversationsData(true);
    

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);


  useEffect(() => {
    if (initialLoadComplete && !pollingIntervalRef.current) {

      pollingIntervalRef.current = setInterval(() => {

        fetchConversationsData(false);


        if (selectedConversation) {
          fetchMessages(selectedConversation.user._id);
        }
      }, 3000);
    }

    return () => {

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [initialLoadComplete, selectedConversation]);


  useEffect(() => {

    if (previousUserIdRef.current !== userId && initialLoadComplete) {
      previousUserIdRef.current = userId;

      if (userId && conversations.length > 0) {
        const conversation = conversations.find(conv => conv.user._id === userId);
        if (conversation) {

          if (!selectedConversation || selectedConversation.user._id !== userId) {
            setSelectedConversation(conversation);
            fetchMessages(conversation.user._id);
          }
        } else if (conversations.length > 0) {

          const firstConversation = conversations[0];
          setSelectedConversation(firstConversation);
          fetchMessages(firstConversation.user._id);
          navigate(`/doctor/messages/${firstConversation.user._id}`, { replace: true });
        }
      } else if (!userId && conversations.length > 0) {

        const firstConversation = conversations[0];
        setSelectedConversation(firstConversation);
        fetchMessages(firstConversation.user._id);
        navigate(`/doctor/messages/${firstConversation.user._id}`, { replace: true });
      }
    }
  }, [userId, conversations, initialLoadComplete, navigate]);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      return;
    }
    
    try {
      setSearchLoading(true);

      const response = await apiClient.get(`/api/users/search?query=${searchQuery}`);
      setSearchResults(response.data.users);
      setShowSearchResults(true);
      setSearchLoading(false);
    } catch (err) {
      console.error('Failed to search users:', err);
      setError('Failed to search users. Please try again.');
      setSearchLoading(false);
    }
  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleConversationSelect = (conversation) => {
    try {
      console.log('Selecting conversation:', conversation);
      
      if (!conversation || !conversation.user || !conversation.user._id) {
        console.error('Invalid conversation object:', conversation);
        setError('Invalid conversation data');
        return;
      }
      

      if (selectedConversation?.user._id === conversation.user._id) {
        return;
      }
      
      setSelectedConversation(conversation);
      fetchMessages(conversation.user._id);
      

      const path = `/doctor/messages/${conversation.user._id}`;
      console.log('Navigating to:', path);
      navigate(path, { replace: true });
    } catch (err) {
      console.error('Error in handleConversationSelect:', err);
      setError('Failed to select conversation');
    }
  };
  

  const handleUserSelect = async (user) => {
    try {

      const existingConversation = conversations.find(conv => conv.user._id === user._id);
      
      if (existingConversation) {

        handleConversationSelect(existingConversation);
      } else {

        try {
          console.log('Creating new conversation with user:', user);
          const response = await apiClient.post('/api/messages/create-conversation', {
            userId: user._id
          });
          
          console.log('Create conversation response:', response.data);
          

          if (!response.data.conversation || !response.data.conversation.user) {
            throw new Error('Invalid response format from server');
          }
          
          const newConversation = response.data.conversation;
          

          setConversations(prevConversations => [newConversation, ...prevConversations]);
          

          setTimeout(() => {
            handleConversationSelect(newConversation);
          }, 50);
        } catch (err) {
          console.error('Failed to create conversation:', err);
          setError(`Failed to start conversation: ${err.message}`);
        }
      }
      

      setShowSearchResults(false);
      setSearchQuery('');
    } catch (err) {
      console.error('Error in handleUserSelect:', err);
      setError('An unexpected error occurred');
    }
  };
  

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    try {
      await apiClient.delete(`/api/messages/conversation/${conversationToDelete.user._id}`);
      

      const updatedConversations = conversations.filter(
        conv => conv.user._id !== conversationToDelete.user._id
      );
      
      setConversations(updatedConversations);
      

      if (selectedConversation?.user._id === conversationToDelete.user._id) {
        if (updatedConversations.length > 0) {
          setSelectedConversation(updatedConversations[0]);
          fetchMessages(updatedConversations[0].user._id);
          navigate(`/doctor/messages/${updatedConversations[0].user._id}`, { replace: true });
        } else {
          setSelectedConversation(null);
          setMessages([]);
          navigate('/doctor/messages', { replace: true });
        }
      }
      

      setShowDeleteModal(false);
      setConversationToDelete(null);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation. Please try again.');
      setShowDeleteModal(false);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) {
      return;
    }
    
    try {
      setSending(true);
      

      const response = await apiClient.post(endpoints.messages.send, {
        receiverId: selectedConversation.user._id,
        content: newMessage
      });
      

      setMessages(prevMessages => [...prevMessages, response.data.newMessage]);
      

      setNewMessage('');
      setSending(false);
      

      scrollToBottom();
      

      setConversations(prevConversations => prevConversations.map(conv => {
        if (conv.user._id === selectedConversation.user._id) {
          return {
            ...conv,
            lastMessage: response.data.newMessage
          };
        }
        return conv;
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      setSending(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'DONOR':
        return 'bg-red-100 text-red-800';
      case 'SEEKER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  

  const getFormattedRole = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'Doctor';
      case 'SEEKER':
        return 'Seeker';
      case 'DONOR':
        return 'Donor';
      default:
        return role;
    }
  };
  
  if (loading && !selectedConversation) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleCreateZoomMeeting = async () => {
    if (!selectedConversation) return;

    try {
      const response = await apiClient.post('/api/zoom/create-meeting', {
        receiverId: selectedConversation.user._id,
        topic: `Blood Donation Discussion with ${selectedConversation.user.firstName}`
      });

      const { join_url } = response.data;


      await apiClient.post(endpoints.messages.send, {
        receiverId: selectedConversation.user._id,
        content: `Join Zoom Meeting: ${join_url}`
      });

      fetchMessages(selectedConversation.user._id);

    } catch (error) {
      console.error('Failed to create Zoom meeting:', error);
      setError('Failed to create Zoom meeting. Please try again.');
    }
  };
  const formatMessageContent = (content, isCurrentUser) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: ${
          isCurrentUser ? 'white' : '#2563EB'
      }; text-decoration: underline;">${url}</a>`;
    });
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6 mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Messages</h2>
        <p className="mt-1 text-sm text-gray-500">
          Communicate with donors and seekers about verification and donation processes.
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
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
      
      <div className="flex-1 flex overflow-hidden bg-white shadow rounded-lg">
        {/* Conversation list */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
              
              {/* Search bar */}
              <div className="mt-2 relative" ref={searchRef}>
                <form onSubmit={handleSearch}>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      placeholder="Search by name or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {searchLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
                
                {/* Search results */}
                {showSearchResults && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden">
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-700">
                        No users found
                      </div>
                    ) : (
                      <ul className="max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <li 
                            key={user._id}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleUserSelect(user)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {user.firstName?.charAt(0) || ''}
                                    {user.surName?.charAt(0) || ''}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.surName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getFormattedRole(user.role)}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by searching for a user.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <li 
                      key={conversation.user._id}
                      className={`relative cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.user._id === conversation.user._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Delete chat button */}
                      <div className="absolute top-2 right-2">
                        <button
                          className="text-gray-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conversation);
                            setShowDeleteModal(true);
                          }}
                        >
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Main content - clickable area */}
                      <div 
                        className="px-6 py-4"
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-lg">
                                {conversation.user.firstName?.charAt(0) || ''}
                                {conversation.user.surName?.charAt(0) || ''}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {conversation.user.firstName} {conversation.user.surName}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(conversation.user.role)}`}>
                                {getFormattedRole(conversation.user.role)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="border-b border-gray-200 px-6 py-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">
                      {selectedConversation.user.firstName?.charAt(0) || ''}
                      {selectedConversation.user.surName?.charAt(0) || ''}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedConversation.user.firstName} {selectedConversation.user.surName}
                    </h3>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedConversation.user.role)}`}>
                      {getFormattedRole(selectedConversation.user.role)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      // Fix: Use string comparison to correctly identify message ownership
                      const isCurrentUser = String(message.senderId) === String(currentUser._id);
                      
                      return (
                        <div 
                          key={message._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isCurrentUser && (
                            <div className="flex-shrink-0 mr-2">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">
                                  {selectedConversation.user.firstName?.charAt(0) || ''}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div 
                            className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                              isCurrentUser
                                ? 'bg-green-600 text-white'  // Your messages are green
                                : 'bg-gray-100 text-gray-800' // Other messages are gray
                            }`}
                          >
                            <p dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content, isCurrentUser) }} /><p
                              className={`text-xs mt-1 ${
                                  isCurrentUser
                                      ? 'text-green-200'
                                      : 'text-gray-500'
                              }`}
                          >
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                          
                          {isCurrentUser && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {currentUser.firstName?.charAt(0) || ''}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="border-t border-gray-200 px-6 py-4">
                <form onSubmit={handleSendMessage}>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="message"
                      id="message"
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                        sending || !newMessage.trim()
                          ? 'bg-blue-400'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {sending ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      )}
                    </button>
                    <button
                        type="button"
                        onClick={handleCreateZoomMeeting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553 2.276a1 1 0 010 1.448L15 16v-6zM4 6h12M4 10h12M4 14h6" />
                      </svg>
                      Create Zoom Meeting
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No conversation selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a conversation from the list or search for a user to start a new one.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete conversation</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the conversation with {conversationToDelete?.user.firstName} {conversationToDelete?.user.surName}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteConversation}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConversationToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMessages;