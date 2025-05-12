from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import spoonacular
from spoonacular import SpoonacularSearchResults, SpoonacularRecipe
from query_generator import QueryGenerator

router = APIRouter(
    prefix="/api/spoonacular",
    tags=["spoonacular"],
    responses={404: {"description": "Not found"}},
)


@router.get("/recipes/search", response_model=SpoonacularSearchResults)
async def search_recipes(
    query: str = Query(..., description="Search query"),
    number: int = Query(10, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    max_fat: Optional[int] = Query(None, description="Maximum amount of fat in grams"),
    max_calories: Optional[int] = Query(None, description="Maximum amount of calories"),
    max_carbs: Optional[int] = Query(None, description="Maximum amount of carbohydrates in grams"),
    max_protein: Optional[int] = Query(None, description="Maximum amount of protein in grams"),
    cuisine: Optional[str] = Query(None, description="Cuisine type (e.g., Italian, Chinese)"),
    diet: Optional[str] = Query(None, description="Diet type (e.g., vegetarian, vegan)"),
    intolerances: Optional[str] = Query(None, description="Intolerances (e.g., dairy, gluten)"),
    sort: Optional[str] = Query(None, description="Sorting option (e.g., popularity, healthiness)"),
    sort_direction: Optional[str] = Query(None, description="Sort direction (asc, desc)"),
    include_ingredients: Optional[str] = Query(None, description="Ingredients that should be included"),
    exclude_ingredients: Optional[str] = Query(None, description="Ingredients that should be excluded"),
):
    """
    Search for recipes using the Spoonacular API.
    """
    try:
        results = await spoonacular.search_recipes(
            query=query,
            number=number,
            offset=offset,
            max_fat=max_fat,
            max_calories=max_calories,
            max_carbs=max_carbs,
            max_protein=max_protein,
            cuisine=cuisine,
            diet=diet,
            intolerances=intolerances,
            sort=sort,
            sort_direction=sort_direction,
            include_ingredients=include_ingredients,
            exclude_ingredients=exclude_ingredients,
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching recipes from Spoonacular: {str(e)}"
        )


@router.get("/recipes/{recipe_id}")
async def get_recipe_information(recipe_id: int):
    """
    Get detailed information about a specific recipe by ID.
    """
    try:
        recipe = await spoonacular.get_recipe_information(recipe_id)
        return recipe
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching recipe information from Spoonacular: {str(e)}"
        )


# Details need to be discussed.
@router.post("/ai-search", response_model=Dict[str, Any])
async def ai_search_recipes(
    user_info: Dict[str, Any] = Body(..., description="User preferences and information"),
    number: int = Query(10, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    max_fat: Optional[int] = Query(None, description="Maximum amount of fat in grams"),
    max_calories: Optional[int] = Query(None, description="Maximum amount of calories"),
    max_carbs: Optional[int] = Query(None, description="Maximum amount of carbohydrates in grams"),
    max_protein: Optional[int] = Query(None, description="Maximum amount of protein in grams"),
):
    """
    Search for recipes using AI-generated query based on user preferences.
    
    The user_info should be a JSON object containing user preferences and information.
    Example:
    ```json
    {
        "preferences": "quick and healthy meals, Italian food",
        "dietary_restrictions": "vegetarian",
        "allergies": "peanuts, dairy",
        "favorite_ingredients": "tomatoes, basil, olive oil",
        "disliked_ingredients": "eggplant, olives",
        "cooking_time": "30 minutes or less"
    }
    ```
    """
    try:
        # Create the query generator
        query_generator = QueryGenerator()
        
        # Get search results using AI-generated query
        search_results = await query_generator.search_with_generated_query(
            user_info=user_info,
            number=number,
            offset=offset,
            max_fat=max_fat,
            max_calories=max_calories,
            max_carbs=max_carbs,
            max_protein=max_protein
        )
        
        # Get the generated query parameters to return alongside results
        query_params = query_generator.generate_query(user_info)
        
        # Return both the results and the generated query parameters
        return {
            "query_parameters": query_params,
            "search_results": search_results.dict()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during AI-assisted recipe search: {str(e)}"
        ) 