from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import schemas
import models
import auth
from database import get_db

router = APIRouter(
    prefix="/api/recipes",
    tags=["recipes"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Recipe, status_code=status.HTTP_201_CREATED)
def create_recipe(
    recipe: schemas.RecipeCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Create recipe
    db_recipe = models.Recipe(
        title=recipe.title,
        description=recipe.description,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
        image_url=recipe.image_url,
        user_id=current_user.id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    # Add tags
    if recipe.tags:
        for tag_name in recipe.tags:
            # Check if tag exists
            db_tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
            if not db_tag:
                # Create new tag
                db_tag = models.Tag(name=tag_name)
                db.add(db_tag)
                db.commit()
                db.refresh(db_tag)
            # Add tag to recipe
            db_recipe.tags.append(db_tag)
        db.commit()
    
    return db_recipe

@router.get("/", response_model=List[schemas.Recipe])
def read_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).offset(skip).limit(limit).all()
    return recipes

@router.get("/{recipe_id}", response_model=schemas.RecipeDetail)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Get favorite count
    favorite_count = db.query(func.count(models.Favorite.id)).filter(models.Favorite.recipe_id == recipe_id).scalar()
    
    # Create response
    recipe_detail = schemas.RecipeDetail.from_orm(recipe)
    recipe_detail.favorite_count = favorite_count
    
    return recipe_detail

@router.put("/{recipe_id}", response_model=schemas.Recipe)
def update_recipe(
    recipe_id: int, 
    recipe: schemas.RecipeCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Check if user is the owner
    if db_recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this recipe")
    
    # Update recipe
    db_recipe.title = recipe.title
    db_recipe.description = recipe.description
    db_recipe.ingredients = recipe.ingredients
    db_recipe.instructions = recipe.instructions
    if recipe.image_url:
        db_recipe.image_url = recipe.image_url
    
    # Update tags
    db_recipe.tags = []
    if recipe.tags:
        for tag_name in recipe.tags:
            # Check if tag exists
            db_tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
            if not db_tag:
                # Create new tag
                db_tag = models.Tag(name=tag_name)
                db.add(db_tag)
                db.commit()
                db.refresh(db_tag)
            # Add tag to recipe
            db_recipe.tags.append(db_tag)
    
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    recipe_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Check if user is the owner
    if db_recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this recipe")
    
    # Delete recipe
    db.delete(db_recipe)
    db.commit()
    return None

@router.get("/search/", response_model=List[schemas.Recipe])
def search_recipes(q: str, db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).filter(
        models.Recipe.title.ilike(f"%{q}%") | 
        models.Recipe.description.ilike(f"%{q}%") |
        models.Recipe.ingredients.ilike(f"%{q}%")
    ).all()
    return recipes

@router.get("/tags/{tag_name}", response_model=List[schemas.Recipe])
def get_recipes_by_tag(tag_name: str, db: Session = Depends(get_db)):
    tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag.recipes 