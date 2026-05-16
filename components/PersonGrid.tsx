'use client'

import { StaticImageData } from 'next/dist/shared/lib/image-external'
import PersonCard from './PersonCard'


interface Person {
  id: number
  name: string
  role: string
  position: string
  image: StaticImageData | string
}
interface PersonGridProps {
  title: string
  subtitle?: string
  people: Person[]
}

export default function PersonGrid({ title, subtitle, people }: PersonGridProps) {
  return (
    <section id={title.toLowerCase().replace(/\s+/g, '-')} className="py-16 bg-light">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-dark mb-4 animate-slideIn">{title}</h2>
          {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              name={person.name}
              role={person.role}
              position={person.position}
              image={person.image}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
