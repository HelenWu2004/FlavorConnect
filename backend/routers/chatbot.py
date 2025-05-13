from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import requests, os
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config  # Use absolute import instead of relative import

class IngredientsRequest(BaseModel):
    ingredients: List[str]
    number: int = 5

class RecipeSuggestion(BaseModel):
    title: str
    image: str
    instructions: str
    ingredients: List[str]
    relevance_score: float

router = APIRouter(
    prefix="/api/chatbot",
    tags=["chatbot"],
    responses={404: {"description": "Not found"}},
)

@router.post("/suggest-recipes", response_model=List[RecipeSuggestion])
async def suggest_recipes_by_ingredients(req: IngredientsRequest):
    """
    根据用户提供的食材列表，调用 Spoonacular API 推荐菜谱
    """
    api_key = config.SPOONACULAR_API_KEY  # Use the config module
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing SPOONACULAR_API_KEY")
    
    include = ",".join(req.ingredients)
    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": api_key,
        "includeIngredients": include,
        "number": req.number,
        "addRecipeInformation": True
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    
    suggestions = []
    for item in data.get("results", []):
        suggestions.append(RecipeSuggestion(
            title=item["title"],
            image=item.get("image", ""),
            instructions=item.get("instructions", ""),
            ingredients=[ing["original"] for ing in item.get("extendedIngredients", [])],
            relevance_score=1.0
        ))
    return suggestions 