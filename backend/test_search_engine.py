import pytest
import os
import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from scipy.special import expit
from Levenshtein import distance
from search_engine import OptimizedSearchEngine  # Assuming your class is in this file

# Dummy paths (replace with actual model and data paths)
MODEL_PATH = "word2vec_model"
RECIPES_PATH = "cleaned_recipe_data.csv"


@pytest.fixture
def search_engine():
    """Fixture to create and return an instance of OptimizedSearchEngine"""
    search = OptimizedSearchEngine(model_path=MODEL_PATH, recipes_path=RECIPES_PATH)
    return search


def test_load_model(search_engine):
    """Test if the model loads correctly"""
    search_engine.load_model(MODEL_PATH)
    assert search_engine.model is not None, "Model should be loaded"
    assert len(search_engine.vocabulary) > 0, "Vocabulary should be non-empty"
    print("load_model test passed!")


def test_load_recipes(search_engine):
    """Test if the recipes load correctly and vectors are precomputed"""
    search_engine.load_recipes(RECIPES_PATH)
    assert search_engine.recipes is not None, "Recipes should be loaded"
    assert len(search_engine.document_vectors) > 0, "Document vectors should be precomputed"
    print("load_recipes test passed!")


def test_correct_word(search_engine):
    """Test if the typo correction works"""
    word = "recpie"  # Example typo
    corrected_word = search_engine.correct_word(word)
    
    # Assuming "recipe" is the closest match for "recpie"
    assert corrected_word == "recipe", f"Expected 'recipe' but got {corrected_word}"
    print("correct_word test passed!")


def test_preprocess_query(search_engine):
    """Test if the query preprocessing works"""
    query = "recpie chedder cheese"
    preprocessed_query = search_engine.preprocess_query(query)
    
    assert preprocessed_query == "recipe cheddar cheese", f"Expected 'recipe cheddar cheese' but got {preprocessed_query}"
    print("preprocess_query test passed!")


def test_search(search_engine):
    """Test the search functionality"""
    query = "chocolate cake"
    results = search_engine.search(query)
    
    assert len(results) > 0, "Search should return results"
    assert 'relevance_score' in results[0], "Results should contain relevance scores"
    print("search test passed!")


def test_save_model(search_engine):
    """Test if the model and vectors are saved correctly"""
    search_engine.save_model("test_model_path")
    
    # Check if model and vectors are saved
    assert os.path.exists("test_model_path"), "Model file should exist"
    assert os.path.exists("test_model_path_vectors.npy"), "Document vectors file should exist"
    print("save_model test passed!")


if __name__ == "__main__":
    pytest.main()
