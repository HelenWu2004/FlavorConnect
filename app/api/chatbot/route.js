import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY', // Please replace with your API key
});

// Function to search for recipes based on query
async function searchRecipes(query, limit = 5) {
  try {
    // Search from our local API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/search?query=${encodeURIComponent(query)}&number=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Recipe search failed');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Recipe search error:", error);
    return []; // Return empty array on error
  }
}

export async function POST(request) {
  try {
    const { message, userProfile } = await request.json();

    // First, see if the message is asking for recipe recommendations
    const isRecipeQuery = /recipe|food|meal|dish|cook|make|prepare|breakfast|lunch|dinner|dessert/i.test(message);
    
    let recipeResults = [];
    if (isRecipeQuery) {
      // Search for recipes based on the user's query
      recipeResults = await searchRecipes(message);
    }

    // Format recipe results to include in the prompt
    let recipeContext = "";
    if (recipeResults.length > 0) {
      recipeContext = "Here are some recipes that might be relevant:\n\n";
      recipeResults.forEach((recipe, index) => {
        recipeContext += `${index + 1}. ${recipe.Title}\n`;
        if (recipe.Image) {
          recipeContext += `   Image: ${recipe.Image}\n`;
        }
        recipeContext += `   Relevance Score: ${recipe.relevance_score || 'N/A'}\n\n`;
      });
      recipeContext += "You can reference these recipes in your response and include the URLs for the user.\n\n";
    }

    // Generate system prompt
    const systemPrompt = generateSystemPrompt(userProfile, recipeResults);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    // Return chatbot response
    return NextResponse.json({
      message: completion.choices[0].message.content,
      source: "bot",
      recipeResults: recipeResults.length > 0 ? recipeResults : null
    });
  } catch (error) {
    console.error("ChatBot API Error:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

// Generate system prompt based on user profile and recipe results
function generateSystemPrompt(profile, recipeResults = []) {
  const basePrompt = "You are a professional cooking advisor and recipe recommendation assistant. Your task is to help users find recipes and cooking advice that suit their needs.";
  
  const promptParts = [basePrompt];
  
  // Add recipe context if available
  if (recipeResults.length > 0) {
    promptParts.push("AVAILABLE RECIPES YOU CAN REFERENCE:");
    recipeResults.forEach((recipe, index) => {
      promptParts.push(`${index + 1}. ${recipe.Title} (URL: ${recipe.Image || 'No image available'})`);
    });
    promptParts.push("When suggesting these recipes, include the URLs so the user can view them. Feel free to describe these recipes and explain why they're suitable for the user.");
  }
  
  if (!profile) {
    return promptParts.join("\n");
  }
  
  if (profile.age) {
    promptParts.push(`User age: ${profile.age} years old`);
  }
  
  if (profile.religion) {
    promptParts.push(`Religious preferences: ${profile.religion}`);
  }
  
  if (profile.dietaryPreferences && profile.dietaryPreferences.length > 0) {
    const preferences = profile.dietaryPreferences.join(", ");
    promptParts.push(`Dietary preferences: ${preferences}`);
  }
  
  if (profile.allergies && profile.allergies.length > 0) {
    const allergies = profile.allergies.join(", ");
    promptParts.push(`Allergies: ${allergies}`);
  }
  
  if (profile.cookingSkill) {
    promptParts.push(`Cooking skill level: ${profile.cookingSkill}`);
  }
  
  if (profile.preferredCuisines && profile.preferredCuisines.length > 0) {
    const cuisines = profile.preferredCuisines.join(", ");
    promptParts.push(`Preferred cuisines: ${cuisines}`);
  }
  
  if (profile.healthConditions && profile.healthConditions.length > 0) {
    const conditions = profile.healthConditions.join(", ");
    promptParts.push(`Health conditions: ${conditions}`);
  }
  
  promptParts.push("Based on the user information above, provide personalized recipe suggestions and cooking guidance. When appropriate, recommend specific recipes from the available options, including their URLs. Make your answers concise, friendly, and consider all user restrictions and preferences.");
  
  return promptParts.join("\n");
}