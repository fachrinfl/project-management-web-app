# Project Management Web App (Frontend)

A production-ready project management dashboard built with Next.js, TypeScript, shadcn/ui, and TanStack Query. The application provides authentication, project and task visibility, and rich interactions such as infinite scrolling, filtering, and modal-driven task creation.

## Live Demo

- **Frontend**: [`https://project-management-web-app-production.up.railway.app`](https://project-management-web-app-production.up.railway.app)
- **Demo Account**: `fachri@mail.com` / `password123`
- **Backend API**: [`https://ts-project-management-api-production.up.railway.app/api`](https://ts-project-management-api-production.up.railway.app/api)
- **API Docs**: [`https://ts-project-management-api-production.up.railway.app/api-docs`](https://ts-project-management-api-production.up.railway.app/api-docs)

## Features

### Core Business Features

- **Authentication Flow**: Email/password login and registration with persistent access tokens
- **Profile Overview**: Fetch the current user profile and display avatar/name in the top navigation
- **Projects Dashboard**: Status filters, search, infinite scrolling, and skeleton loading states for project discovery
- **Tasks Workspace**: Status/priority filtering, search, infinite scroll, and inline deletion with optimistic UX
- **Task Creation**: Modal experience with validation, project selection via API, and automatic assignment to the logged-in user
- **Session Persistence**: Token storage in cookies plus Zustand store hydration to keep users signed in

### Technical Features

- **Modern Stack**: Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS, shadcn/ui
- **Data Layer**: Axios client with interceptors, TanStack Query for caching and background refresh
- **State Management**: Zustand for client-side auth state, React hooks for local UI concerns
- **Performance**: Debounced searches, React memoization utilities, infinite query pagination
- **Tooling**: Vitest + Testing Library for unit tests, ESLint + Prettier for consistent code style
- **Deployment Ready**: Dockerfile and docker-compose manifest optimized for Railway deployments

## Project Structure

```
project-management-web-app/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth routes (login/register)
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Home routed to feature shell
│   └── middleware.ts                 # Route protection
├── docs/                             # Architecture & deployment docs
│   ├── project-structure.md
│   └── deployment/railway.md
├── src/
│   ├── application/
│   │   └── providers/query-provider.tsx
│   ├── features/
│   │   ├── auth/                      # Auth forms, store, queries
│   │   ├── home/                      # Home shell (tabs, layout)
│   │   ├── projects/                  # Projects list + hooks
│   │   └── tasks/                     # Tasks overview, mutations, schemas
│   ├── shared/
│   │   ├── components/ui/             # shadcn/ui components
│   │   ├── services/api-client.ts     # Axios instance w/ interceptors
│   │   └── utils/                     # Auth token utilities
│   └── tests/                         # Vitest utilities & suites
├── public/                            # Static assets
├── Dockerfile                         # Multi-stage production build
├── docker-compose.yml                 # Railway-friendly service definition
└── README.md                          # You are here
```

### Architecture Layers

- **Presentation**: App Router pages, feature components, shadcn/ui primitives
- **State Management**: Zustand (auth) + TanStack Query (server state)
- **Data Layer**: Axios client with interceptors, service abstractions
- **Validation**: Zod schemas for forms and API payloads
- **Testing**: Vitest with Testing Library helpers

## Getting Started

### Prerequisites

- Node.js 18+
- npm (recommended) or pnpm/yarn/bun
- Access to the Project Management API (`https://ts-project-management-api-production.up.railway.app`)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/fachrinfl/project-management-web-app.git
   cd project-management-web-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment files**

   ```bash
   # Development defaults
   cp .env.example .env.local

   # Minimum required variables
   echo "NEXT_PUBLIC_API_BASE_URL=https://ts-project-management-api-production.up.railway.app" >> .env.local
   echo "API_BASE_URL=https://ts-project-management-api-production.up.railway.app" >> .env.local
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Visit the app**

   - Frontend: [http://localhost:3000](http://localhost:3000)

### Backend Integration

The app expects the backend API to expose:

- `POST /api/auth/login` & `POST /api/auth/register`
- `GET /api/auth/me` for current profile
- `GET /api/projects` with pagination & filters
- `GET /api/projects/tasks/user` for personal tasks
- `POST /api/projects/{projectId}/tasks` for task creation
- `DELETE /api/projects/tasks/{taskId}` for task removal

Update the environment variables if you run the API locally.

## Usage Guide

### Authentication

1. Navigate to `/login` or `/register`
2. Submit credentials — tokens are stored in cookies + local storage via Zustand
3. Auth middleware redirects authenticated users to the home dashboard

### Projects Dashboard

1. Use the search bar to filter by project name (debounced)
2. Switch status filters (`All`, `Active`, `Completed`, `Archived`)
3. Scroll to the bottom to trigger infinite pagination (with skeleton placeholders)
4. Retry on errors with the inline “Try again” button

### Tasks Workspace

1. Use the tabs in the header to switch to “Tasks”
2. Filter by status (`All`, `To do`, `In progress`, `Done`) and priority (`All`, `Low`, `Medium`, `High`, `Critical`)
3. Click **Add task** to open the modal
4. Populate task details, select a project, and submit — the task is created against the logged-in user ID
5. Delete tasks via the card action (confirmation prompt + loading state)

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Compile production assets
npm run start        # Run Next.js in production mode
npm run lint         # ESLint checks
npm run type-check   # TypeScript project check
npm run test         # Vitest unit tests
npm run test:watch   # Watch mode
npm run test:coverage# Generate coverage
```

### Adding UI Components

The project uses shadcn/ui:

```bash
# Install new component
npx shadcn@latest add [component]
```

### Docker Workflow

```bash
docker compose build
docker compose up
```

The provided `Dockerfile` and `docker-compose.yml` can be imported directly into Railway. See [`docs/deployment/railway.md`](docs/deployment/railway.md) for details.

## Testing

- Unit tests live under `src/tests`
- Custom render helpers wrap components with the Query Provider
- Run `npm run test` or `npm run test:watch`

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

**Project Management Web App** – Delivering centralized project & task visibility with a modern Next.js stack.
