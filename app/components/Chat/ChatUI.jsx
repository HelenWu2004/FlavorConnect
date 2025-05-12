// app/components/Chat/ChatUI.jsx
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

function ChatUI() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Fetch user's chat groups
  useEffect(() => {
    if (session) {
      fetchChats();
    }
  }, [session]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chat/groups');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Select a chat and fetch its messages
  const selectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const response = await fetch(`/api/chat/groups/${chat.id}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    try {
      const response = await fetch(`/api/chat/groups/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage })
      });
      
      // Fetch updated messages
      const updatedMsgsResponse = await fetch(`/api/chat/groups/${selectedChat.id}/messages`);
      const updatedMsgs = await updatedMsgsResponse.json();
      setMessages(updatedMsgs);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-[80vh]">
      {/* Chat list sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">My Chats</h2>
        {chats.map(chat => (
          <div 
            key={chat.id}
            className={`p-3 mb-2 rounded-lg cursor-pointer ${selectedChat?.id === chat.id ? 'bg-blue-200' : 'bg-white'}`}
            onClick={() => selectChat(chat)}
          >
            {chat.group_name}
          </div>
        ))}
      </div>
      
      {/* Chat window */}
      <div className="w-3/4 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold">{selectedChat.group_name}</h3>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`mb-2 p-3 rounded-lg max-w-[70%] ${
                    msg.sender === session?.user?.email ? 
                    'bg-blue-500 text-white ml-auto' : 
                    'bg-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 p-2 border rounded-l-lg outline-none"
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatUI;