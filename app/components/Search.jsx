// app/components/Search.jsx
import React, { useState } from 'react';
import { HiSearch } from "react-icons/hi";

function Search({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  }

  return (
    <div className='bg-[#e9e9e9] p-3 px-6 flex gap-3 items-center rounded-full'>
      <HiSearch 
        className='text-[34px] text-gray-500 cursor-pointer' 
        onClick={handleSearch}
      />
      <input 
        type="text" 
        placeholder='Search for recipes' 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        className='bg-transparent outline-none w-full text-[25px]' 
      />
    </div>
  )
}

export default Search