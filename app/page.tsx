import Hero from '@/components/Hero'
import EventDetails from '@/components/EventDetails'
import WhyJoin from '@/components/WhyJoin'
import PersonGrid from '@/components/PersonGrid'
import UpcomingEvents from '@/components/UpcomingEvents'
import Sponsors from '@/components/Sponsors'
import { speakers, executives, volunteers } from '@/data/people'
import { eventInfo } from '@/data/about'
import Executives from '@/components/Executives'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Event Details */}
      <section id="event" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-dark mb-4 text-center animate-slideIn">
              About <span className="text-primary">AI-GAMNET</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
              {eventInfo.description}
            </p>
          </div>
          <EventDetails />
        </div>
      </section>

      {/* Why Join */}
      <WhyJoin />

      {/* Featured Thought Leaders */}
      <PersonGrid
        title="Featured Thought Leaders"
        subtitle="Meet the researchers, professionals, and innovators driving AI innovation and excellence in Africa."
        people={speakers}
      />

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Executives */}
      <Executives />

      {/* Volunteers */}
      <PersonGrid title="Volunteer Members" people={volunteers} />

      {/* Sponsors */}
      <Sponsors />
    </main>
  )
}
