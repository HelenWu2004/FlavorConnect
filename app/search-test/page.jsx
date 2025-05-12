"use client"
import { useState, useEffect } from 'react'

export default function SearchTest() {
  const [query, setQuery] = useState('test')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [
      { time: new Date().toLocaleTimeString(), message }, 
      ...prev.slice(0, 19)
    ])
  }

  const testDirectBackend = async () => {
    setLoading(true)
    setError(null)
    addLog(`Testing direct backend call with query: "${query}"`)
    
    try {
      const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(query)}`)
      const status = response.status
      addLog(`Backend response status: ${status}`)
      
      const data = await response.json()
      addLog(`Backend response data: ${JSON.stringify(data)}`)
      setResults(data)
    } catch (error) {
      addLog(`❌ Error: ${error.message}`)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const testApiRoute = async () => {
    setLoading(true)
    setError(null)
    addLog(`Testing API route with query: "${query}"`)
    
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      const status = response.status
      addLog(`API response status: ${status}`)
      
      const data = await response.json()
      addLog(`API response data: ${JSON.stringify(data)}`)
      setResults(data)
    } catch (error) {
      addLog(`❌ Error: ${error.message}`)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlQuery = searchParams.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
      (async () => {
        setLoading(true);
        setError(null);
        addLog(`Auto-testing API route with query: "${urlQuery}"`);
        
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(urlQuery)}`);
          const status = response.status;
          addLog(`API response status: ${status}`);
          
          const data = await response.json();
          addLog(`API response data: ${JSON.stringify(data)}`);
          setResults(data);
        } catch (error) {
          addLog(`❌ Error: ${error.message}`);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search API Test Page</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Search Query:</label>
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-l px-3 py-2 w-full"
          />
          <button
            onClick={testApiRoute}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-r disabled:opacity-50"
          >
            Test API Route
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={testDirectBackend}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          Test Direct Backend
        </button>
        <span className="text-sm text-gray-500">
          (Requires backend running on port 8000)
        </span>
      </div>
      
      {loading && (
        <div className="my-4 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
      
      {error && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {results && (
        <div className="my-4">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Logs:</h2>
        <div className="bg-black text-green-400 p-4 rounded overflow-auto h-64 font-mono text-sm">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="opacity-70">[{log.time}]</span> {log.message}
            </div>
          ))}
          {logs.length === 0 && <div className="opacity-50">No logs yet</div>}
        </div>
      </div>
    </div>
  )
} 