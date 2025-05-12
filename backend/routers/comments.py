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
    prefix="/api/comments",
    tags=["comments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.Comment, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if recipe exists
    recipe = db.query(models.Recipe).filter(models.Recipe.id == comment.recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Create comment
    db_comment = models.Comment(
        content=comment.content,
        user_id=current_user.id,
        recipe_id=comment.recipe_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/recipe/{recipe_id}", response_model=List[schemas.Comment])
def read_comments_by_recipe(recipe_id: int, db: Session = Depends(get_db)):
    # Check if recipe exists
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    comments = db.query(models.Comment).filter(models.Comment.recipe_id == recipe_id).all()
    return comments

@router.put("/{comment_id}", response_model=schemas.Comment)
def update_comment(
    comment_id: int, 
    comment: schemas.CommentBase, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is the owner
    if db_comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    # Update comment
    db_comment.content = comment.content
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if db_comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user is the owner or recipe owner
    recipe = db.query(models.Recipe).filter(models.Recipe.id == db_comment.recipe_id).first()
    if db_comment.user_id != current_user.id and recipe.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Delete comment
    db.delete(db_comment)
    db.commit()
    return None 