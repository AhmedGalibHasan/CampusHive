import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import './Chat.css';

// Common emojis for reactions
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [chatList, setChatList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactingMessage, setReactingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingCheckIntervalRef = useRef(null);

  useEffect(() => {
    fetchChatList();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      markAsRead(selectedUser._id);
      startTypingCheck();
    }
    return () => {
      if (typingCheckIntervalRef.current) {
        clearInterval(typingCheckIntervalRef.current);
      }
    };
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatList = async () => {
    try {
      const data = await chatService.getChatList();
      setChatList(data || []);
    } catch (error) {
      console.error('Error fetching chat list:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await chatService.getMessages(userId);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (userId) => {
    try {
      await chatService.markAsRead(userId);
      fetchChatList(); // Refresh to update unread count
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await chatService.sendMessage({ receiverId: selectedUser._id, message: newMessage });
      setNewMessage('');
      fetchMessages(selectedUser._id);
      fetchChatList();
      stopTypingIndicator();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await chatService.deleteMessage(messageId);
      fetchMessages(selectedUser._id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      await chatService.addReaction(messageId, emoji);
      fetchMessages(selectedUser._id);
      setReactingMessage(null);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleRemoveReaction = async (messageId) => {
    try {
      await chatService.removeReaction(messageId);
      fetchMessages(selectedUser._id);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const startTypingIndicator = async () => {
    if (!selectedUser || typing) return;
    
    try {
      await chatService.startTyping(selectedUser._id);
      setTyping(true);
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  };

  const stopTypingIndicator = async () => {
    if (!selectedUser || !typing) return;

    try {
      await chatService.stopTyping(selectedUser._id);
      setTyping(false);
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  };

  const startTypingCheck = () => {
    if (typingCheckIntervalRef.current) {
      clearInterval(typingCheckIntervalRef.current);
    }

    typingCheckIntervalRef.current = setInterval(async () => {
      if (selectedUser) {
        try {
          const data = await chatService.getTypingStatus(selectedUser._id);
          setIsTyping(data.typing || false);
        } catch (error) {
          // Ignore errors
        }
      }
    }, 1000);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim()) {
      startTypingIndicator();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTypingIndicator();
      }, 2000);
    } else {
      stopTypingIndicator();
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return messageDate.toLocaleDateString();
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredChatList = chatList.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOwnMessage = (message) => {
    const userId = user?.id || user?._id;
    const senderId = message.sender?._id || message.sender?.id;
    return senderId && (senderId.toString() === userId?.toString() || senderId === userId);
  };

  const hasReaction = (message, userId) => {
    if (!message.reactions || !userId) return false;
    return message.reactions.some(r => {
      const reactionUserId = r.user?._id || r.user?.id;
      return reactionUserId && (reactionUserId.toString() === userId?.toString() || reactionUserId === userId);
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-brandWrap">
          <span className="chat-brandIcon">💬</span>
          <h2 className="chat-brandTitle">Messages</h2>
        </div>
        <button onClick={() => navigate('/dashboard')} className="chat-backBtn">
          ← Dashboard
        </button>
      </div>

      <div className="chat-container">
        {/* Chat List Sidebar */}
        <div className="chat-list">
          <div className="chat-searchContainer">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chat-searchInput"
            />
          </div>
          <div className="chat-listItems">
            {filteredChatList.length === 0 ? (
              <div className="chat-emptyChatList">
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredChatList.map(chat => (
                <div
                  key={chat._id}
                  className={
                    selectedUser?._id === chat._id
                      ? 'chat-listItem chat-listItem--active'
                      : 'chat-listItem'
                  }
                  onClick={() => setSelectedUser(chat)}
                >
                  <div className="chat-listItemAvatar">
                    {(chat.name || 'U').slice(0,1).toUpperCase()}
                  </div>
                  <div className="chat-listItemContent">
                    <div className="chat-listItemHeader">
                      <strong className="chat-listItemName">{chat.name}</strong>
                      {chat.lastMessage && (
                        <span className="chat-listItemTime">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="chat-listItemPreview">
                      {chat.lastMessage ? (
                        <>
                          {chat.lastMessage.senderId === (user?.id || user?._id) && (
                            <span className="chat-youLabel">You: </span>
                          )}
                          {chat.lastMessage.messageType === 'image' ? '📷 Image' : 
                           chat.lastMessage.messageType === 'file' ? '📎 File' : 
                           chat.lastMessage.message}
                        </>
                      ) : (
                        <span className="chat-noMessage">No messages yet</span>
                      )}
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="chat-unreadBadge">{chat.unreadCount}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-chatHeader">
                <div className="chat-chatHeaderUser">
                  <div className="chat-chatHeaderAvatar">
                    {(selectedUser.name || 'U').slice(0,1).toUpperCase()}
                  </div>
                  <div>
                    <strong>{selectedUser.name}</strong>
                    <div className="chat-chatHeaderStatus">
                      {isTyping ? 'typing...' : 'Online'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="chat-messagesContainer" ref={messagesEndRef}>
                {messages.length === 0 ? (
                  <div className="chat-noMessages">
                    <span className="chat-noMessagesIcon">💬</span>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = isOwnMessage(msg);
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const showAvatar = !prevMessage || prevMessage.sender._id !== msg.sender._id;
                    const showTime = !prevMessage || 
                      new Date(msg.createdAt) - new Date(prevMessage.createdAt) > 300000; // 5 minutes

                    return (
                      <div key={msg._id} className="chat-messageWrapper">
                        {showTime && (
                          <div className="chat-timeDivider">
                            {formatMessageTime(msg.createdAt)}
                          </div>
                        )}
                        <div 
                          className={
                            isOwn
                              ? 'chat-messageBubble chat-messageBubble--own'
                              : 'chat-messageBubble chat-messageBubble--other'
                          }
                        >
                          {!isOwn && showAvatar && (
                            <div className="chat-messageAvatar">
                              {(msg.sender?.name || 'U').slice(0,1).toUpperCase()}
                            </div>
                          )}
                          <div className="chat-messageContent">
                            {!isOwn && showAvatar && (
                              <div className="chat-messageSenderName">{msg.sender?.name}</div>
                            )}
                            <div className="chat-messageText">{msg.message}</div>
                            <div className="chat-messageFooter">
                              <span className="chat-messageTime">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isOwn && (
                                <span className="chat-readStatus">
                                  {msg.read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="chat-reactionsContainer">
                                {msg.reactions.map((reaction, idx) => (
                                  <span
                                    key={idx}
                                    className="chat-reaction"
                                    title={reaction.user?.name}
                                  >
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="chat-messageActions">
                            <button
                              onClick={() => setReactingMessage(reactingMessage === msg._id ? null : msg._id)}
                              className="chat-messageActionBtn"
                            >
                              😊
                            </button>
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="chat-messageActionBtn"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          {reactingMessage === msg._id && (
                            <div className="chat-emojiPicker">
                              {EMOJIS.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    if (hasReaction(msg, user?.id || user?._id)) {
                                      handleRemoveReaction(msg._id);
                                    } else {
                                      handleAddReaction(msg._id, emoji);
                                    }
                                  }}
                                  className="chat-emojiButton"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="chat-typingIndicator">
                    <div className="chat-typingDots">
                      <span className="chat-typingDot" />
                      <span className="chat-typingDot" />
                      <span className="chat-typingDot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="chat-messageForm">
                <div className="chat-messageInputContainer">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleMessageChange}
                    placeholder="Type a message..."
                    className="chat-messageInput"
                  />
                  <button type="submit" className="chat-sendButton" disabled={!newMessage.trim()}>
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="chat-selectUser">
              <span className="chat-selectUserIcon">💬</span>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
