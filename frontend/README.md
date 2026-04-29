# Student Note Books — Frontend

This is the React frontend for the Student Note Books e-commerce application, built with Vite for fast development and production builds.

## Tech Stack
- **React 19** — UI library
- **Vite** — Build tool and dev server
- **React Router** — Client-side navigation
- **Axios** — HTTP requests to the backend API
- **React Hot Toast** — User notifications
- **Lucide React** — Icons

## Getting Started

```bash
npm install
```

Create a `.env` file in this folder:
```
VITE_API_BASE_URL=http://localhost:5000
```

Start the dev server:
```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

The production build is output to the `dist/` folder. In production (AWS), this is served using the `serve` package on port 80.
