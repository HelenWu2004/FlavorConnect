"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { HiSearch,HiBell,HiChat } from "react-icons/hi";
import app from './../Shared/firebaseConfig'
import { useRouter } from 'next/navigation';

function Header() {
  const { data: session } = useSession();
  const router=useRouter();
  const db = getFirestore(app);
  const [searchQuery, setSearchQuery] = useState("");

  const onSearchSubmit = () => {
    if (searchQuery.trim()) {
      console.log("🔎 Search submitted:", searchQuery);
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Direct test function to check if API route is working
  const testDirectSearch = async () => {
    console.log("🧪 Testing direct search API call...");
    try {
      const testQuery = "test";
      console.log(`Calling API with query: ${testQuery}`);
      const res = await fetch(`/api/search?query=${testQuery}`);
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("✅ Direct search test result:", data);
      alert(`Search test complete! Results: ${JSON.stringify(data.result || [])}`);
    } catch (error) {
      console.error("❌ Direct search test failed:", error);
      alert("Search test failed! Error: " + error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };


  useEffect(()=>{
    saveUserInfo();
  },[session])

  const saveUserInfo=async()=>{
    if(session?.user)
    {
      await setDoc(doc(db, "user", session.user.email), {
        userName: session.user.name,
        email: session.user.email,
        userImage: session.user.image
      });
    }
  }

  const onCreateClick=()=>{
    if(session)
    {
      router.push('/pin-builder')
    }
    else{
      signIn()
    }
  }

  
  return (
    <div className='flex justify-between 
     gap-3 md:gap-2 items-center p-6 '>
        <Image src='/logo.png' alt='logo'
        width={60} height={60} onClick={()=>router.push('/')}
        className='hover:bg-gray-300 p-2
        rounded-full cursor-pointer'/>
        <button className='bg-black
         text-white p-3 px-6 rounded-full
         text-[25px]
          hidden md:block' onClick={()=>router.push('/')}>Home</button>
        <button className='font-semibold p-3 px-6
         rounded-full text-[25px]' 
         onClick={()=>onCreateClick()}>Create</button>
        {/* <div className='bg-[#e9e9e9] p-3 px-6
         gap-3 items-center rounded-full w-full hidden md:flex'>
        <HiSearch className='text-[34px] 
        text-gray-500'/>
        <input type="text" placeholder='Search'
        className='bg-transparent outline-none w-full text-[25px]' />
       
        </div> */}

      {/* 🔹 Search Bar with Submit Button and Enter Key Support */}
      <div className="flex bg-[#e9e9e9] p-3 px-6 gap-3 items-center rounded-full w-full md:flex">
        <input
          type="text"
          placeholder="Search recipes..."
          className="bg-transparent outline-none w-full text-[25px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown} // 🔹 Listens for Enter key
        />
        <HiSearch className="text-[34px] text-gray-500 cursor-pointer"
          onClick={onSearchSubmit} // 🔹 Triggers search on click
        />
        </div>
      
      {/* Test Search Button - Remove in production */}
      <button 
        onClick={testDirectSearch}
        className="bg-red-500 text-white px-2 py-1 rounded-full text-xs"
        title="Test search API directly"
      >
        Test
      </button>

        <HiSearch className='text-[25px] 
        text-gray-500 md:hidden'/>
        <HiBell className='text-[25px] md:text-[60px] text-gray-500 cursor-pointer'/>
        <HiChat className='text-[25px] md:text-[60px] text-gray-500 cursor-pointer'/>
      {session?.user?  
      <Image src={session.user.image} 
       onClick={()=>router.push('/'+session.user.email)}
      alt='user-image' width={60} height={60}
        className='hover:bg-gray-300 p-2
        rounded-full cursor-pointer'/>:

        <button className='font-semibold p-2 px-4 rounded-full'
         onClick={() => signIn()}>Login</button>}



    </div>
  )
}

export default Header