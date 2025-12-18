/**
 * Database Clear Script
 * Removes all data from MongoDB collections
 * Run with: node scripts/removeAll.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Alert = require('../models/Alert');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  }
}

async function delAll() {
  try {
    console.log('Removing all data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Route.deleteMany({});
    await Stop.deleteMany({});
    await Alert.deleteMany({});
    console.log('\nAll data removed successfully');
  } catch (err) {
    console.error('Error removing data:', err);
    process.exit(1);
  }
}

async function main() {
  await connectDB();
  await delAll();
  await mongoose.connection.close();
  console.log('✓ Database connection closed');
  process.exit(0);
}

main();