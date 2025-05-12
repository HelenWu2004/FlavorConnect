"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import app from "../Shared/firebaseConfig";
import UserInfo from "../components/UserInfo";
import { collection, getDocs, getFirestore, query, where, limit, startAfter, doc, getDoc } from "firebase/firestore";
import PinList from "../components/Pins/PinList";
import { useParams } from "next/navigation";

export default function Profile() {
  const params = useParams();
  const db = getFirestore(app);
  const [userInfo, setUserInfo] = useState();
  const [listOfPins, setListOfPins] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  useEffect(() => {
    if (params && params.userId) {
      const userId = params.userId.replace("%40", "@");
      getUserInfo(userId);
    }
  }, [params]);

  const getUserInfo = async (email) => {
    const docRef = doc(db, "user", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserInfo(docSnap.data());
    } else {
      console.log("No such user!");
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchUserPins();
    }
  }, [userInfo]);

  const fetchUserPins = async () => {
    if (loading) return;
    setLoading(true);

    let q = query(
      collection(db, "recipe-post-test"),
      where("userName", "==", userInfo.userName),
      limit(50)
    );

    if (lastDoc) {
      q = query(
        collection(db, "recipe-post-test"),
        where("userName", "==", userInfo.userName),
        startAfter(lastDoc),
        limit(50)
      );
    }

    const querySnapshot = await getDocs(q);
    const newPins = [];
    querySnapshot.forEach((doc) => {
      newPins.push(doc.data());
    });

    setListOfPins((prev) => [...prev, ...newPins]);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setLoading(false);
  };

  const lastPinRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchUserPins();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, userInfo]
  );

  return (
    <div>
      {userInfo && (
        <>
          <UserInfo userInfo={userInfo} />
          <PinList listOfPins={listOfPins} lastPinRef={lastPinRef} />
          {loading && <p>Loading more pins...</p>}
        </>
      )}
    </div>
  );
}
