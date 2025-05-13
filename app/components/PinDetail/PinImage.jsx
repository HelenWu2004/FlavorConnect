import Image from 'next/image'
import React from 'react'

function PinImage({pinDetail}) {

  return (
    <div>
    {pinDetail.image ? (
  <Image
    src={pinDetail.image}
    alt={pinDetail.title || "Recipe Image"}
    width={1000}
    height={1000}
  />
) : null}

    </div>
  )
}

export default PinImage