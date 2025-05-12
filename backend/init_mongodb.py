import asyncio
from datetime import datetime
from bson import ObjectId
from mongodb import sync_db, mongo_db, create_indexes
from database import SessionLocal
import models

async def sync_users_to_mongodb():
    """Synchronize users from MySQL to MongoDB"""
    print("Synchronizing users from MySQL to MongoDB...")
    
    # Get MySQL session
    db = SessionLocal()
    
    try:
        # Get all users from MySQL
        mysql_users = db.query(models.User).all()
        
        # Get MongoDB users collection
        users_collection = sync_db["users"]
        
        # Clear existing users in MongoDB
        users_collection.delete_many({})
        
        # Insert users into MongoDB
        for user in mysql_users:
            mongo_user = {
                "username": user.username,
                "email": user.email,
                "profile_pic": None,  # Default value
                "mysql_id": user.id
            }
            users_collection.insert_one(mongo_user)
        
        print(f"Synchronized {len(mysql_users)} users from MySQL to MongoDB")
    
    finally:
        db.close()

async def create_sample_chats():
    """Create sample group chats and messages"""
    print("Creating sample group chats and messages...")
    
    # Get MongoDB collections
    users_collection = sync_db["users"]
    group_chats_collection = sync_db["group_chats"]
    messages_collection = sync_db["messages"]
    
    # Clear existing chats and messages
    group_chats_collection.delete_many({})
    messages_collection.delete_many({})
    
    # Get users from MongoDB
    users = list(users_collection.find())
    
    if len(users) < 2:
        print("Not enough users to create sample chats")
        return
    
    # Create a group chat
    chat = {
        "group_name": "Recipe Discussion",
        "members": [user["_id"] for user in users],
        "createdAt": datetime.utcnow()
    }
    
    chat_id = group_chats_collection.insert_one(chat).inserted_id
    
    # Create sample messages
    messages = [
        {
            "chat_id": chat_id,
            "sender": users[0]["_id"],
            "text": "Hey everyone! What's your favorite recipe?",
            "timestamp": datetime.utcnow()
        },
        {
            "chat_id": chat_id,
            "sender": users[1]["_id"],
            "text": "I love making pasta carbonara!",
            "timestamp": datetime.utcnow()
        }
    ]
    
    messages_collection.insert_many(messages)
    
    print(f"Created 1 group chat and {len(messages)} messages")

async def init_mongodb_data():
    """Initialize MongoDB with sample data"""
    # Create indexes
    await create_indexes()
    
    # Sync users from MySQL to MongoDB
    await sync_users_to_mongodb()
    
    # Create sample chats and messages
    await create_sample_chats()
    
    print("MongoDB initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_mongodb_data()) 