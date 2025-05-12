import pandas as pd
import numpy as np
from gensim.models import Word2Vec
from scipy.special import expit
from Levenshtein import distance
import os
from typing import List, Dict, Any
import time


class OptimizedSearchEngine:
    def __init__(self, model_path: str = None, recipes_path: str = None):
        self.model = None
        self.recipes = None
        self.vocabulary = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        if recipes_path and os.path.exists(recipes_path):
            self.load_recipes(recipes_path)
            
    def load_model(self, model_path: str):
        """Load a pre-trained Word2Vec model"""
        self.model = Word2Vec.load(model_path)
        self.vocabulary = set(self.model.wv.index_to_key)
        
    def load_recipes(self, recipes_path: str):
        """Load recipes from CSV"""
        self.recipes = pd.read_csv(recipes_path)
        # Convert combined_cleaned from string to list if needed
        if isinstance(self.recipes['combined_cleaned'].iloc[0], str):
            try:
                # Try to evaluate the string as a Python list
                self.recipes['combined_cleaned'] = self.recipes['combined_cleaned'].apply(eval)
            except:
                # If that fails, split the string into words
                self.recipes['combined_cleaned'] = self.recipes['combined_cleaned'].apply(lambda x: x.split())
        
    def _get_document_vector(self, doc: List[str]):
        """Get the average vector for a document"""
        vectors = []
        for word in doc:
            if word in self.vocabulary:
                vectors.append(self.model.wv[word])
        if vectors:
            return np.mean(vectors, axis=0)
        return np.zeros(self.model.vector_size)
        
    def correct_word(self, word: str) -> str:
        """Correct typos in words using Levenshtein distance"""
        if word in self.vocabulary:
            return word
        closest_word = min(self.vocabulary, key=lambda x: distance(word, x))
        return closest_word if distance(word, closest_word) <= 2 else word
        
    def preprocess_query(self, query: str) -> str:
        """Preprocess and correct query words"""
        corrected_words = []
        for word in query.split():
            if word in self.model.wv.index_to_key:  # If word exists in vocabulary, keep it
                corrected_words.append(word)
            else:  # Otherwise, attempt to correct it
                corrected_words.append(self.correct_word(word))
        return ' '.join(corrected_words)
    
    def compute_avg_log_likelihood(self,query, doc, epsilon=1e-10):
        similarity_scores = []
        def sigmoid(x):
            return expit(x)

        for query_word in query.split():
            if query_word in self.model.wv:
                similarities = [self.model.wv.similarity(query_word, doc_word) for doc_word in doc.split() if doc_word in self.model.wv]
                similarity = sigmoid(max(similarities))
                similarity_scores.append(similarity)
        avg_similarity = np.mean(similarity_scores)
        avg_similarity = max(avg_similarity, epsilon)
        log_likelihood = np.log(avg_similarity)
        return log_likelihood

    def execute_search_Word2Vec(self, query):
        relevances = np.zeros(self.recipes.shape[0])
        for index, row in self.recipes.iterrows():
            doc_text = ' '.join(row['combined_cleaned'])
            relevances[index] = self.compute_avg_log_likelihood(query, doc_text)
        return relevances
        
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Execute search and return top k results"""
        start_time = time.time()
        
        # Preprocess query
        query = self.preprocess_query(query)
        print(query)
        # query_vector = self._get_document_vector(query.split())
        # query = preprocess_query(query)
        
        relevance_scores = self.execute_search_Word2Vec(query)
        print(relevance_scores)
            
        # similarities = np.array(similarities)
        # similarities = expit(similarities)  # Apply sigmoid
        
        # Get top k results
        # top_indices = np.argsort(similarities)[-top_k:][::-1]
        sorted_indices = np.argsort(relevance_scores)[::-1][:top_k]
        print(sorted_indices)
        return sorted_indices.tolist()

        
        # results = []
        # for idx in top_indices:
        #     recipe = self.recipes.iloc[idx]
        #     results.append({
        #         'Title': recipe['Title'],
        #         'Image_Name': recipe['Image_Name'],
        #         'Instructions': recipe['Instructions'],
        #         'index': recipe['index'],
        #         'relevance_score': float(similarities[idx])
        #     })
            
        # print(f"Search completed in {time.time() - start_time:.2f} seconds")
        # return results
        return top_indices
        
    def save_model(self, model_path: str):
        """Save the model"""
        if self.model:
            self.model.save(model_path) 