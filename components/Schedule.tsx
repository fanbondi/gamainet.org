'use client'

import { useState } from 'react'
import { schedule } from '@/data/schedule'

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2' | 'day3'>('day1')

  const days = [
    { key: 'day1', label: 'Day 1 - 25/07/2023' },
    { key: 'day2', label: 'Day 2 - 26/07/2023' },
    { key: 'day3', label: 'Day 3 - 27/07/2023' },
  ] as const

  const currentDay = schedule[activeDay]

  return (
    <section id="schedule" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-dark mb-12 text-center animate-slideIn">Schedule</h2>

        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {days.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveDay(key)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                activeDay === key
                  ? 'bg-primary text-white'
                  : 'bg-white text-dark border-2 border-primary hover:bg-light'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary text-white p-6">
            <h3 className="text-2xl font-bold mb-2">{currentDay.title}</h3>
            <p className="text-sm opacity-90">{currentDay.date}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-dark">Time</th>
                  <th className="px-6 py-4 text-left font-bold text-dark">Speaker</th>
                  <th className="px-6 py-4 text-left font-bold text-dark">Activity</th>
                </tr>
              </thead>
              <tbody>
                {currentDay.sessions.map((session, index) => (
                  <tr
                    key={index}
                    className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-light'}`}
                  >
                    <td className="px-6 py-4 font-semibold text-dark">{session.time}</td>
                    <td className="px-6 py-4 text-gray-600">{session.speaker}</td>
                    <td className="px-6 py-4 text-gray-600">{session.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
