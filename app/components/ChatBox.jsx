"use client"
import React, { useState } from 'react'
import axios from 'axios'

const ChatBot = () => {
  const [ingredients, setIngredients] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const handleSuggest = async () => {
    const list = ingredients
      .split(',')
      .map(s => s.trim())
      .filter(s => s)
    try {
      const res = await axios.post('/api/chatbot/suggest-recipes', {
        ingredients: list,
        number: 5
      })
      setSuggestions(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Recipe Chatbot</h2>
      <input
        type="text"
        className="border p-2 w-full mb-2"
        placeholder="Enter ingredients, separated by commas"
        value={ingredients}
        onChange={e => setIngredients(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSuggest}
      >
        Suggest Recipes
      </button>
      <ul className="mt-4 space-y-4">
        {suggestions.map((rec, idx) => (
          <li key={idx} className="border p-2 rounded">
            <img src={rec.image} alt={rec.title} className="w-24 h-24 object-cover float-left mr-4"/>
            <h3 className="font-bold">{rec.title}</h3>
            <p className="text-sm">{rec.ingredients.join(', ')}</p>
            <p className="clear-left mt-2">{rec.instructions || 'No instructions available.'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ChatBot