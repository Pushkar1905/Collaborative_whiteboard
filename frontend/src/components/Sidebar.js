import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSocket } from '../context/SocketContext';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e1e5e9;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 8px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  @media (max-width: 768px) {
    right: 4px;
    font-size: 1.1rem;
  }

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.$active ? '#667eea' : '#f8f9fa'};
  color: ${props => props.$active ? 'white' : '#333'};
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 0.9rem;
  }

  &:hover {
    background: ${props => props.$active ? '#5a6fd8' : '#e9ecef'};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-right: 4px;
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const Message = styled.div`
  margin-bottom: 12px;
  padding: 8px 12px;
  background: ${props => props.$isOwn ? '#667eea' : '#f8f9fa'};
  color: ${props => props.$isOwn ? 'white' : '#333'};
  border-radius: 12px;
  max-width: 80%;
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 90%;
    padding: 6px 10px;
    margin-bottom: 8px;
  }
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const MessageHeader = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 4px;
  opacity: 0.8;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessageContent = styled.div`
  line-height: 1.4;
  word-break: break-word;
`;

const ChatInputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;

  @media (max-width: 768px) {
    padding: 0 12px 12px;
    gap: 6px;
  }
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 20px;
  outline: none;
  font-size: 0.9rem;
  transition: border-color 0.2s;

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  &:hover {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const UsersContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f8f9fa;
  transition: background 0.2s;

  @media (max-width: 768px) {
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 6px;
  }

  &:hover {
    background: #e9ecef;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const UserStatus = styled.div`
  font-size: 0.8rem;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const TypingIndicator = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
  padding: 4px 12px;
  margin-bottom: 8px;
`;

function Sidebar({ users, roomId, currentUsername, onClose, onNewMessage }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { socket, sendMessage } = useSocket();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      // Handle incoming messages
      socket.on('receive-message', (messageData) => {
        setMessages(prev => {
          // Only call onNewMessage if this is a new message
          if (onNewMessage && prev.length > 0) {
            onNewMessage();
          }
          return [...prev, messageData];
        });
      });

      // Handle room joined event (load existing messages)
      socket.on('room-joined', (data) => {
        if (data.messages) {
          setMessages(data.messages);
        }
      });

      // Handle typing indicators
      socket.on('user-typing', (data) => {
        if (data.username !== currentUsername) {
          setTypingUsers(prev => new Set(prev).add(data.username));
        }
      });

      socket.on('user-stop-typing', (data) => {
        if (data.username !== currentUsername) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
          });
        }
      });

      return () => {
        socket.off('receive-message');
        socket.off('room-joined');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [socket, currentUsername, onNewMessage]);

  const handleSendMessage = () => {
    if (newMessage.trim() && sendMessage) {
      sendMessage(newMessage.trim(), currentUsername, roomId);
      setNewMessage('');
      setIsTyping(false);
      
      // Clear typing indicator
      if (socket) {
        socket.emit('stop-typing', { roomId, username: currentUsername });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicators
    if (!isTyping) {
      setIsTyping(true);
      if (socket) {
        socket.emit('typing', { roomId, username: currentUsername });
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('stop-typing', { roomId, username: currentUsername });
      }
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (username) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    const users = Array.from(typingUsers);
    let text = '';
    
    if (users.length === 1) {
      text = `${users[0]} is typing...`;
    } else if (users.length === 2) {
      text = `${users[0]} and ${users[1]} are typing...`;
    } else {
      text = `${users[0]} and ${users.length - 1} others are typing...`;
    }
    
    return <TypingIndicator>{text}</TypingIndicator>;
  };

  return (
    <SidebarContainer>
      <TabContainer>
        <Tab 
          $active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')}
        >
          Chat ({messages.length})
        </Tab>
        <Tab 
          $active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </Tab>
        <CloseButton onClick={onClose}>✗</CloseButton>
      </TabContainer>

      <ContentArea>
        {activeTab === 'chat' && (
          <ChatContainer>
            <MessagesContainer>
              {messages.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>💬</EmptyIcon>
                  <div>No messages yet</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Start the conversation!
                  </div>
                </EmptyState>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <Message 
                      key={index} 
                      $isOwn={message.username === currentUsername}
                      style={{ 
                        alignSelf: message.username === currentUsername ? 'flex-end' : 'flex-start',
                        marginLeft: message.username === currentUsername ? 'auto' : '0'
                      }}
                    >
                      <MessageHeader>
                        <span>{message.username}</span>
                        <span>{formatTime(message.timestamp)}</span>
                      </MessageHeader>
                      <MessageContent>{message.message}</MessageContent>
                    </Message>
                  ))}
                  {renderTypingIndicator()}
                  <div ref={messagesEndRef} />
                </>
              )}
            </MessagesContainer>
            
            <ChatInputContainer>
              <ChatInput
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                maxLength={500}
              />
              <SendButton 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </SendButton>
            </ChatInputContainer>
          </ChatContainer>
        )}

        {activeTab === 'users' && (
          <UsersContainer>
            {users.length === 0 ? (
              <EmptyState>
                <EmptyIcon>👥</EmptyIcon>
                <div>No users online</div>
                <div style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                  You're the first one here!
                </div>
              </EmptyState>
            ) : (
              users.map((user, index) => (
                <UserItem key={user.socketId || index}>
                  <UserAvatar>
                    {getInitials(user.username)}
                  </UserAvatar>
                  <UserInfo>
                    <Username>
                      {user.username}
                      {user.username === currentUsername && ' (You)'}
                    </Username>
                    <UserStatus>
                      Online • Joined {formatTime(user.joinedAt || Date.now())}
                    </UserStatus>
                  </UserInfo>
                  <OnlineIndicator />
                </UserItem>
              ))
            )}
          </UsersContainer>
        )}
      </ContentArea>
    </SidebarContainer>
  );
}

export default Sidebar; 