import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient, { endpoints } from '../../utils/apiClient';
import { AuthContext } from '../../contexts/AuthContext';

const DonorMessages = () => {
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
  
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const previousUserIdRef = useRef(userId);
  

  const fetchConversationsData = async (isInitialLoad = false) => {
    try {
      const response = await apiClient.get(endpoints.messages.conversations);
      

      setConversations(response.data.conversations);
      

      if (selectedConversation) {
        const updatedConversation = response.data.conversations.find(
          conv => conv.user._id === selectedConversation.user._id
        );
        if (updatedConversation) {
          setSelectedConversation(updatedConversation);
        }
      }
      

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
            navigate(`/donor/messages/${firstConversation.user._id}`, { replace: true });
          }
        } 

        else if (!userId && response.data.conversations.length > 0) {
          const firstConversation = response.data.conversations[0];
          setSelectedConversation(firstConversation);
          fetchMessages(firstConversation.user._id);
          navigate(`/donor/messages/${firstConversation.user._id}`, { replace: true });
        }
        
        setInitialLoadComplete(true);
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
          navigate(`/donor/messages/${firstConversation.user._id}`, { replace: true });
        }
      } else if (!userId && conversations.length > 0) {

        const firstConversation = conversations[0];
        setSelectedConversation(firstConversation);
        fetchMessages(firstConversation.user._id);
        navigate(`/donor/messages/${firstConversation.user._id}`, { replace: true });
      }
    }
  }, [userId, conversations, initialLoadComplete, navigate]);
  

  useEffect(() => {
    console.log('Current user object:', currentUser);
    
    if (messages.length > 0) {
      console.log('First message:', messages[0]);
    }
  }, [currentUser, messages]);

  const handleConversationSelect = (conversation) => {

    if (selectedConversation?.user._id === conversation.user._id) {
      return;
    }
    
    setSelectedConversation(conversation);
    fetchMessages(conversation.user._id);
    

    navigate(`/donor/messages/${conversation.user._id}`, { replace: true });
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
      

      fetchConversationsData(false);
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
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800';
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
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
          Communicate with seekers and doctors regarding donation requests.
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
            </div>
            
            {conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any active conversations yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <li 
                      key={conversation.user._id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.user._id === conversation.user._id ? 'bg-red-50' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-medium text-lg">
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
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-medium text-lg">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
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
                            <p dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content, isCurrentUser) }} />
                            <p 
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
                      className="focus:ring-red-500 focus:border-red-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
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
                          ? 'bg-red-400'
                          : 'bg-red-600 hover:bg-red-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
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
                Select a conversation from the list or start a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorMessages;