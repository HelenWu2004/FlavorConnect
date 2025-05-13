# #!/usr/bin/env python3
# """
# Script to create .env files for FlavorConnect project.
# This script generates .env files in the root and backend directories
# with environment variables needed for the application.
# """
# import os
# import sys
# import shutil

# def create_root_env():
#     """Create .env file in the project root directory."""
#     root_env_content = """# Frontend environment variables
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# """
#     with open('.env', 'w') as f:
#         f.write(root_env_content)
#     print("Created .env file in project root")

# def create_backend_env():
#     """Create .env file in the backend directory."""
#     backend_env_content = """# Database credentials
# MYSQL_USER=flavorconnect
# MYSQL_PASSWORD=flavorconnect
# MYSQL_HOST=mysql
# MYSQL_PORT=3306
# MYSQL_DATABASE=flavorconnect
# MYSQL_URL=mysql+pymysql://flavorconnect:flavorconnect@mysql:3306/flavorconnect
# MYSQL_ROOT_PASSWORD=password

# # MongoDB credentials
# MONGODB_URL=mongodb://mongodb:27017
# MONGODB_DATABASE=flavorconnect_chat

# # JWT authentication
# SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# # External APIs
# SPOONACULAR_API_KEY=1b3d4b9a211a493c8f57108ba5556b81

# # Firebase
# FIREBASE_CREDENTIALS_FILE=fengqin-zhou-firebase-adminsdk-fbsvc-e30942ae68.json
# """
#     # Ensure backend directory exists
#     if not os.path.exists('backend'):
#         print("Error: 'backend' directory not found")
#         return

#     with open('backend/.env', 'w') as f:
#         f.write(backend_env_content)
#     print("Created .env file in backend directory")

# def create_gitignore_entry():
#     """Add .env to .gitignore if it doesn't already have it."""
#     if not os.path.exists('.gitignore'):
#         with open('.gitignore', 'w') as f:
#             f.write(".env\n")
#         print("Created .gitignore file with .env entry")
#         return

#     with open('.gitignore', 'r') as f:
#         gitignore_content = f.read()

#     if ".env" not in gitignore_content:
#         with open('.gitignore', 'a') as f:
#             f.write("\n# Environment variables\n.env\n")
#         print("Added .env to .gitignore")
#     else:
#         print(".env already in .gitignore")

# def update_docker_compose():
#     """Backup and update docker-compose.yml to use env files."""
#     if not os.path.exists('docker-compose.yml'):
#         print("Error: docker-compose.yml not found")
#         return

#     # Create backup
#     shutil.copy('docker-compose.yml', 'docker-compose.yml.bak')
#     print("Created backup of docker-compose.yml")

#     with open('docker-compose.yml', 'r') as f:
#         docker_content = f.read()

#     # Add env_file entries to services
#     updated_content = docker_content.replace(
#         "  # FastAPI Backend\n  backend:", 
#         "  # FastAPI Backend\n  backend:\n    env_file:\n      - ./backend/.env"
#     ).replace(
#         "  # Next.js Frontend\n  frontend:", 
#         "  # Next.js Frontend\n  frontend:\n    env_file:\n      - ./.env"
#     ).replace(
#         "  # Sync Scheduler\n  scheduler:", 
#         "  # Sync Scheduler\n  scheduler:\n    env_file:\n      - ./backend/.env"
#     )

#     with open('docker-compose.yml', 'w') as f:
#         f.write(updated_content)
#     print("Updated docker-compose.yml to use env files")

# def main():
#     print("Creating .env files for FlavorConnect project...")
#     create_root_env()
#     create_backend_env()
#     create_gitignore_entry()
#     update_docker_compose()
    
#     print("\nNext steps:")
#     print("1. Review the created .env files and update with your actual secrets")
#     print("2. Remove hardcoded secrets from your codebase")
#     print("3. Update your code to use environment variables for sensitive information")
#     print("4. Use the updated docker-compose.yml or manually configure env file loading")
#     print("5. Make sure Firebase credentials are handled securely (consider environment variables instead of JSON file)")

# if __name__ == "__main__":
#     main() 