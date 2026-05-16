'use client'

import Image, { StaticImageData } from 'next/image'

interface PersonCardProps {
  name: string
  role: string
  position: string
  image: StaticImageData | string
}

export default function PersonCard({ name, role, position, image }: PersonCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full animate-fadeIn">
      <div className="relative h-64 bg-gray-200">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/Ousman-Bah.webp'
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-dark">{name}</h3>
        <h5 className="text-sm font-semibold text-primary mb-1">{role}</h5>
        <p className="text-sm text-gray-600">{position}</p>
      </div>
    </div>
  )
}
