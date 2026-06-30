/**
 * Seed program events (webinars, IndabaX). Idempotent — upserts by slug.
 * Run: npm run seed:events
 */
const fs = require('fs');
const dotenv = require('dotenv');
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });
dotenv.config();

const mongoose = require('mongoose');
const ProgramEvent = require('../models/ProgramEvent');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aigamnet';

const events = [
  {
    type: 'webinar',
    title: 'Building Automated AI Chatbots for Businesses and Government Agencies',
    slug: 'ai-chatbots-businesses-government-webinar',
    theme: 'Smarter customer service starts here, live demo included',
    summary:
      'Learn how to deploy AI-powered chatbots for your business or agency, handle customer enquiries 24/7, and watch a live build demo. Free and open to all.',
    coverImage: '/images/home/online-webinar.jpg',
    location: 'Online',
    venue: 'Zoom',
    startDate: new Date('2026-07-04'),
    endDate: new Date('2026-07-04'),
    timeInfo: '11:00 – 12:00 GMT',
    year: 2026,
    published: true,
    featured: true,
    registrationOpen: true,
    description: {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: 'Customer care is the frontline of every business and government service, yet most organisations in The Gambia are still handling enquiries manually, one call or message at a time. This webinar changes that.',
          },
        },
        {
          type: 'paragraph',
          data: {
            text: 'Organised by Gamainet.org, this session introduces business owners, customer service managers, and government agency staff to the practical world of AI chatbots: what they are, how they work, and how they can be deployed to handle customer enquiries, appointment bookings, product questions, complaint logging, and more, around the clock and without extra staffing costs.',
          },
        },
        {
          type: 'paragraph',
          data: {
            text: 'We cover the core concepts in plain language, walk through real-world use cases relevant to Gambian businesses and public services, and close with a live demo showing exactly how an AI chatbot can be built and launched for your organisation.',
          },
        },
        { type: 'header', data: { text: 'What you will learn', level: 2 } },
        {
          type: 'list',
          data: {
            style: 'unordered',
            items: [
              'What AI chatbots are and how they differ from traditional automated replies',
              'How businesses and government agencies across Africa are already using them to cut response times and improve service',
              'Which platforms and tools make deployment accessible without technical expertise',
              'How to plan a chatbot for your specific use case',
              'What to expect in terms of costs and timelines',
            ],
          },
        },
        {
          type: 'paragraph',
          data: {
            text: 'Whether you run a shop, a financial service, a hospital, a school, or a government office, this session will show you what is possible and how to get started.',
          },
        },
        {
          type: 'paragraph',
          data: {
            text: 'Free and open to all. Delivered in English and designed for participants with no prior technical background.',
          },
        },
      ],
    },
    speakers: [
      {
        name: 'AI-GAMNET Team',
        role: 'Presenter',
        org: 'Gamainet.org',
        topic: 'Building Automated AI Chatbots — live demo',
        photo: '/images/home/african-researcher.jpg',
        bio: 'Practical AI for businesses and public services in The Gambia.',
      },
    ],
    agenda: [],
  },
  {
    type: 'indabax',
    title: 'Deep Learning IndabaX Gambia 2025',
    slug: 'indabax-gambia-2025',
    theme: 'AI in Education',
    summary:
      'Our flagship three-day machine learning and AI conference, bringing together researchers, professionals, and students at the University of The Gambia.',
    coverImage: '/images/home/feature-conference.jpg',
    location: 'Kanifing, The Gambia',
    venue: 'University of The Gambia, Peace Building',
    startDate: new Date('2025-12-11'),
    endDate: new Date('2025-12-13'),
    timeInfo: '08:30 – 17:00',
    year: 2025,
    published: true,
    featured: true,
    registrationOpen: true,
    description: {
      blocks: [
        { type: 'header', data: { text: 'About the conference', level: 2 } },
        {
          type: 'paragraph',
          data: {
            text: 'A Deep Learning IndabaX is a locally-organised, typically three-day Indaba that helps spread knowledge and build capacity in machine learning. IndabaX aims to build a sustainable pan-African community of AI expertise and create local leadership in AI across the continent.',
          },
        },
        {
          type: 'paragraph',
          data: {
            text: 'The 2025 edition focuses on the application of artificial intelligence in education, featuring keynotes, tutorials, hands-on labs, and a poster session.',
          },
        },
      ],
    },
    speakers: [
      { name: 'Dr. Dina Machuve', role: 'Co-founder & CTO', org: 'DevData Analytics, Tanzania', topic: '' },
      { name: 'Dr. Ernest Mwebaze', role: 'Strategy Lead', org: 'Sunbird AI, Uganda', topic: '' },
      { name: 'Prof. Moustapha Cisse', role: 'Research Scientist in AI', org: '', topic: '' },
      { name: 'Dr. Bubacarr Bah', role: 'Researcher', org: '', topic: 'Introduction to Deep Learning and Data Science' },
      { name: 'Mr. Ousman Bah', role: 'Minister', org: 'Ministry of Communications and Digital Economy', topic: '' },
    ],
    agenda: [
      {
        label: 'Day 1',
        date: '11 December 2025',
        sessions: [
          { time: '10:30 – 10:40', title: 'Welcome remarks', speaker: 'Dean of ICT' },
          { time: '10:40 – 11:10', title: 'Keynote', speaker: 'Dr. Dina Machuve' },
          { time: '11:10 – 11:30', title: 'Coffee & snacks break', speaker: '' },
          { time: '11:30 – 12:00', title: 'Keynote', speaker: 'Dr. Ernest Mwebaze' },
          { time: '12:00 – 12:30', title: 'Poster session presentation', speaker: '' },
          { time: '12:30 – 13:00', title: 'Talk', speaker: 'Prof. Moustapha Cisse' },
          { time: '13:00 – 13:30', title: 'Address', speaker: 'Mr. Ousman Bah (Minister)' },
          { time: '13:30 – 14:00', title: 'Lunch break', speaker: '' },
          { time: '14:00 – 14:30', title: 'Launch of Gambia AI Network (GAIN)', speaker: '' },
          { time: '14:30 – 16:00', title: 'Introduction to Deep Learning and Data Science', speaker: 'Dr. Bubacarr Bah' },
        ],
      },
      { label: 'Day 2', date: '12 December 2025', sessions: [] },
      { label: 'Day 3', date: '13 December 2025', sessions: [] },
    ],
  },
  {
    type: 'indabax',
    title: 'Deep Learning IndabaX Gambia 2024',
    slug: 'indabax-gambia-2024',
    theme: 'Strengthening African AI',
    summary: 'The 2024 edition of IndabaX Gambia, hosted at the University of The Gambia.',
    coverImage: '/images/home/african-workshop.jpg',
    location: 'Kanifing, The Gambia',
    venue: 'University of The Gambia',
    startDate: new Date('2024-12-01'),
    year: 2024,
    published: true,
    registrationOpen: false,
    description: {
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'IndabaX Gambia 2024 brought together the local machine learning community for talks, tutorials, and networking at the University of The Gambia.' },
        },
      ],
    },
  },
  {
    type: 'indabax',
    title: 'Deep Learning IndabaX Gambia 2023',
    slug: 'indabax-gambia-2023',
    theme: 'Building the community',
    summary: 'The first IndabaX Gambia — where it all began.',
    coverImage: '/images/home/african-collaboration.jpg',
    location: 'The Gambia',
    venue: 'University of The Gambia',
    startDate: new Date('2023-12-01'),
    year: 2023,
    published: true,
    registrationOpen: false,
    description: {
      blocks: [
        { type: 'paragraph', data: { text: 'Our founding IndabaX Gambia in 2023 launched a sustainable, locally-led machine learning community in The Gambia.' } },
      ],
    },
  },
];

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  for (const ev of events) {
    await ProgramEvent.findOneAndUpdate({ slug: ev.slug }, ev, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log('Seeded:', ev.slug);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
