from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import mongo_schemas
import auth
from mongodb import users_collection, group_chats_collection, messages_collection

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

# Helper function to get MongoDB user by MySQL user ID
async def get_mongo_user_by_mysql_id(mysql_id: int):
    user = await users_collection.find_one({"mysql_id": mysql_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found in MongoDB")
    return user

# Get all group chats for a user
@router.get("/groups", response_model=List[mongo_schemas.GroupChatResponse])
async def get_user_group_chats(current_user: auth.models.User = Depends(auth.get_current_active_user)):
    # Get MongoDB user
    mongo_user = await get_mongo_user_by_mysql_id(current_user.id)
    
    # Get all group chats where user is a member
    cursor = group_chats_collection.find({"members": mongo_user["_id"]})
    chats = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for response
    for chat in chats:
        chat["id"] = str(chat["_id"])
        chat["members"] = [str(member) for member in chat["members"]]
    
    return chats

# Create a new group chat
@router.post("/groups", response_model=mongo_schemas.GroupChatResponse, status_code=status.HTTP_201_CREATED)
async def create_group_chat(
    chat: mongo_schemas.GroupChatCreate,
    current_user: auth.models.User = Depends(auth.get_current_active_user)
):
    # Get MongoDB user
    mongo_user = await get_mongo_user_by_mysql_id(current_user.id)
    
    # Create new group chat
    new_chat = {
        "group_name": chat.group_name,
        "members": [mongo_user["_id"]] + [ObjectId(member) for member in chat.members],
        "createdAt": datetime.utcnow()
    }
    
    # Insert into database
    result = await group_chats_collection.insert_one(new_chat)
    
    # Get created chat
    created_chat = await group_chats_collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    created_chat["id"] = str(created_chat["_id"])
    created_chat["members"] = [str(member) for member in created_chat["members"]]
    
    return created_chat

# Get messages for a group chat
@router.get("/groups/{chat_id}/messages", response_model=List[mongo_schemas.MessageResponse])
async def get_chat_messages(
    chat_id: str,
    current_user: auth.models.User = Depends(auth.get_current_active_user)
):
    # Get MongoDB user
    mongo_user = await get_mongo_user_by_mysql_id(current_user.id)
    
    # Check if chat exists and user is a member
    chat = await group_chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "members": mongo_user["_id"]
    })
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or you're not a member")
    
    # Get messages
    cursor = messages_collection.find({"chat_id": ObjectId(chat_id)}).sort("timestamp", 1)
    messages = await cursor.to_list(length=100)
    
    # Convert ObjectId to string for response
    for message in messages:
        message["id"] = str(message["_id"])
        message["chat_id"] = str(message["chat_id"])
        message["sender"] = str(message["sender"])
    
    return messages

# Send a message to a group chat
@router.post("/groups/{chat_id}/messages", response_model=mongo_schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    chat_id: str,
    message: mongo_schemas.MessageCreate,
    current_user: auth.models.User = Depends(auth.get_current_active_user)
):
    # Get MongoDB user
    mongo_user = await get_mongo_user_by_mysql_id(current_user.id)
    
    # Check if chat exists and user is a member
    chat = await group_chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "members": mongo_user["_id"]
    })
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or you're not a member")
    
    # Create new message
    new_message = {
        "chat_id": ObjectId(chat_id),
        "sender": mongo_user["_id"],
        "text": message.text,
        "timestamp": datetime.utcnow()
    }
    
    # Insert into database
    result = await messages_collection.insert_one(new_message)
    
    # Get created message
    created_message = await messages_collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for response
    created_message["id"] = str(created_message["_id"])
    created_message["chat_id"] = str(created_message["chat_id"])
    created_message["sender"] = str(created_message["sender"])
    
    return created_message

# Add user to group chat
@router.post("/groups/{chat_id}/members/{user_id}", status_code=status.HTTP_200_OK)
async def add_user_to_chat(
    chat_id: str,
    user_id: int,
    current_user: auth.models.User = Depends(auth.get_current_active_user)
):
    # Get MongoDB user
    mongo_user = await get_mongo_user_by_mysql_id(current_user.id)
    
    # Check if chat exists and user is a member
    chat = await group_chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "members": mongo_user["_id"]
    })
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or you're not a member")
    
    # Get user to add
    user_to_add = await users_collection.find_one({"mysql_id": user_id})
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is already a member
    if user_to_add["_id"] in chat["members"]:
        raise HTTPException(status_code=400, detail="User is already a member of this chat")
    
    # Add user to chat
    await group_chats_collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$push": {"members": user_to_add["_id"]}}
    )
    
    return {"message": "User added to chat successfully"}

# Remove user from group chat
@router.delete("/groups/{chat_id}/members/{user_id}", status_code=status.HTTP_200_OK)
async def remove_user_from_chat(
    chat_id: str,
    user_id: int,
    current_user: auth.models.User = Depends(auth.get_current_active_user)
):
    # Get MongoDB user
    mongo_user = await get_mongo_user_by_mysql_id(current_user.id)
    
    # Check if chat exists and user is a member
    chat = await group_chats_collection.find_one({
        "_id": ObjectId(chat_id),
        "members": mongo_user["_id"]
    })
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or you're not a member")
    
    # Get user to remove
    user_to_remove = await users_collection.find_one({"mysql_id": user_id})
    if not user_to_remove:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is a member
    if user_to_remove["_id"] not in chat["members"]:
        raise HTTPException(status_code=400, detail="User is not a member of this chat")
    
    # Remove user from chat
    await group_chats_collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$pull": {"members": user_to_remove["_id"]}}
    )
    
    return {"message": "User removed from chat successfully"} 