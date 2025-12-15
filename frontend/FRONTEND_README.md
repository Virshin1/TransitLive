# TransitLive Frontend - Modern UI

A beautifully designed, minimalistic real-time transit tracking application built with React, Tailwind CSS, Material-UI, and shadcn/ui components.

## 🎨 Design Features

- **Clean & Minimalistic**: Simple, intuitive interface focusing on essential information
- **Modern UI Components**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Updates**: WebSocket integration for live transit data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessible**: WCAG compliant with screen reader support

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI (MUI)** - React component library
- **shadcn/ui** - Re-usable components built with Radix UI and Tailwind
- **Lucide React** - Beautiful icon set
- **Socket.IO Client** - Real-time bidirectional communication
- **React Router** - Client-side routing

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   │   ├── badge.jsx    # Badge component for tags/status
│   │   ├── button.jsx   # Button with variants
│   │   └── card.jsx     # Card layout components
│   ├── AlertTicker.jsx  # Scrolling alert banner
│   ├── ConnectionStatus.jsx  # WebSocket status indicator
│   ├── Header.jsx       # Navigation header
│   ├── RouteList.jsx    # Grid of transit routes
│   └── StopBoard.jsx    # Real-time arrival predictions
├── pages/               # Page components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── StopDetails.jsx  # Individual stop view
│   └── Alerts.jsx       # Service alerts page
├── services/            # API & WebSocket services
│   ├── api.jsx          # REST API calls
│   └── socket.jsx       # WebSocket management
├── lib/                 # Utility functions
│   └── utils.js         # Helper functions (cn for class merging)
├── App.jsx              # Main app component with routing
└── index.css            # Global styles with Tailwind

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 5001

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🎯 Key Components

### Header
Clean navigation bar with logo and page links. Active route is highlighted.

### Dashboard
- **Route List**: Grid view of all transit routes with color coding
- **Stop Search**: Quick search functionality to find stops
- **Alert Ticker**: Scrolling banner for active service alerts

### Stop Details
- Real-time arrival predictions
- Color-coded time badges (red < 2min, amber < 5min, default > 5min)
- Route information with headsigns

### Alerts Page
- Filterable alerts (All, Active, Resolved)
- Severity indicators (Critical, Warning, Info)
- Affected routes display
- Real-time updates via WebSocket

### Connection Status
Floating badge in bottom-right showing WebSocket connection status.

## 🎨 Design System

### Colors

The app uses a consistent color scheme defined in Tailwind config:

- **Primary**: Dark slate for headers and accents
- **Success**: Green for active/connected states
- **Warning**: Amber for warnings and approaching arrivals
- **Error**: Red for critical alerts and arriving vehicles
- **Muted**: Gray tones for secondary information

### Typography

- Font stack: System fonts for optimal performance
- Hierarchical sizing: 3xl → xl → base → sm → xs
- Semantic usage: Bold for emphasis, medium for labels

### Spacing

Consistent spacing scale using Tailwind's spacing system (4px base unit).

## 🔧 Configuration

### Tailwind Config
Customized theme in `tailwind.config.js` with:
- Extended color palette
- Custom border radius
- Design tokens for consistency

### PostCSS
Configured in `postcss.config.js` for:
- Tailwind CSS processing
- Autoprefixer for browser compatibility

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Components adapt gracefully:
- Mobile: Single column layout
- Tablet: 2-column grid for routes
- Desktop: 3-4 column grid for routes

## 🧩 Component API

### RouteList
```jsx
<RouteList 
  routes={routesArray}
  onRouteClick={(route) => handleClick(route)}
/>
```

### StopBoard
```jsx
<StopBoard 
  stopId="123"
  stopName="Main St & 1st Ave"
/>
```

### Badge
```jsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Critical</Badge>
<Badge variant="warning">Warning</Badge>
```

### Button
```jsx
<Button variant="default">Click me</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle</Button>
```

## 🔌 Real-time Features

The app uses Socket.IO for real-time updates:

1. **Arrival Predictions**: Subscribe to specific stops
2. **Service Alerts**: Global alerts pushed to all clients
3. **Connection Status**: Visual indicator of WebSocket state

### WebSocket Events

- `connect` - Connection established
- `disconnect` - Connection lost
- `arrival_updates` - Real-time arrival data
- `service_alerts` - New/updated alerts

## 🎓 Code Comments

The codebase is designed for React beginners:

- **Descriptive comments** explaining component purpose
- **Inline explanations** for complex logic
- **Function documentation** with parameter descriptions
- **Hook usage examples** showing useState, useEffect, useCallback

### Example:
```jsx
// Load stop data and set up real-time updates
const loadStopData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await apiService.getStop(id);
    setStop(response.data);
  } catch (err) {
    console.error('Error loading stop:', err);
  } finally {
    setLoading(false);
  }
}, [id]); // Dependency array: re-run when 'id' changes
```

## 🐛 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## 📦 Dependencies

### Core
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.1

### UI Libraries
- @mui/material: Latest
- @mui/icons-material: Latest
- @emotion/react: Latest
- @emotion/styled: Latest
- lucide-react: Latest

### Styling
- tailwindcss: ^3.4.1
- autoprefixer: Latest
- postcss: Latest

### Utilities
- class-variance-authority: Latest
- clsx: Latest
- tailwind-merge: Latest

### Communication
- axios: ^1.6.2
- socket.io-client: ^4.6.1

## 🤝 Contributing

The code is structured to be beginner-friendly:

1. **Read the comments** - They explain the "why" not just the "what"
2. **Follow patterns** - Similar components use similar structures
3. **Use TypeScript** (optional) - For better type safety
4. **Test your changes** - Ensure real-time features work

## 📝 License

This project is part of the TransitLive application.

## 🌟 Key Features Summary

✅ Real-time transit tracking
✅ Service alerts with filtering
✅ Stop search functionality
✅ Responsive mobile-first design
✅ WebSocket connection monitoring
✅ Accessible UI components
✅ Color-coded status indicators
✅ Clean, minimalistic interface
✅ Beginner-friendly codebase
✅ Modern React patterns (Hooks)

---

**Happy Coding! 🚀**
