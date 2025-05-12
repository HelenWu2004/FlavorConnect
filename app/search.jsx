"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, doc, getDoc, getFirestore } from 'firebase/firestore';
import app from './Shared/firebaseConfig';
import PinList from './components/Pins/PinList';

export default function SearchDebugPage() {
  const db = getFirestore(app);
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [listOfPins, setListOfPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({
    apiCall: null,
    apiResponse: null,
    resultIds: [],
    firestoreResults: []
  });

  useEffect(() => {
    if (query.trim() !== '') {
      fetchResults();
    } else {
      setListOfPins([]);
    }
    // eslint-disable-next-line
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    setDebugInfo({
      apiCall: { url: `/api/search?query=${encodeURIComponent(query)}`, timestamp: new Date().toISOString() },
      apiResponse: null,
      resultIds: [],
      firestoreResults: []
    });
    
    try {
      console.log("🔍 Fetching results for query:", query);
      
      // 1. Call the API to get search results
      const apiUrl = `/api/search?query=${encodeURIComponent(query)}`;
      console.log("📲 Calling API at:", apiUrl);
      const res = await fetch(apiUrl);
      
      const statusInfo = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers.entries()])
      };
      console.log("📊 API response status:", statusInfo);
      
      const data = await res.json();
      console.log("📊 API response data:", data);
      
      // Update debug info with API response
      setDebugInfo(prev => ({
        ...prev,
        apiResponse: {
          status: statusInfo,
          data: data,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Extract result array (may be called result, idx, or something else)
      const idxArr = data.result || [];
      console.log("🔢 Document IDs to fetch:", idxArr);
      
      // Update debug info with result IDs
      setDebugInfo(prev => ({
        ...prev,
        resultIds: idxArr
      }));
      
      if (idxArr.length === 0) {
        console.log("⚠️ No results found");
        setListOfPins([]);
        setLoading(false);
        return;
      }
      
      // 2. Fetch Firestore docs by id
      const recipesRef = collection(db, 'recipe-post-test');
      const docsPromises = idxArr.map(id => {
        const docId = id.toString();
        console.log(`📑 Fetching doc with ID: ${docId}`);
        return getDoc(doc(recipesRef, docId));
      });
      
      const docsSnapshots = await Promise.all(docsPromises);
      
      // Check which docs exist and which don't
      const docsStatus = docsSnapshots.map((snap, i) => {
        const exists = snap.exists();
        const status = exists ? "✅ Found" : "❌ Not found";
        console.log(`${status} - Document ID: ${idxArr[i]}`);
        return {
          id: idxArr[i],
          exists: exists,
          path: snap.ref.path
        };
      });
      
      // Update debug info with Firestore results
      setDebugInfo(prev => ({
        ...prev,
        firestoreResults: docsStatus
      }));
      
      const results = docsSnapshots
        .filter(snap => snap.exists())
        .map(snap => ({ id: snap.id, ...snap.data() }));
      
      console.log("📋 Final results:", results);
      setListOfPins(results);
    } catch (error) {
      console.error("🚫 Error fetching results:", error);
      setError(`Error: ${error.message}`);
      setListOfPins([]);
      
      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      }));
    }
    setLoading(false);
  };

  return (
    <div className='p-3'>
      <h2 className='text-2xl font-bold mb-4'>Search Debug for "{query}"</h2>
      
      {/* Debug Info */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">Debug Information</h3>
        
        <div className="mb-4">
          <h4 className="font-bold">API Call:</h4>
          <pre className="bg-white p-2 rounded overflow-auto">{JSON.stringify(debugInfo.apiCall, null, 2)}</pre>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold">API Response:</h4>
          <pre className="bg-white p-2 rounded overflow-auto">{JSON.stringify(debugInfo.apiResponse, null, 2)}</pre>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold">Backend Result IDs ({debugInfo.resultIds.length}):</h4>
          <ul className="list-disc pl-6">
            {debugInfo.resultIds.slice(0, 10).map((id, index) => (
              <li key={index} className="font-mono">{id}</li>
            ))}
            {debugInfo.resultIds.length > 10 && <li>... and {debugInfo.resultIds.length - 10} more</li>}
          </ul>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold">Firestore Document Status:</h4>
          <ul className="divide-y">
            {debugInfo.firestoreResults.map((doc, index) => (
              <li key={index} className={`py-1 ${doc.exists ? 'text-green-700' : 'text-red-700'}`}>
                ID: <span className="font-mono">{doc.id}</span> - 
                {doc.exists ? ' ✅ Found' : ' ❌ Not found'} - 
                Path: <span className="font-mono text-sm">{doc.path}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Search Results */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : listOfPins.length === 0 ? (
        <div className="text-center py-10">No results found</div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-4">Search Results ({listOfPins.length}):</h3>
          <PinList listOfPins={listOfPins} />
        </div>
      )}
    </div>
  );
} 