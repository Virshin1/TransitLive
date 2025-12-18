/**
 * Database Seed Script
 * Populates MongoDB with sample transit data
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Alert = require('../models/Alert');

// Sample data
const users = [
  {
    email: 'admin@transitlive.com',
    password: 'admin123',
    role: 'admin'
  }
];

const stops = [
  { stopId: 'ST001', stopName: 'Central Station', latitude: 40.7589, longitude: -73.9851 },
  { stopId: 'ST002', stopName: 'City Hall', latitude: 40.7128, longitude: -74.0060 },
  { stopId: 'ST003', stopName: 'Union Square', latitude: 40.7359, longitude: -73.9911 },
  { stopId: 'ST004', stopName: 'Times Square', latitude: 40.7580, longitude: -73.9855 },
  { stopId: 'ST005', stopName: 'Grand Central', latitude: 40.7527, longitude: -73.9772 },
  { stopId: 'ST006', stopName: 'Penn Station', latitude: 40.7505, longitude: -73.9934 },
  { stopId: 'ST007', stopName: 'Brooklyn Bridge', latitude: 40.7061, longitude: -73.9969 },
  { stopId: 'ST008', stopName: 'Financial District', latitude: 40.7074, longitude: -74.0113 },
  { stopId: 'ST009', stopName: 'East Village', latitude: 40.7260, longitude: -73.9818 },
  { stopId: 'ST010', stopName: 'West Village', latitude: 40.7358, longitude: -74.0036 },
  { stopId: 'ST011', stopName: 'Chinatown', latitude: 40.7157, longitude: -73.9970 },
  { stopId: 'ST012', stopName: 'SoHo', latitude: 40.7233, longitude: -74.0030 }
];

const routes = [
  {
    routeId: 'M1',
    routeName: 'Metro Line 1',
    routeType: 'metro',
    color: '#EE352E',
    description: 'Express service through downtown'
  },
  {
    routeId: 'M2',
    routeName: 'Metro Line 2',
    routeType: 'metro',
    color: '#00933C',
    description: 'Local service with all stops'
  },
  {
    routeId: 'B101',
    routeName: 'Bus 101',
    routeType: 'bus',
    color: '#0039A6',
    description: 'Cross-town bus service'
  },
  {
    routeId: 'B202',
    routeName: 'Bus 202',
    routeType: 'bus',
    color: '#FF6319',
    description: 'Express bus to airport'
  },
  {
    routeId: 'T1',
    routeName: 'Tram 1',
    routeType: 'tram',
    color: '#996633',
    description: 'Waterfront tram service'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transitlive', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Route.deleteMany({});
    await Stop.deleteMany({});
    await Alert.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const createdUsers = await User.create(users);
    console.log(`✓ Created ${createdUsers.length} user(s)`);

    // Create stops
    const createdStops = await Stop.create(stops);
    console.log(`✓ Created ${createdStops.length} stops`);

    // Create routes with associated stops
    const routesWithStops = routes.map((route, index) => {
      // Assign different stops to different routes
      const startIndex = index * 2;
      const stopIds = createdStops.slice(startIndex, startIndex + 5).map(s => s._id);
      
      return {
        ...route,
        stops: stopIds
      };
    });

    const createdRoutes = await Route.create(routesWithStops);
    console.log(`✓ Created ${createdRoutes.length} routes`);

    // Update stops with their routes
    for (const route of createdRoutes) {
      await Stop.updateMany(
        { _id: { $in: route.stops } },
        { $push: { routes: route._id } }
      );
    }
    console.log('✓ Updated stop-route associations');

    // Create sample alerts
    const sampleAlerts = [
      {
        alertId: 'ALERT-001',
        title: 'Scheduled Maintenance on Metro Line 1',
        description: 'Track maintenance scheduled for tonight. Expect delays between 10 PM - 2 AM.',
        severity: 'info',
        alertType: 'maintenance',
        affectedRoutes: [createdRoutes[0]._id],
        startTime: new Date(),
        isActive: true,
        createdBy: createdUsers[0]._id
      },
      {
        alertId: 'ALERT-002',
        title: 'Delay on Bus 101',
        description: 'Heavy traffic causing delays of up to 15 minutes.',
        severity: 'warning',
        alertType: 'delay',
        affectedRoutes: [createdRoutes[2]._id],
        startTime: new Date(),
        isActive: true,
        createdBy: createdUsers[0]._id
      }
    ];

    const createdAlerts = await Alert.create(sampleAlerts);
    console.log(`✓ Created ${createdAlerts.length} alerts`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@transitlive.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
