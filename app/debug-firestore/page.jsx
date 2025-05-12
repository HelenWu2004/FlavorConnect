"use client"
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../Shared/firebaseConfig';

export default function DebugFirestore() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const db = getFirestore(app);
        const recipesRef = collection(db, 'recipe-post-test');
        console.log("Fetching docs from:", recipesRef.path);
        
        const snapshot = await getDocs(recipesRef);
        console.log(`Found ${snapshot.docs.length} documents`);
        
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDocs(documents);
      } catch (err) {
        console.error("Error fetching docs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDocs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firestore Debug</h1>
      
      {loading && <p className="text-gray-500">Loading documents...</p>}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Document Count: {docs.length}</h2>
        <p className="text-sm text-gray-500">
          First 10 document IDs shown below
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Has Image?</th>
            </tr>
          </thead>
          <tbody>
            {docs.slice(0, 10).map((doc, index) => (
              <tr key={doc.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b font-mono">{doc.id}</td>
                <td className="py-2 px-4 border-b">{doc.title || '—'}</td>
                <td className="py-2 px-4 border-b">{doc.email || '—'}</td>
                <td className="py-2 px-4 border-b">{doc.image ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {docs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Sample Document Structure</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(docs[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 