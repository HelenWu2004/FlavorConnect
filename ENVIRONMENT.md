<!-- # FlavorConnect Environment Setup Guide

This document explains how to set up and use environment variables for sensitive information in the FlavorConnect project.

## Overview

This project uses environment variables to store sensitive information like:
- API keys
- Database credentials
- JWT secrets
- Firebase credentials

## Setting Up Environment Variables

### Step 1: Create Environment Files

Run the provided script to create `.env` files:

```bash
python create_env_files.py
```

This creates:
- `./.env` - For frontend environment variables
- `./backend/.env` - For backend environment variables
- Updates `.gitignore` to exclude these files
- Modifies `docker-compose.yml` to use the `.env` files

### Step 2: Customize Environment Variables

Edit the generated `.env` files to set your own values:

**Backend Environment Variables (./backend/.env)**:
```
# Database credentials
MYSQL_USER=flavorconnect
MYSQL_PASSWORD=your_secure_password
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=flavorconnect
MYSQL_URL=mysql+pymysql://flavorconnect:your_secure_password@mysql:3306/flavorconnect
MYSQL_ROOT_PASSWORD=your_secure_root_password

# MongoDB credentials
MONGODB_URL=mongodb://mongodb:27017
MONGODB_DATABASE=flavorconnect_chat

# JWT authentication
SECRET_KEY=your_secure_random_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Firebase
FIREBASE_CREDENTIALS_FILE=fengqin-zhou-firebase-adminsdk-fbsvc-e30942ae68.json
```

**Frontend Environment Variables (./.env)**:
```
# Frontend environment variables
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 3: Generate Secure Keys

Use the following commands to generate secure random keys:

**For SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Using Environment Variables

### In Backend (Python)

The backend now has a dedicated `config.py` module that:
1. Loads variables from `.env` files
2. Provides a centralized access point for all environment variables
3. Includes helper functions for loading credentials safely

Example usage:
```python
from . import config

# Access database credentials
db_url = config.MYSQL_URL

# Access API keys
api_key = config.SPOONACULAR_API_KEY

# Use Firebase credentials
firebase_creds = config.get_firebase_credentials()
```

### In Frontend (JavaScript/Next.js)

In Next.js, environment variables can be accessed using `process.env`:

```javascript
// Access Next.js environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
```

## Security Recommendations

1. **Never commit `.env` files to Git**:
   - They're automatically added to `.gitignore` by the setup script
   - Share environment values through secure channels

2. **Use different values for development and production**:
   - Create separate `.env.development` and `.env.production` files
   - Always use different credentials for each environment

3. **Rotate credentials regularly**:
   - Change API keys and passwords periodically
   - Update `.env` files after rotation

## Firebase Credentials

For enhanced security with Firebase credentials:

1. Keep the JSON file outside the project directory
2. Update `FIREBASE_CREDENTIALS_FILE` with the absolute path
3. Consider storing individual Firebase credential fields as separate environment variables

## Docker Deployment

When deploying with Docker:

1. Use Docker's built-in environment file support:
   ```
   docker-compose --env-file ./backend/.env up
   ```

2. For Kubernetes, use secrets:
   ```
   kubectl create secret generic flavorconnect-secrets --from-env-file=./backend/.env
   ```

## Troubleshooting

If environment variables aren't being loaded:

1. Check the `.env` file paths 
2. Verify correct formatting (`KEY=value` without spaces)
3. Restart the application after changing `.env` files
4. Check that `python-dotenv` is installed (`pip install python-dotenv`)

## Additional Resources

- [FastAPI Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Python dotenv Documentation](https://pypi.org/project/python-dotenv/)  -->