# FlavorConnect Backend API

This is the backend API for FlavorConnect, a recipe sharing platform. It is built with FastAPI and uses a hybrid database system combining MySQL for structured data and MongoDB for real-time chat functionality.

## Database Architecture

### MySQL (Relational Database)
- Stores structured data related to users, recipes, follows, likes, and comments.
- Ensures data integrity through foreign key constraints.
- Allows querying for user interactions, such as retrieving recipes, followers, and likes efficiently.

### MongoDB (NoSQL for Chat System)
- Handles real-time messaging in group chats.
- Uses flexible document storage for chat messages, linking to users via ObjectIDs.
- Enables fast retrieval of chat history and group members.

### Integration
- User accounts exist in both MySQL and MongoDB, with `mysql_id` in MongoDB linking to MySQL's `users.id`.
- Recipes, likes, and follows are managed in MySQL, ensuring structured relationships.
- Chat messages are stored in MongoDB, allowing efficient real-time communication.

## External APIs

### Spoonacular API
- Integrated for fetching recipe data from an external source.
- API key is stored in the `.env` file.
- Provides access to thousands of recipes with detailed information.
- Enables recipe search with multiple filtering options.

## Setup

### Prerequisites
- Python 3.8+
- MySQL Server
- MongoDB Server

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure the database connection in `.env` file:
```
# MySQL Database
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=flavorconnect
MYSQL_URL=mysql+pymysql://root:your_password@localhost:3306/flavorconnect

# MongoDB Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=flavorconnect_chat

# Spoonacular API
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

5. Create the MySQL database:
```bash
python create_mysql_db.py
```

6. Initialize the databases with sample data:
```bash
python init_db.py
```

7. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000.

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- POST `/api/users/token` - Get access token

### Users
- POST `/api/users/` - Create a new user
- GET `/api/users/me` - Get current user
- GET `/api/users/{user_id}` - Get user by ID

### Recipes
- POST `/api/recipes/` - Create a new recipe
- GET `/api/recipes/` - Get all recipes
- GET `/api/recipes/{recipe_id}` - Get recipe by ID
- PUT `/api/recipes/{recipe_id}` - Update recipe
- DELETE `/api/recipes/{recipe_id}` - Delete recipe
- GET `/api/recipes/search/` - Search recipes
- GET `/api/recipes/tags/{tag_name}` - Get recipes by tag

### Comments
- POST `/api/comments/` - Create a new comment
- GET `/api/comments/recipe/{recipe_id}` - Get comments by recipe
- PUT `/api/comments/{comment_id}` - Update comment
- DELETE `/api/comments/{comment_id}` - Delete comment

### Favorites
- POST `/api/favorites/` - Add recipe to favorites
- GET `/api/favorites/` - Get user's favorite recipes
- DELETE `/api/favorites/{recipe_id}` - Remove recipe from favorites
- GET `/api/favorites/check/{recipe_id}` - Check if recipe is favorited

### Chat (MongoDB)
- GET `/api/chat/groups` - Get all group chats for a user
- POST `/api/chat/groups` - Create a new group chat
- GET `/api/chat/groups/{chat_id}/messages` - Get messages for a group chat
- POST `/api/chat/groups/{chat_id}/messages` - Send a message to a group chat
- POST `/api/chat/groups/{chat_id}/members/{user_id}` - Add user to group chat
- DELETE `/api/chat/groups/{chat_id}/members/{user_id}` - Remove user from group chat

### Spoonacular API
- GET `/api/spoonacular/recipes/search` - Search for recipes using Spoonacular API
- GET `/api/spoonacular/recipes/{recipe_id}` - Get detailed information about a specific recipe from Spoonacular 