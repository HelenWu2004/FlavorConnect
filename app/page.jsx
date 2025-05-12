"use client";
import { collection, getDocs, getFirestore, query, limit, startAfter } from "firebase/firestore";
import app from "./Shared/firebaseConfig";
import { useEffect, useState, useRef, useCallback } from "react";
import PinList from "./components/Pins/PinList";

export default function Home() {
  const db = getFirestore(app);
  const [listOfPins, setListOfPins] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const fetchPins = async () => {
    if (loading) return;
    setLoading(true);

    let q = query(collection(db, "recipe-post-test"), limit(50));
    if (lastDoc) {
      q = query(collection(db, "recipe-post-test"), startAfter(lastDoc), limit(50));
    }

    const querySnapshot = await getDocs(q);
    const pins = [];
    querySnapshot.forEach((doc) => {
      pins.push(doc.data());
    });

    setListOfPins((prev) => [...prev, ...pins]);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const lastPinRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchPins();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  return (
    <div className="p-3">
      <PinList listOfPins={listOfPins} lastPinRef={lastPinRef} />
      {loading && <p>Loading more pins...</p>}
    </div>
  );
}
