"use client"
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import app from '../Shared/firebaseConfig';
import PinList from '../components/Pins/PinList';

export default function SearchPage() {
  const searchParams = useSearchParams()
  const defaultQuery = searchParams.get('query') || ''
  const db = getFirestore(app);
  
  const [query, setQuery] = useState(defaultQuery)
  const [listOfPins, setListOfPins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadCount, setLoadCount] = useState(0)
  const [loadedIds, setLoadedIds] = useState(new Set())
  const loaderRef = useRef(null)
  
  // Number of results to load per batch
  const RESULTS_PER_PAGE = 50
  
  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const target = entries[0]
      if (target.isIntersecting && !loading && loadCount > 0) {
        loadMoreRandomResults()
      }
    }, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    })
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [loading, loadCount])

  // Auto-search when component loads with a query
  useEffect(() => {
    if (defaultQuery) {
      setQuery(defaultQuery)
      // Reset when query changes
      setListOfPins([])
      setLoadedIds(new Set())
      setLoadCount(0)
      searchRecipes(defaultQuery)
    }
  }, [defaultQuery])
  
  const searchRecipes = async (searchQuery) => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the search API for random results
      // const response = await fetch(`/query=${encodeURIComponent(searchQuery)}&limit=${RESULTS_PER_PAGE}`)
      const response = await fetch(`http://localhost:8000/search?query=${(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error(`Error searching recipes`)
      }
      
      const data = await response.json()
      
      if (!data.result || data.result.length === 0) {
        setLoading(false)
        return
      }
      
      await fetchAndAppendResults(data.result, true)
      setLoadCount(1)
    } catch (error) {
      console.error("Error searching:", error);
      setError("An error occurred while searching");
      setLoading(false)
    }
  }
  
  const loadMoreRandomResults = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      // Call search API again for more random results
      // const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=${RESULTS_PER_PAGE}`)
      const response = await fetch(`http://localhost:8000/search?query=${(query)}}&limit=${RESULTS_PER_PAGE}`)
      
      if (!response.ok) {
        throw new Error(`Error searching for more recipes`)
      }
      
      const data = await response.json()
      
      if (!data.result || data.result.length === 0) {
        setLoading(false)
        return
      }
      
      // Filter out IDs that we've already loaded
      const newIds = data.result.filter(id => !loadedIds.has(id))
      
      if (newIds.length === 0) {
        setLoading(false)
        return
      }
      
      await fetchAndAppendResults(newIds, false)
      setLoadCount(prev => prev + 1)
    } catch (error) {
      console.error("Error loading more results:", error);
      setError("An error occurred while loading more recipes");
    } finally {
      setLoading(false)
    }
  }
  
  const fetchAndAppendResults = async (idArray, isNewSearch) => {
    // Collections to try (in order)
    const collectionsToTry = ['recipe-post-test', 'recipe_post'];
    let allFoundDocs = [];
    
    for (const collectionName of collectionsToTry) {
      try {
        const recipesRef = collection(db, collectionName)
        const docsPromises = idArray.map(id => {
          return getDoc(doc(recipesRef, id.toString()))
        })
        
        const snapshots = await Promise.all(docsPromises)
        
        // Process the results
        const foundDocs = snapshots
          .filter(snap => snap.exists())
          .map(snap => ({
            id: snap.id,
            ...snap.data()
          }))
        
        if (foundDocs.length > 0) {
          allFoundDocs = [...allFoundDocs, ...foundDocs];
        }
      } catch (error) {
        console.error(`Error with collection ${collectionName}:`, error);
      }
    }
    
    // Update loaded IDs
    const newLoadedIds = new Set(loadedIds)
    idArray.forEach(id => newLoadedIds.add(id))
    setLoadedIds(newLoadedIds)
    
    // Update pins list
    if (isNewSearch) {
      setListOfPins(allFoundDocs)
    } else {
      setListOfPins(prev => [...prev, ...allFoundDocs])
    }
    
    setLoading(false)
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      // Reset all state for new search
      setListOfPins([])
      setLoadedIds(new Set())
      setLoadCount(0)
      searchRecipes(query)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {defaultQuery ? `Search Results for "${defaultQuery}"` : 'Recipe Search'}
      </h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for recipes..."
            className="border rounded-l px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading && loadCount === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Initial loading state */}
      {loading && loadCount === 0 && (
        <div className="my-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Searching for recipes...</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="my-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* No results message */}
      {!loading && !error && listOfPins.length === 0 && defaultQuery && (
        <div className="my-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>No recipes found for "{defaultQuery}"</p>
          <p className="mt-2">Try using different keywords or simplify your search.</p>
        </div>
      )}
      
      {/* Results */}
      {listOfPins.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Found {listOfPins.length} recipes</h2>
          <PinList listOfPins={listOfPins} />
          
          {/* Bottom loader for pagination */}
          <div ref={loaderRef} className="my-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading more recipes...</p>
              </div>
            ) : (
              <div className="h-10 w-full"></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 