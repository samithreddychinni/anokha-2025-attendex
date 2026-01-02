# Anokha 2025 Attendex

A **mobile-first web application** for **Anokha 2025** - an Organizer Portal used during live events to mark participant attendance via QR scanning or manual override.

---

## 📋 Overview

This application enables event organizers at the Anokha technical fest to:

- Log in with organizer credentials
- View assigned events and sessions
- Mark attendance via QR code scanning or manual entry
- View real-time attendance status
- Preview registered participants

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Package Manager** | Bun |
| **Routing** | TanStack Router |
| **Data Fetching** | TanStack Query |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui |
| **HTTP Client** | Axios |
| **Linting/Formatting** | Biome |
| **Testing** | Vitest |
| **Language** | TypeScript |

---

## 📁 Project Structure

```
anokha-2025-attendex/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   ├── logo192.png
│   ├── logo512.png
│   ├── loading.gif
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui primitives
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   ├── AuthGuard.tsx        # Protected route wrapper
│   │   ├── Header.tsx           # App header with navigation
│   │   ├── Loader.tsx           # Loading spinner
│   │   ├── Login.tsx            # Login form component
│   │   ├── ScheduleCard.tsx     # Event schedule display
│   │   ├── mode-toggle.tsx      # Dark/light mode toggle
│   │   └── theme-provider.tsx   # Theme context provider
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication state management
│   ├── integrations/
│   │   └── tanstack-query/      # TanStack Query setup
│   │       ├── devtools.tsx
│   │       └── root-provider.tsx
│   ├── lib/
│   │   ├── api.ts               # Axios instance configuration
│   │   └── utils.ts             # Utility functions
│   ├── routes/                  # TanStack Router file-based routes
│   │   ├── __root.tsx           # Root layout
│   │   ├── index.tsx            # Home page (redirects)
│   │   ├── login.tsx            # Login page
│   │   ├── dashboard.tsx        # Organizer dashboard
│   │   ├── demo/                # Demo routes (can be deleted)
│   │   └── events/
│   │       ├── index.tsx        # Events listing
│   │       └── $eventId/
│   │           └── schedules/
│   │               ├── index.tsx          # Session selection
│   │               └── $scheduleId/
│   │                   ├── attendance.tsx # QR scanner & attendance marking
│   │                   └── preview.tsx    # Read-only participant view
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── main.tsx                 # App entry point
│   ├── styles.css               # Global styles
│   └── routeTree.gen.ts         # Auto-generated route tree
├── .vscode/                     # VS Code settings
├── biome.json                   # Biome configuration
├── components.json              # shadcn/ui configuration
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── API_DOCUMENTATION.md         # Backend API reference
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Backend API running on `localhost:8080` (or configure proxy in `vite.config.ts`)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd anokha-2025-attendex

# Install dependencies
bun install
```

### Running the Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
bun run build
```

Built files will be output to the `dist/` directory.

### Preview Production Build

```bash
bun run preview
```

---

## 🧪 Testing

This project is configured with [Vitest](https://vitest.dev/) for testing.

> **Note:** No tests have been written yet. Test files should be created with the pattern `*.test.ts` or `*.spec.ts`.

```bash
# Run tests
bun run test
```

---

## 🎨 Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components:

```bash
bun dlx shadcn@latest add <component-name>
```

Examples:
```bash
bun dlx shadcn@latest add button
bun dlx shadcn@latest add dialog
bun dlx shadcn@latest add toast
```

---

## 🔧 Configuration

### API Proxy

The development server proxies API requests to `http://localhost:8080`. To change this, update `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url',
      changeOrigin: true,
    },
  },
},
```

### Path Aliases

The project uses `@/` as an alias for the `src/` directory. This is configured in both `vite.config.ts` and `tsconfig.json`.

---

## 📱 Features

### Authentication
- Session-based organizer login
- Protected routes via `AuthGuard` component
- Automatic session verification on app load

### Event Management
- Dashboard displaying assigned events
- Multi-session support for events
- Schedule cards with status indicators (ongoing/upcoming/completed)

### Attendance Marking
- **QR Code Scanning**: Primary method using device camera
- **Manual Override**: Fallback for QR failures
- Real-time attendance status updates

### Preview Mode
- Read-only view of registered participants
- View attendance status without modification

---

## 🌐 Environment

This app expects a backend API running at `/api/v1` with the following endpoints (see `API_DOCUMENTATION.md` for details):

- `POST /auth/organizer/login` - Organizer login
- `GET /auth/organizer/session` - Session verification
- `GET /auth/organizer/logout` - Logout
- `GET /organizers/dashboard` - Assigned events
- `GET /organizers/dashboard/:eventId` - Event participants
- `POST /attendance/mark/event` - Mark attendance (check-in/check-out)

---

## 📄 License

Private - For Anokha 2025 Use Only

---

## 🤝 Contributing

This is an internal project for Anokha 2025. Please contact the development team for contribution guidelines.
