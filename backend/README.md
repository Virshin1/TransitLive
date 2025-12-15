# TransitLive Backend

Real-time transit status API with WebSocket support.

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

## API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication
Admin endpoints require JWT token:
```
Authorization: Bearer <token>
```

### Endpoints

#### Routes
- `GET /routes` - List all routes
- `GET /routes/:id` - Get route details
- `GET /routes/type/:type` - Get routes by type (bus, metro, tram, train)

#### Stops
- `GET /stops` - List all stops
- `GET /stops/:id` - Get stop details
- `GET /stops/nearby/:lat/:lng?distance=1000` - Get nearby stops

#### Alerts
- `GET /alerts?active=true&severity=warning` - List alerts
- `GET /alerts/:id` - Get alert details
- `POST /alerts` - Create alert (admin)
- `PUT /alerts/:id` - Update alert (admin)
- `DELETE /alerts/:id` - Delete alert (admin)

#### Authentication
- `POST /auth/login` - Login (returns JWT)
- `GET /auth/me` - Get current user

## WebSocket Events

### Server Emits
- `connected` - Client connected
- `arrival_updates` - Array of arrival predictions
- `stop_arrival_update` - Single stop update
- `service_alerts` - New alert

### Client Emits
- `subscribe_stop` - Subscribe to stop updates
- `unsubscribe_stop` - Unsubscribe from stop

## Development

```bash
# Run with auto-reload
npm run dev

# Run in production mode
npm start

# Seed database
npm run seed
```

## Environment Variables

See `.env.example` for required variables.
