from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import schemas
import models
import auth
from database import get_db

router = APIRouter(
    prefix="/api/favorites",
    tags=["favorites"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Favorite, status_code=status.HTTP_201_CREATED)
def create_favorite(
    favorite: schemas.FavoriteCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if recipe exists
    recipe = db.query(models.Recipe).filter(models.Recipe.id == favorite.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Check if already favorited
    existing_favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.recipe_id == favorite.recipe_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Recipe already favorited")
    
    # Create favorite
    db_favorite = models.Favorite(
        user_id=current_user.id,
        recipe_id=favorite.recipe_id
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

@router.get("/", response_model=List[schemas.Recipe])
def read_user_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    favorites = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    recipes = [db.query(models.Recipe).filter(models.Recipe.id == fav.recipe_id).first() for fav in favorites]
    return recipes

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    recipe_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.recipe_id == recipe_id
    ).first()
    
    if favorite is None:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # Delete favorite
    db.delete(favorite)
    db.commit()
    return None

@router.get("/check/{recipe_id}", response_model=bool)
def check_favorite(
    recipe_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.recipe_id == recipe_id
    ).first()
    
    return favorite is not None 