import os
import sys
import asyncio
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
import auth
from init_mongodb import init_mongodb_data

# Create tables
Base.metadata.create_all(bind=engine)

def init_mysql_db():
    db = SessionLocal()
    try:
        # Check if we already have users
        user_count = db.query(models.User).count()
        if user_count > 0:
            print("MySQL database already initialized, skipping...")
            return
        
        # Create sample users
        print("Creating sample users...")
        user1 = models.User(
            email="john@example.com",
            username="john_doe",
            hashed_password=auth.get_password_hash("password123"),
            is_active=True
        )
        user2 = models.User(
            email="jane@example.com",
            username="jane_smith",
            hashed_password=auth.get_password_hash("password123"),
            is_active=True
        )
        db.add(user1)
        db.add(user2)
        db.commit()
        db.refresh(user1)
        db.refresh(user2)
        
        # Create sample tags
        print("Creating sample tags...")
        tags = [
            models.Tag(name="Italian"),
            models.Tag(name="Mexican"),
            models.Tag(name="Dessert"),
            models.Tag(name="Vegetarian"),
            models.Tag(name="Quick"),
            models.Tag(name="Healthy")
        ]
        for tag in tags:
            db.add(tag)
        db.commit()
        
        # Get tags
        italian_tag = db.query(models.Tag).filter(models.Tag.name == "Italian").first()
        mexican_tag = db.query(models.Tag).filter(models.Tag.name == "Mexican").first()
        dessert_tag = db.query(models.Tag).filter(models.Tag.name == "Dessert").first()
        vegetarian_tag = db.query(models.Tag).filter(models.Tag.name == "Vegetarian").first()
        quick_tag = db.query(models.Tag).filter(models.Tag.name == "Quick").first()
        healthy_tag = db.query(models.Tag).filter(models.Tag.name == "Healthy").first()
        
        # Create sample recipes
        print("Creating sample recipes...")
        recipe1 = models.Recipe(
            title="Spaghetti Carbonara",
            description="A classic Italian pasta dish with eggs, cheese, and pancetta.",
            ingredients="400g spaghetti\n150g pancetta\n2 large eggs\n50g pecorino cheese\n50g parmesan\nFreshly ground black pepper\nSalt",
            instructions="1. Cook spaghetti according to package instructions.\n2. Fry pancetta until crispy.\n3. Beat eggs and mix with grated cheese.\n4. Drain pasta and mix with pancetta.\n5. Add egg mixture and stir quickly.\n6. Season with black pepper and serve immediately.",
            image_url="https://example.com/carbonara.jpg",
            user_id=user1.id
        )
        recipe1.tags.append(italian_tag)
        recipe1.tags.append(quick_tag)
        
        recipe2 = models.Recipe(
            title="Vegetarian Tacos",
            description="Delicious vegetarian tacos with beans and avocado.",
            ingredients="8 corn tortillas\n1 can black beans\n1 avocado\n1 tomato\n1 onion\nCilantro\nLime\nSalt and pepper",
            instructions="1. Heat the tortillas.\n2. Drain and heat the black beans.\n3. Dice tomato, onion, and avocado.\n4. Assemble tacos with beans and toppings.\n5. Garnish with cilantro and lime juice.",
            image_url="https://example.com/tacos.jpg",
            user_id=user2.id
        )
        recipe2.tags.append(mexican_tag)
        recipe2.tags.append(vegetarian_tag)
        recipe2.tags.append(healthy_tag)
        
        recipe3 = models.Recipe(
            title="Chocolate Chip Cookies",
            description="Classic chocolate chip cookies that are crispy on the outside and chewy on the inside.",
            ingredients="250g all-purpose flour\n1/2 tsp baking soda\n170g unsalted butter\n150g brown sugar\n100g white sugar\n1 egg\n1 tsp vanilla extract\n200g chocolate chips\nPinch of salt",
            instructions="1. Preheat oven to 350°F (175°C).\n2. Mix flour, baking soda, and salt.\n3. Cream butter and sugars until light.\n4. Add egg and vanilla.\n5. Gradually add flour mixture.\n6. Stir in chocolate chips.\n7. Drop spoonfuls onto baking sheets.\n8. Bake for 10-12 minutes.",
            image_url="https://example.com/cookies.jpg",
            user_id=user1.id
        )
        recipe3.tags.append(dessert_tag)
        
        db.add(recipe1)
        db.add(recipe2)
        db.add(recipe3)
        db.commit()
        db.refresh(recipe1)
        db.refresh(recipe2)
        db.refresh(recipe3)
        
        # Create sample comments
        print("Creating sample comments...")
        comment1 = models.Comment(
            content="This recipe is amazing! I made it last night and my family loved it.",
            user_id=user2.id,
            recipe_id=recipe1.id
        )
        comment2 = models.Comment(
            content="I added some chili flakes for extra spice. Delicious!",
            user_id=user1.id,
            recipe_id=recipe2.id
        )
        db.add(comment1)
        db.add(comment2)
        db.commit()
        
        # Create sample favorites
        print("Creating sample favorites...")
        favorite1 = models.Favorite(
            user_id=user2.id,
            recipe_id=recipe1.id
        )
        favorite2 = models.Favorite(
            user_id=user1.id,
            recipe_id=recipe2.id
        )
        db.add(favorite1)
        db.add(favorite2)
        db.commit()
        
        print("MySQL database initialized successfully!")
    
    finally:
        db.close()

async def init_all():
    # Initialize MySQL database
    init_mysql_db()
    
    # Initialize MongoDB database
    await init_mongodb_data()
    
    print("All databases initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_all()) 