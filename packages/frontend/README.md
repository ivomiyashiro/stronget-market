# Stronget Market Frontend

This is the frontend application for Stronget Market, built with React, TypeScript, and Vite.

## Getting Started

### Prerequisites

-   Node (v16+)
-   pnpm (v7+)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The development server will start at http://localhost:3000 with proxy configured to the backend.

## Project Structure

```
src/
├── components/     # UI components
├── lib/            # Utilities and helpers
├── services/       # API services
│   ├── base.service.ts   # Base API service with fetch utilities
│   ├── test.service.ts   # Example service implementation
│   └── index.ts          # Service exports
├── styles/         # Global styles
├── main.tsx        # Application entry point
└── router.tsx      # Application routing
```

## Services

The application uses a service-based architecture for API communication:

### BaseService

The `BaseService` provides a wrapper around the Fetch API with:

-   Type-safe responses with TypeScript generics
-   Methods for all common HTTP verbs (GET, POST, PUT, PATCH, DELETE)
-   Error handling with custom ApiError class
-   Query parameter support
-   Automatic JSON parsing

```typescript
// Example usage
import { baseService } from "./services";

// GET request
const data = await baseService.get<ResponseType>("/endpoint");

// POST with body
const result = await baseService.post<ResponseType>("/endpoint", {
    key: "value",
});

// GET with query parameters
const searchResults = await baseService.get<SearchResults>("/search", {
    query: "term",
});
```
