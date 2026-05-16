'use client'

import { executives } from '@/data/people'
import PersonGrid from './PersonGrid'



export default function Executives() {
  return (
    <section id="executives" className="py-16 bg-light">
      <PersonGrid
        title="Executives"
        subtitle="Meet our leadership team driving AI innovation in The Gambia"
        people={executives}
      />
    </section>
  )
}