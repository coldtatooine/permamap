# 🌱 Permamap: Your Permaculture Adventure Awaits! 🗺️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

Welcome to **Permamap**, the ultimate web app for designing and visualizing permaculture zones (0-5) on an interactive map! Whether you're a seasoned permaculture enthusiast or just starting your sustainable journey, Permamap helps you map out your eco-friendly dreams with ease. Think of it as Google Maps, but for growing food forests and building resilient communities. 🌿🏡

## 🚀 Features

- **Interactive Zoning**: Draw and manage permaculture zones (0-5) right on the map. No more scribbling on napkins!
- **Element Tracking**: Add points of interest (POIs) like fruit trees, compost heaps, or chicken coops to your zones.
- **Real-time Collaboration**: Powered by Supabase for seamless data syncing across devices.
- **Mobile-Friendly**: Responsive design that works on your phone, tablet, or desktop. Plan your permaculture paradise on the go!
- **Permamap University**: Learn permaculture through curated courses and resources. Knowledge is power... and compost!
- **User Authentication**: Secure login to keep your maps private or share them with the community.
- **Drawing Tools**: Easy-to-use Leaflet-based drawing tools for precise zone creation.

## 🛠️ Tech Stack

- **Package Manager**: pnpm 11 (workspace)
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4
- **Map**: Leaflet.js with react-leaflet and leaflet-draw
- **Backend**: Supabase (PostgreSQL + PostGIS)
- **Animation**: Framer Motion
- **Testing**: Vitest, Testing Library, Playwright
- **UI Components**: Custom design system in `@permamap/ui`

## 📦 Installation

Ready to dive in? Follow these steps to get Permamap running locally:

### Prerequisites
- Node.js (v20 or higher)
- [pnpm](https://pnpm.io) 10+ (`corepack enable`)
- Supabase account (for the backend)

### Setup
1. **Clone the repo**:
   ```bash
   git clone https://github.com/yourusername/permamap.git
   cd permamap
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up Supabase**:
   - Create a new project on [Supabase](https://supabase.com)
   - Run migrations:
     ```bash
     pnpm exec supabase db push
     ```
   - Configure your environment variables (check `.env.example`)

4. **Start the development server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:5173](http://localhost:5173) and start mapping!

### Building for Production
```bash
pnpm build
pnpm preview
```

## 🎮 Usage

1. **Sign Up/Login**: Create an account to save your maps.
2. **Create a Property**: Start with your land or garden space.
3. **Draw Zones**: Use the drawing tools to define your permaculture zones.
4. **Add Elements**: Drop in POIs and watch your sustainable system come to life.
5. **Explore University**: Browse courses and learn from experts.
6. **Share & Collaborate**: Invite friends to view or edit your maps.

Pro tip: Zone 0 is your home base – keep it tidy! 🏠

## 🤝 Contributing

Permamap is open source and we love contributions! Whether it's bug fixes, new features, or just better documentation, here's how to get involved:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-idea`
3. Make your changes and add tests
4. Run the tests: `pnpm --filter frontend exec vitest run`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-idea`
7. Open a Pull Request

Check out our [Contributing Guide](CONTRIBUTING.md) for more details. Let's grow this project together! 🌱

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by permaculture principles and the amazing open-source community
- Built with love for sustainable living
- Special thanks to the Leaflet and Supabase teams for their awesome tools

---

Happy mapping! If you have questions or ideas, open an issue or join the discussion. Let's make the world a greener place, one zone at a time. 🌍💚
