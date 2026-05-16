'use client'

import { upcomingEvents } from '@/data/events'
import { Calendar, MapPin, Clock } from 'lucide-react'

const categoryColors: Record<string, string> = {
  Workshop: 'bg-blue-100 text-blue-800',
  Webinar: 'bg-purple-100 text-purple-800',
  Networking: 'bg-green-100 text-green-800',
  Conference: 'bg-red-100 text-red-800',
  Mentorship: 'bg-yellow-100 text-yellow-800',
  Collaboration: 'bg-indigo-100 text-indigo-800',
}

export default function UpcomingEvents() {
  return (
    <section id="events" className="py-16 bg-light">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-dark mb-4 text-center animate-slideIn">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
            Join us for workshops, webinars, and networking opportunities. Be part of the AI-GAMNET community and stay updated with the latest in AI and machine learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden animate-fadeIn"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      categoryColors[event.category] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-dark mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{event.location}</span>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold">
                  <a
                    href={event.registration}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
                    >
                    Register Now
                </a>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
