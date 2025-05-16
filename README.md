# Stronger Market

A monorepo containing a React frontend and Node.js Express backend.

## Project Structure

```
stronger-market/
├── packages/
│   ├── frontend/     # React application
│   └── backend/      # Express API server
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v7 or higher)

### Installation

```bash
pnpm install
```

### Development

Run both frontend and backend in development mode:

```bash
pnpm run dev
```

Or run them separately:

```bash
pnpm run dev:frontend
pnpm run dev:backend
```

### Production

Build both packages:

```bash
pnpm run build
```

Start in production mode:

```bash
pnpm start
``` 