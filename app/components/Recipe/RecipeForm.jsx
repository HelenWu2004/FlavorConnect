// app/components/Recipe/RecipeForm.jsx
import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import UploadImage from '../UploadImage';

function RecipeForm({ existingRecipe }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [recipe, setRecipe] = useState(existingRecipe || {
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    image_url: '',
    tags: []
  });
  const [tag, setTag] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tag.trim() && !recipe.tags.includes(tag.trim())) {
      setRecipe(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tag.trim()] 
      }));
      setTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setRecipe(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleImageUpload = (imageUrl) => {
    setRecipe(prev => ({ ...prev, image_url: imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert('Please log in first');
      return;
    }

    try {
      const url = existingRecipe 
        ? `/api/recipes/${existingRecipe.id}` 
        : '/api/recipes';
        
      const method = existingRecipe ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(`/recipe/${data.id}`);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Error saving recipe, please try again later');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {existingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={recipe.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Ingredients</label>
          <textarea
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="One ingredient per line"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="8"
            placeholder="Detailed cooking steps"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-2 border rounded-l"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((t, i) => (
              <span key={i} className="bg-gray-200 px-2 py-1 rounded flex items-center">
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="ml-1 text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Upload Image</label>
          <UploadImage
            onImageUpload={handleImageUpload}
            existingImage={recipe.image_url}
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
        >
          {existingRecipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
      </form>
    </div>
  );
}

export default RecipeForm;