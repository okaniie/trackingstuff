import connectDB from '../../lib/mongodb';
import Tracking from '../../models/Tracking';

export default async function handler(req, res) {
  try {
    // Test database connection
    await connectDB();
    
    // Test creating a tracking entry
    const testTracking = await Tracking.create({
      trackingId: 'TEST' + Date.now(),
      origin: 'Test Origin',
      destination: 'Test Destination',
      status: 'Package Received',
      location: 'Test Location',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      history: [{
        date: new Date(),
        status: 'Package Received',
        location: 'Test Location'
      }]
    });

    // Test reading the created entry
    const foundTracking = await Tracking.findOne({ trackingId: testTracking.trackingId });

    // Test updating the entry
    testTracking.status = 'In Transit';
    testTracking.location = 'New Test Location';
    testTracking.history.push({
      date: new Date(),
      status: 'In Transit',
      location: 'New Test Location'
    });
    await testTracking.save();

    // Clean up - delete test entry
    await Tracking.deleteOne({ trackingId: testTracking.trackingId });

    res.status(200).json({
      message: 'Database connection and operations successful!',
      testResults: {
        created: testTracking,
        read: foundTracking,
        updated: testTracking
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database test failed',
      error: error.message
    });
  }
} 