import Image from 'next/image'
import React, { useState } from 'react'
import UserTag from '../UserTag'
import { useRouter } from 'next/navigation'

function PinItem({pin}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const user = {
    name: pin?.userName,
    image: pin?.userImage,
  }
  
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E";
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };
  
  return (
    <div className=''>
      <div className="relative 
       before:absolute
       before:h-full before:w-full
       before:rounded-3xl
       before:z-10
       hover:before:bg-gray-600 
       before:opacity-50
       cursor-pointer
       aspect-auto
       " onClick={() => router.push("/pin/" + pin.id)}>
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-3xl">
            <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
       
        <Image 
          src={imageError ? fallbackImage : pin.image}
        alt={pin.title}
          width={800}
          height={0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          quality={75}
          className={`rounded-3xl cursor-pointer relative z-0 w-full h-auto object-cover ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdQImwwPYdQAAAABJRU5ErkJggg=="
          onError={handleImageError}
          onLoad={() => setImageLoaded(true)}
        />
       </div>
      <h2 className='font-bold text-[18px] mb-1 mt-2 line-clamp-2'>{pin.title}</h2>
        <UserTag user={user} />
    </div>
  )
}

export default PinItem