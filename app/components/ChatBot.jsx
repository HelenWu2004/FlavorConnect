"use client";
import { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane, HiUserCircle, HiOutlineCog } from "react-icons/hi";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import Image from 'next/image';

const defaultUserProfile = {
  age: null,
  religion: "",
  dietaryPreferences: [],
  allergies: [],
  cookingSkill: "",
  preferredCuisines: [],
  healthConditions: []
};

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your personalized cooking assistant. I can recommend recipes and cooking advice based on your preferences. What would you like to know?",
      sender: "bot" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState(defaultUserProfile);
  const [tempProfile, setTempProfile] = useState(defaultUserProfile);
  
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const newUserMessage = { text: inputMessage, sender: "user" };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Call API to get bot response
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userProfile: userProfile
        }),
      });
      
      if (!response.ok) {
        throw new Error('API response error');
      }
      
      const data = await response.json();
      
      // Add bot response to chat with any recipe results
      setMessages(prev => [...prev, { 
        text: data.message, 
        sender: "bot",
        recipeResults: data.recipeResults 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I can't respond right now. Please try again later.", 
        sender: "bot",
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setTempProfile({
      ...tempProfile,
      [field]: value
    });
  };

  const handlePreferenceChange = (field, value, isChecked) => {
    if (isChecked) {
      setTempProfile({
        ...tempProfile,
        [field]: [...(tempProfile[field] || []), value]
      });
    } else {
      setTempProfile({
        ...tempProfile,
        [field]: (tempProfile[field] || []).filter(item => item !== value)
      });
    }
  };

  const saveProfile = () => {
    setUserProfile(tempProfile);
    setShowSettings(false);
    
    // Add system message notifying user profile update
    setMessages(prev => [
      ...prev, 
      { 
        text: "Your profile has been updated. I'll use this information to provide more personalized recommendations.", 
        sender: "bot",
        isSystem: true
      }
    ]);
  };

  // Component to render recipe cards
  const RecipeResults = ({ recipes }) => {
    if (!recipes || recipes.length === 0) return null;
    
    return (
      <div className="mt-4 mb-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Recipe Suggestions:</h3>
        <div className="grid grid-cols-1 gap-3">
          {recipes.slice(0, 3).map((recipe, index) => (
            <div key={index} className="border rounded-lg overflow-hidden flex bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-1/3 relative h-24">
                {recipe.Image ? (
                  <a href={recipe.Image} target="_blank" rel="noopener noreferrer">
                    <div className="relative h-full w-full">
                      <Image 
                        src={recipe.Image}
                        alt={recipe.Title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </a>
                ) : (
                  <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="w-2/3 p-2">
                <a 
                  href={recipe.Image} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-medium text-blue-600 hover:underline line-clamp-2"
                >
                  {recipe.Title}
                </a>
                {recipe.relevance_score && (
                  <div className="mt-1">
                    <span className="text-xs text-gray-500">Relevance: {parseFloat(recipe.relevance_score).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg h-[80vh] max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-red-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <HiChatBubbleLeftRight className="text-2xl mr-2" />
          <h2 className="text-xl font-bold">Cooking Assistant</h2>
        </div>
        <button 
          onClick={() => {
            setTempProfile(userProfile);
            setShowSettings(!showSettings);
          }}
          className="hover:bg-red-600 p-2 rounded-full"
        >
          <HiOutlineCog className="text-xl" />
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${showSettings ? 'hidden md:flex' : 'flex'}`}>
          {/* Message list */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-100 text-blue-900' 
                      : msg.isSystem 
                        ? 'bg-gray-100 text-gray-700 italic' 
                        : 'bg-red-50 text-gray-800'
                  } ${msg.error ? 'text-red-500' : ''}`}
                >
                  {msg.sender === 'bot' && !msg.isSystem && (
                    <div className="flex items-center mb-1">
                      <HiUserCircle className="text-red-500 mr-1 text-xl" />
                      <span className="font-semibold text-red-500">Cooking Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Render recipe results if available */}
                  {msg.recipeResults && <RecipeResults recipes={msg.recipeResults} />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your question..."
                className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`bg-red-500 text-white p-3 rounded-r-lg ${
                  isLoading ? 'opacity-50' : 'hover:bg-red-600'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <HiPaperAirplane />
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Settings panel */}
        {showSettings && (
          <div className="w-full md:w-80 bg-gray-50 border-l overflow-y-auto p-4">
            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={tempProfile.age || ''}
                  onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Religious Preferences</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={tempProfile.religion}
                  onChange={(e) => handleProfileChange('religion', e.target.value)}
                >
                  <option value="">No special requirements</option>
                  <option value="Halal">Halal</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Kosher">Kosher</option>
                  <option value="Buddhist">Buddhist</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dietary Preferences</label>
                <div className="space-y-1">
                  {['Vegetarian', 'Vegan', 'Low-fat', 'Gluten-free', 'High-protein', 'Low-carb', 'Sugar-free'].map(pref => (
                    <div key={pref} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`pref-${pref}`}
                        checked={(tempProfile.dietaryPreferences || []).includes(pref)}
                        onChange={(e) => handlePreferenceChange('dietaryPreferences', pref, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`pref-${pref}`}>{pref}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Allergies</label>
                <div className="space-y-1">
                  {['Milk', 'Eggs', 'Nuts', 'Peanuts', 'Wheat', 'Seafood', 'Soy'].map(allergen => (
                    <div key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`allergen-${allergen}`}
                        checked={(tempProfile.allergies || []).includes(allergen)}
                        onChange={(e) => handlePreferenceChange('allergies', allergen, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`allergen-${allergen}`}>{allergen}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cooking Skill</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={tempProfile.cookingSkill}
                  onChange={(e) => handleProfileChange('cookingSkill', e.target.value)}
                >
                  <option value="">Please select</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Cuisines</label>
                <div className="space-y-1">
                  {['Chinese', 'Western', 'Japanese', 'Korean', 'Italian', 'Mexican', 'Indian', 'Thai'].map(cuisine => (
                    <div key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cuisine-${cuisine}`}
                        checked={(tempProfile.preferredCuisines || []).includes(cuisine)}
                        onChange={(e) => handlePreferenceChange('preferredCuisines', cuisine, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`cuisine-${cuisine}`}>{cuisine}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Health Conditions</label>
                <div className="space-y-1">
                  {['Diabetes', 'Hypertension', 'High Cholesterol', 'Heart Disease', 'Obesity', 'Pregnancy'].map(condition => (
                    <div key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`condition-${condition}`}
                        checked={(tempProfile.healthConditions || []).includes(condition)}
                        onChange={(e) => handlePreferenceChange('healthConditions', condition, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`condition-${condition}`}>{condition}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={saveProfile}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}