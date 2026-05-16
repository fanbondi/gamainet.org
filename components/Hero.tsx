'use client'

import { eventInfo } from '@/data/about'

export default function Hero() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-dark to-gray-800 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-18 items-center">
          <div className="animate-slideIn">
            <h1 className="text-6xl lg:text-6xl font-extrabold mb-4 leading-tight text-center">
              {eventInfo.title.split(' ').map((word, index) => (
                <span key={index}>
                  {word === '(AI' + '-GAMNET)' ? (
                    <>
                      (<span className="text-primary">AI</span>-GAMNET)
                    </>
                  ) : (
                    word
                  )}
                  {index < eventInfo.title.split(' ').length - 1 && ' '}
                </span>
              ))}
            </h1>

            <p className="text-xl text-center text-gray-300 mb-6 font-semibold">
              Theme: {eventInfo.subtitle}
            </p>

            <p className="text-lg text-center text-gray-400 mb-8">
              {eventInfo.location}
              <br />
              {eventInfo.dateRange}
            </p>

            <div className="flex justify-center">
              <a
                href={eventInfo.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-bold text-lg transform hover:scale-105"
              >
                🎫 Join The Network
              </a>
            </div>
          </div>

          {/* <div className="relative h-96 animate-fadeIn">
            <div className="absolute inset-0 bg-primary opacity-20 rounded-lg blur-3xl" />
            <div className="relative bg-white bg-opacity-10 backdrop-blur rounded-lg p-8 text-center">
              <div className="text-6xl font-bold text-primary mb-4">
                {eventInfo.stats.speakers}
              </div>
              <p className="text-xl mb-8">Tech Icons and Professionals</p>

              <div className="border-t border-white border-opacity-30 pt-8 mt-8">
                <div className="text-4xl font-bold text-primary mb-2">
                  {eventInfo.stats.participants}
                </div>
                <p className="text-lg">Expected Participants</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
