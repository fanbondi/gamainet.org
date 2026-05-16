'use client'

import Image from 'next/image'
import { sponsors } from '@/data/sponsors'
// import images from '@/assets/images'

export default function Sponsors() {
  return (
    <section id="sponsors" className="py-16 bg-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark mb-4 animate-slideIn">Our Partners</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Proud to be involved with the following institutions, we thank them for helping to be part of this initiative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.link}
              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative w-48 h-32">
                <Image
                  src={sponsor.image}
                  alt={sponsor.name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/Ousman-Bah.webp'
                  }}
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
