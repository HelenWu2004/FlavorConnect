# FlavorConnect Environment Variables Guide

This guide explains how to move sensitive information like API keys, database credentials, and other secrets to `.env` files to improve the security of your FlavorConnect project.

## Setup Environment Files

1. Run the provided script to create the necessary `.env` files:

```bash
python create_env_files.py
```

This will:
- Create a `.env` file in the project root (for frontend variables)
- Create a `.env` file in the backend directory (for backend variables)
- Add `.env` entries to `.gitignore` if not already present
- Update `docker-compose.yml` to use these `.env` files

## Update Your Code

### Backend (FastAPI)

The backend already uses `os.getenv()` in some places, but needs to be updated in others:

1. In `main.py`, update the Spoonacular API key:

```python
# Before (hardcoded or fallback value)
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "1b3d4b9a211a493c8f57108ba5556b81")

# After (using only environment variable)
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")
if not SPOONACULAR_API_KEY:
    print("Warning: SPOONACULAR_API_KEY not set in environment variables")
```

2. For Firebase credentials, update your code to load from environment variable:

```python
import json
import os

# Load Firebase credentials from file path in environment variable
firebase_credentials_file = os.getenv("FIREBASE_CREDENTIALS_FILE")
if firebase_credentials_file and os.path.exists(firebase_credentials_file):
    with open(firebase_credentials_file, 'r') as f:
        firebase_credentials = json.load(f)
else:
    # Handle error or fallback
```

### Frontend (Next.js)

The frontend already uses `process.env` to access environment variables. Make sure you:

1. Add any new environment variables to your `.env` file
2. Use `process.env.VARIABLE_NAME` to access them in your code

## Security Best Practices

1. **Never commit `.env` files to version control**
   - `.env` files should be added to `.gitignore`
   - Share environment variable values through secure channels

2. **Rotate secrets regularly**
   - Change API keys, passwords and tokens periodically
   - Update the `.env` files when secrets change

3. **Use different values for development and production**
   - Consider having separate `.env.development` and `.env.production` files
   - Never use production secrets in development environments

4. **Limit access to environment files**
   - Restrict who can view or modify these files
   - Consider using a secrets management service for production

## Secure Firebase Credentials

The Firebase service account key file contains sensitive information. Consider:

1. Moving the key contents directly to environment variables
2. Using Firebase Admin SDK's application default credentials
3. Restricting the service account's permissions to only what's needed

## Docker Environment Variables

The script updates `docker-compose.yml` to use the `.env` files directly. Alternatively, you can:

1. Pass individual environment variables to containers
2. Use Docker secrets for highly sensitive information

---

For more information about environment variables in:
- FastAPI: https://fastapi.tiangolo.com/advanced/settings/
- Next.js: https://nextjs.org/docs/basic-features/environment-variables 