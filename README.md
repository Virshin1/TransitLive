# TransitLive 

A real-time public transportation status dashboard featuring live vehicle tracking, service alerts, and admin management capabilities. Built with React, Node.js, Express, MongoDB, and Socket.IO.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## Features

### Public Features
- **Real-time Vehicle Tracking**: Live updates of bus/train positions and arrival predictions
- **Stop Information**: Detailed stop schedules with real-time arrival times
- **Route Overview**: Browse all available routes with current status
- **Service Alerts**: Live ticker and dedicated alerts page for service disruptions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Features
- **Alert Management**: Create, update, and delete service alerts
- **Route Monitoring**: View all routes and their current operational status
- **Dashboard Analytics**: Overview of system status and critical alerts
- **JWT Authentication**: Secure admin access with token-based authentication

### Technical Features
- **WebSocket Communication**: Real-time updates via Socket.IO
- **GTFS-RT Simulation**: Simulates real transit data following GTFS-Realtime specifications
- **RESTful API**: Comprehensive API for all transit data operations
- **MongoDB Database**: Persistent storage for routes, stops, alerts, and users

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - WebSocket client for real-time updates
- **Lucide React** - Icon library
- **Tailwind CSS** - Tailwind CSS

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v4.4 or higher)
- **Git**

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TransitLive
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/transitlive
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@transitlive.com
ADMIN_PASSWORD=admin123
EOF

# Seed the database with sample data
npm run seed
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional, defaults are configured)
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
EOF
```

## Running the Application

### Using the Convenience Scripts (Recommended)

From the root directory:

```bash
# Start both frontend and backend
./start.sh

# Stop all services
./stop.sh

# Verify services are running
./verify.sh
```

### Manual Start

#### Start Backend
```bash
cd backend
npm start
# Backend runs on http://localhost:5001
```

#### Start Frontend
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

## 📁 Project Structure

```
TransitLive/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── Alert.js             # Alert schema
│   │   ├── Route.js             # Route schema
│   │   ├── Stop.js              # Stop schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── alerts.js            # Alert endpoints
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── routes.js            # Route endpoints
│   │   └── stops.js             # Stop endpoints
│   ├── scripts/
│   │   └── seed.js              # Database seeder
│   ├── services/
│   │   └── gtfsSimulator.js     # GTFS-RT simulator
│   ├── websocket/
│   │   └── socket.js            # Socket.IO configuration
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertTicker.js   # Scrolling alert banner
│   │   │   ├── ConnectionStatus.js
│   │   │   ├── Header.js
│   │   │   ├── RouteList.js
│   │   │   └── StopBoard.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx    # Admin overview
│   │   │   │   ├── Login.jsx        # Admin login
│   │   │   │   ├── AlertList.jsx    # Alert management
│   │   │   │   └── AlertManagement.jsx
│   │   │   ├── Alerts.js           # Public alerts page
│   │   │   ├── Dashboard.js        # Main dashboard
│   │   │   ├── RouteDetails.js     # Route details page
│   │   │   └── StopDetails.js      # Stop details page
│   │   ├── services/
│   │   │   ├── api.jsx             # Axios API client
│   │   │   └── socket.jsx          # Socket.IO client
│   │   ├── App.js                  # Main app component
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   ├── package.json
│   └── .env
└── README.md
```

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication
Admin endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Routes
- `GET /routes` - Get all active routes
- `GET /routes/:id` - Get route details by ID
- `GET /routes/:id/vehicle-position` - Get current vehicle position for route
- `GET /routes/type/:type` - Get routes by type (bus, metro, tram, train)

#### Stops
- `GET /stops` - Get all stops
- `GET /stops/:id` - Get stop details by ID
- `GET /stops/:id/predictions` - Get real-time arrival predictions for stop
- `GET /stops/nearby/:lat/:lng?distance=1000` - Get nearby stops

#### Alerts
- `GET /alerts` - Get all alerts (query params: active, severity, type)
- `GET /alerts?active=true` - Get only active alerts
- `GET /alerts/:id` - Get alert details by ID
- `POST /alerts` - Create new alert (admin only) 
- `PUT /alerts/:id` - Update alert (admin only) 
- `DELETE /alerts/:id` - Delete alert (admin only) 

#### Authentication
- `POST /auth/login` - Admin login (returns JWT token)
- `GET /auth/me` - Get current user info (requires JWT) 

### Example API Calls

```bash
# Get all routes
curl http://localhost:5001/api/routes

# Get stop predictions
curl http://localhost:5001/api/stops/STOP001/predictions

# Admin login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transitlive.com","password":"admin123"}'

# Create alert (with JWT token)
curl -X POST http://localhost:5001/api/alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Route 1 Delay",
    "description": "Expect 10-15 minute delays",
    "severity": "warning",
    "alertType": "delay",
    "affectedRoutes": ["route_id_here"]
  }'
```

## WebSocket Events

### Client → Server
- `subscribe_stop` - Subscribe to stop updates
- `unsubscribe_stop` - Unsubscribe from stop updates

### Server → Client
- `arrival_updates` - Real-time arrival predictions
- `service_alerts` - New or updated service alerts
- `stop_arrival_update` - Updates for subscribed stops

### Example WebSocket Usage

```javascript
import socketService from './services/socket';

// Subscribe to stop updates
socketService.subscribeToStop('STOP001');

// Listen for arrival updates
socketService.on('stop_arrival_update', (data) => {
  console.log('New arrivals:', data);
});

// Unsubscribe when done
socketService.unsubscribeFromStop('STOP001');
```

## Admin Access

Default admin credentials (change these in production):
- **Email**: admin@transitlive.com
- **Password**: admin123

Access the admin panel at: `http://localhost:3000/admin/login`

## Development

### Database Seeding
```bash
cd backend
npm run seed
```

This will populate the database with:
- 6 sample routes (bus, metro, tram)
- 15 stops across different routes
- 1 admin user

### Development Mode (with auto-reload)
```bash
# Backend with nodemon
cd backend
npm run dev

# Frontend (already has hot reload)
cd frontend
npm start
```

### Clear Database
```bash
# Clear all alerts
mongosh transitlive --eval "db.alerts.deleteMany({})"

# Clear entire database and reseed
mongosh transitlive --eval "db.dropDatabase()"
cd backend && npm run seed
```

## Configuration

### Backend Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/transitlive
PORT=5001
NODE_ENV=development
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@transitlive.com
ADMIN_PASSWORD=admin123
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB (macOS)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>
```

### WebSocket Connection Failed
- Ensure backend is running on port 5001
- Check CORS configuration in backend/server.js
- Verify REACT_APP_SOCKET_URL in frontend/.env

## 📝 Key Features Explained

### GTFS-RT Simulation
The backend includes a GTFS-Realtime simulator that:
- Generates realistic vehicle positions
- Creates arrival predictions based on route schedules
- Simulates delays and service disruptions
- Handles route cancellations

### Real-time Data Flow
1. **HTTP Requests**: Components fetch initial data via API (axios)
2. **WebSocket Connection**: Established independently via Socket.IO
3. **Live Updates**: Backend pushes updates through WebSocket
4. **State Management**: React components update UI with new data

### Authentication Flow
1. Admin logs in → Backend generates JWT
2. Frontend stores JWT in localStorage
3. API interceptor adds JWT to all requests
4. Backend middleware verifies JWT for protected routes

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## Acknowledgments

- GTFS-Realtime specification by Google
- Socket.IO for real-time communication
- MongoDB for flexible data storage
- React community for excellent tooling

## Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for better public transportation experiences**
