'use client'

import { Target, Calendar, Zap, Users } from 'lucide-react'

const eventDetails = [
  {
    icon: Target,
    title: 'Mission',
    content: 'Building a sustainable pan-African community of AI expertise',
  },
  {
    icon: Calendar,
    title: 'Founded',
    content: '2023 - Connecting researchers, professionals, and innovators',
  },
  {
    icon: Zap,
    title: 'Focus Areas',
    content: 'AI, Machine Learning, Deep Learning, Data Science',
  },
  {
    icon: Users,
    title: 'Members',
    content: 'Growing community of researchers and professionals',
  },
]

export default function EventDetails() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {eventDetails.map((detail, index) => {
        const Icon = detail.icon
        return (
          <div
            key={index}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <Icon className="w-8 h-8 text-primary mb-4" />
            <h4 className="text-lg font-bold mb-2">{detail.title}</h4>
            <p className="text-gray-600">{detail.content}</p>
          </div>
        )
      })}
    </div>
  )
}
