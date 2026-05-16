# Next.js Migration of IndabaX Gambia WordPress Theme

This is a modern, type-safe migration of the IndabaX Gambia event website from WordPress PHP to Next.js with React and TypeScript.

## Why This Approach?

### ✅ Developer Experience Improvements

1. **Type Safety**: Full TypeScript support catches errors at compile time
2. **Component Architecture**: Reusable React components instead of PHP includes
3. **Modern Tooling**: Hot reload, better debugging, built-in optimization
4. **Single Styling System**: Tailwind CSS instead of 8+ different CSS files
5. **Data Management**: Centralized JSON data files instead of hardcoded HTML
6. **Easy Testing**: Jest, React Testing Library, and Playwright ready
7. **Large Community**: Tons of documentation and examples

## Project Structure

```
nextjs-migration/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with Header & Footer
│   ├── page.tsx             # Main landing page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── Header.tsx           # Navigation header
│   ├── Footer.tsx           # Footer
│   ├── Hero.tsx             # Hero section
│   ├── EventDetails.tsx     # Event info cards
│   ├── WhyJoin.tsx          # Benefits section
│   ├── PersonCard.tsx       # Reusable person card
│   ├── PersonGrid.tsx       # Grid layout for people
│   ├── Schedule.tsx         # Event schedule with tabs
│   └── Sponsors.tsx         # Sponsors gallery
├── data/                    # Centralized data files
│   ├── event.ts            # Event info & benefits
│   ├── people.ts           # Speakers, organizers, volunteers
│   ├── schedule.ts         # Three-day schedule
│   └── sponsors.ts         # Sponsor information
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## Key Improvements Over PHP Version

### Performance
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Static generation where possible
- ✅ Edge caching support

### Maintainability
- ✅ Type-safe components with TypeScript
- ✅ Clear separation of concerns
- ✅ Reusable component patterns
- ✅ Centralized data management
- ✅ Easy to add/update content

### Developer Experience
- ✅ Hot module replacement (HMR)
- ✅ Built-in development server
- ✅ VS Code intellisense
- ✅ Automatic formatting (ESLint)
- ✅ Better error messages

### Styling
- ✅ Consistent Tailwind CSS (instead of multiple CSS files)
- ✅ No CSS file conflicts
- ✅ Responsive design built-in
- ✅ Easy customization via tailwind.config.js

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

### Type Check
```bash
npm run type-check
```

## Deployment Options

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Other Platforms
- Netlify
- AWS Amplify
- Docker containers
- Any Node.js hosting

## Features

### ✨ Interactive Components
- Responsive navigation with mobile menu
- Tab-based schedule selector
- Smooth scroll navigation
- Back-to-top button
- Responsive image gallery

### 🎨 Modern Design
- Tailwind CSS with custom colors
- Smooth animations and transitions
- Mobile-first responsive design
- Dark mode ready
- Accessibility features

### 📱 Mobile Optimized
- Responsive grid layouts
- Touch-friendly navigation
- Optimized images
- Fast page load times

### ♿ Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Image alt text
- High contrast colors

## Data Updating

All event data is centralized in `/data/` files. To update:

1. **Event Information**: Edit `data/event.ts`
2. **People (Speakers/Organizers)**: Edit `data/people.ts`
3. **Schedule**: Edit `data/schedule.ts`
4. **Sponsors**: Edit `data/sponsors.ts`

No need to touch component files for content changes!

## Adding Images

Place images in `/public/images/` and reference them in data files:
```typescript
image: '/images/Ousman-Bah.webp'
```

## Styling Customization

Edit `tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Animation timing
- Breakpoints

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Blog section
- [ ] Registration form validation
- [ ] Email notifications
- [ ] Analytics integration
- [ ] CMS integration (Contentful, Sanity)
- [ ] Contact form backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

Same as original WordPress theme

## Credits

- Original WordPress theme: Indaba-WordPress-Theme
- Migrated to Next.js for improved maintainability and DX
