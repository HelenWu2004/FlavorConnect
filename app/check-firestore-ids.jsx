"use client"
import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import app from './Shared/firebaseConfig'

export default function CheckFirestoreIds() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      const db = getFirestore(app)
      const recipesCollection = collection(db, 'recipe-post-test')
      const querySnapshot = await getDocs(recipesCollection)
      
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setDocuments(docs)
      setLoading(false)
    }
    
    fetchDocs()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firestore Document IDs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p className="mb-2">Total documents: {documents.length}</p>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">First 10 document IDs:</h2>
            <ul className="list-disc pl-6">
              {documents.slice(0, 10).map(doc => (
                <li key={doc.id} className="mb-1">
                  <span className="font-mono bg-gray-100 px-2 rounded">{doc.id}</span>
                  {doc.title && <span className="ml-2">- {doc.title}</span>}
                </li>
              ))}
            </ul>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Sample document data:</h2>
          {documents.length > 0 && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(documents[0], null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
} 