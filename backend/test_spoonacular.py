import asyncio
import json
from spoonacular import search_recipes, get_recipe_information

async def test_search_recipes():
    print("Testing search_recipes function...")
    
    # Search for pasta recipes with max fat of 25g
    results = await search_recipes(
        query="pasta",
        max_fat=25,
        number=2
    )
    
    # Pretty print the results
    print("Search Results:")
    print(json.dumps(results.dict(), indent=2))
    print("\n")

async def test_get_recipe_information():
    print("Testing get_recipe_information function...")
    
    # Get information for a specific recipe (using ID from search results)
    recipe_id = 716429  # Example ID: "Pasta with Garlic, Scallions, Cauliflower & Breadcrumbs"
    recipe = await get_recipe_information(recipe_id)
    
    # Pretty print some key information
    print(f"Recipe Information for ID {recipe_id}:")
    print(f"Title: {recipe.get('title')}")
    print(f"Ready in {recipe.get('readyInMinutes')} minutes")
    print(f"Servings: {recipe.get('servings')}")
    print(f"Source: {recipe.get('sourceUrl')}")
    
    # Print nutrition information if available
    if "nutrition" in recipe:
        print("\nNutrition Information:")
        nutrients = recipe["nutrition"].get("nutrients", [])
        for nutrient in nutrients[:5]:  # Print first 5 nutrients
            print(f"{nutrient.get('name')}: {nutrient.get('amount')}{nutrient.get('unit')}")
    
    print("\n")

async def main():
    print("=== Spoonacular API Test ===\n")
    
    # Run test functions
    await test_search_recipes()
    await test_get_recipe_information()
    
    print("All tests completed!")

if __name__ == "__main__":
    asyncio.run(main()) 