// app/services/api.js
// Recipe-related API functions
export const searchRecipes = async (query) => {
  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
  return response.json();
};

export const getRecipeById = async (id) => {
  const response = await fetch(`/api/recipes/${id}`);
  return response.json();
};

export const createRecipe = async (recipeData) => {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData)
  });
  return response.json();
};

export const updateRecipe = async (id, recipeData) => {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData)
  });
  return response.json();
};

export const deleteRecipe = async (id) => {
  await fetch(`/api/recipes/${id}`, {
    method: 'DELETE'
  });
};

// Chat-related API functions
export const getUserChats = async () => {
  const response = await fetch('/api/chat/groups');
  return response.json();
};

export const getChatMessages = async (chatId) => {
  const response = await fetch(`/api/chat/groups/${chatId}/messages`);
  return response.json();
};

export const sendChatMessage = async (chatId, text) => {
  const response = await fetch(`/api/chat/groups/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};

export const createChatGroup = async (groupName, members) => {
  const response = await fetch('/api/chat/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_name: groupName, members })
  });
  return response.json();
};
