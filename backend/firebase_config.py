"""
Firebase configuration module.
This module provides functions to initialize and work with Firebase securely.
"""
import json
import os
import sys
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

# Use absolute import instead of relative import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config

_app = None
_db = None

def initialize_firebase():
    """
    Initialize Firebase with credentials from environment variables.
    
    Returns:
        firebase_admin.App: The initialized Firebase app instance
    """
    global _app
    
    if _app is not None:
        return _app
    
    # Get credentials from config
    firebase_creds = config.get_firebase_credentials()
    
    if not firebase_creds:
        raise ValueError("Firebase credentials not found. Please set FIREBASE_CREDENTIALS_FILE in .env")
    
    cred = credentials.Certificate(firebase_creds)
    _app = firebase_admin.initialize_app(cred)
    
    return _app

def get_firestore_db():
    """
    Get Firestore database client.
    
    Returns:
        firestore.Client: Firestore database client
    """
    global _db
    
    if _db is not None:
        return _db
    
    # Initialize Firebase if not already done
    if not firebase_admin._apps:
        initialize_firebase()
    
    _db = firestore.client()
    return _db 