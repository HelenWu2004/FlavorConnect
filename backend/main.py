from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import uvicorn
import requests
import os
from pydantic import BaseModel
from search_engine import OptimizedSearchEngine
from routers.chatbot import router as chatbot_router
import json
from fastapi.responses import JSONResponse


app = FastAPI(title="FlavorConnect API", description="Backend API for FlavorConnect")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Initialize search engine
# SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "1b3d4b9a211a493c8f57108ba5556b81")
SEARCH_ENGINE = OptimizedSearchEngine(
    model_path="word2vec_model",
    recipes_path="cleaned_recipe_data.csv"
)


@app.get("/search")
async def search_recipes(query: str, number: int = 50):
    # try:
    #     # Get Spoonacular results
    #     spoonacular_url = f"https://api.spoonacular.com/recipes/complexSearch"
    #     params = {
    #         "apiKey": SPOONACULAR_API_KEY,
    #         "query": query,
    #         # "number": number,
    #         # "addRecipeInformation": True,
    #         # "fillIngredients": True
    #     }
        
    #     spoonacular_response = requests.get(spoonacular_url, params=params)
    #     spoonacular_response.raise_for_status()
    #     spoonacular_results = spoonacular_response.json().get('results', [])
        
        # Get Word2Vec results
        word2vec_results = SEARCH_ENGINE.search(query, top_k=number)
        
        # Format and combine results
        # formatted_spoonacular = [format_spoonacular_recipe(recipe) for recipe in spoonacular_results]
        #
        # Combine results, removing duplicates based on title
        # seen_titles = set()
        # combined_results = []
        
        # # Add Spoonacular results first
        # for recipe in formatted_spoonacular:
        #     if recipe['Title'] not in seen_titles:
        #         seen_titles.add(recipe['Title'])
        #         combined_results.append(recipe)
        
        # # # Add Word2Vec results
        # for recipe in word2vec_results:
        #     if recipe['Title'] not in seen_titles:
        #         seen_titles.add(recipe['Title'])
        #         combined_results.append({
        #             'Title': recipe['Title'],
        #             'Image': f"/images/{recipe['Image_Name']}.jpg",  # Adjust path as needed
        #             'Instructions': recipe['Instructions'],
        #             'Ingredients': [],# recipe['Cleaned_Ingredients'],
        #             'relevance_score': recipe['relevance_score']
        #         })
        
        # return {"result": combined_results}
        # JSONResponse(content={"result": recipes})
        return JSONResponse(content={"result": word2vec_results})
        # except requests.exceptions.RequestException as e:
        #     raise HTTPException(status_code=500, detail=f"Spoonacular API error: {str(e)}")
        # except Exception as e:
        #     raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

def format_spoonacular_recipe(recipe: Dict[str, Any]) -> Dict[str, Any]:
    """Format Spoonacular recipe data to match our schema"""
    return {
        'Title': recipe.get('title', ''),
        'Image': recipe.get('image', ''),
        'Instructions': recipe.get('instructions', ''),
        'Ingredients': [ingredient.get('original', '') for ingredient in recipe.get('extendedIngredients', [])],
        'relevance_score': 1.0  # Spoonacular results don't have a relevance score
    }

# Include routers
# app.include_router(users.router)
# app.include_router(recipes.router)
# app.include_router(comments.router)
# app.include_router(favorites.router)
# app.include_router(chat.router)
# app.include_router(spoonacular.router)
# app.include_router(chatbot_router)

@app.get("/")
async def root():
    return {"message": "Welcome to FlavorConnect API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# # Initialize MongoDB on startup
# @app.on_event("startup")
# async def startup_db_client():
#     await init_mongodb()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 

from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
