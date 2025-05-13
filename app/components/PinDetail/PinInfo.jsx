import React from 'react'
import UserTag from '../UserTag'

function PinInfo({pinDetail}) {
  const user={
    name:pinDetail.userName,
    email:pinDetail.email,
    image:pinDetail.userImage
  }
  const ingredients = pinDetail.link
  ? pinDetail.link.split(',').map(item => item.trim())
  : [];

  return (
    <div>
      <h2 className="text-[30px] font-bold mb-10">{pinDetail.title}</h2>
      <UserTag user={user} />

      <h1 className="mt-10 font-semibold text-xl">Instructions:</h1>
      <p className="mt-2">{pinDetail.desc}</p>

      <h1 className="mt-10 font-semibold text-xl">Ingredients:</h1>
      <div className="flex flex-wrap gap-2 mt-2">
        {ingredients.map((ingredient, index) => (
          <span
            key={index}
            className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
          >
            {ingredient}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PinInfo