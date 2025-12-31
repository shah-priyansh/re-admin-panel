# Admin Panel V2

A modern, standardized admin panel built with React, Vite, Tailwind CSS, and Redux Toolkit.

## Features

- ✅ **Modern Stack**: React 19 + Vite 7
- ✅ **State Management**: Redux Toolkit
- ✅ **Styling**: Tailwind CSS with custom design system
- ✅ **Routing**: React Router with protected routes
- ✅ **Authentication**: Complete login/logout flow
- ✅ **Responsive Design**: Mobile-first, fully responsive
- ✅ **Standardized UI**: Consistent design patterns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main layout with sidebar
│   └── ProtectedRoute.jsx  # Auth guard component
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   └── Dashboard.jsx   # Dashboard page
├── store/              # Redux store
│   ├── store.js        # Store configuration
│   └── slices/         # Redux slices
│       └── authSlice.js  # Authentication slice
├── services/           # API services
│   └── api.js         # Axios configuration
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## Default Login Credentials

- **Email**: `admin@gmail.com`
- **Password**: `Admin@123456`
- **Type**: `super`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Heroicons** - Icon library

## Features Overview

### Authentication
- Login with email/password
- Protected routes
- Token-based authentication
- Auto-logout on 401 errors

### Dashboard
- Statistics cards
- Recent activities
- Quick actions
- Responsive grid layout

### Layout
- Collapsible sidebar
- Mobile-responsive menu
- User profile section
- Navigation menu

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme.

### API Configuration
Update `src/services/api.js` to modify API settings.

### Routes
Add new routes in `src/App.jsx`.

## License

MIT
