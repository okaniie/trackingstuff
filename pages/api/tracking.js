import connectDB from '../../lib/mongodb';
import Tracking from '../../models/Tracking';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://veritracker.onrender.com'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
});

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Set default headers for all responses
  res.setHeader('Content-Type', 'application/json');

  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    // Connect to database with retry logic
    let dbConnected = false;
    let retries = 3;
    
    while (retries > 0 && !dbConnected) {
      try {
        await connectDB();
        dbConnected = true;
      } catch (error) {
        console.error(`Database connection attempt ${4 - retries} failed:`, error);
        retries--;
        if (retries === 0) {
          return res.status(500).json({
            error: 'Database connection failed',
            details: 'Unable to connect to the database after multiple attempts'
          });
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }

    if (req.method === 'POST') {
      try {
        console.log('Received tracking data:', req.body);
        
        // Validate required fields
        const requiredFields = ['trackingId', 'origin', 'destination', 'status', 'location', 'history'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({ 
            error: 'Missing required fields', 
            details: `Missing fields: ${missingFields.join(', ')}` 
          });
        }

        const tracking = await Tracking.create(req.body);
        console.log('Created tracking:', tracking);
        return res.status(200).json(tracking);
      } catch (error) {
        console.error('Error creating tracking:', error);
        return res.status(500).json({ 
          error: 'Failed to save tracking data', 
          details: error.message 
        });
      }
    } else if (req.method === 'GET') {
      try {
        if (req.query.trackingId) {
          const tracking = await Tracking.findOne({ trackingId: req.query.trackingId });
          if (tracking) {
            return res.status(200).json(tracking);
          } else {
            return res.status(404).json({ error: 'Tracking ID not found' });
          }
        } else {
          const trackings = await Tracking.find({});
          return res.status(200).json({ trackingData: trackings });
        }
      } catch (error) {
        console.error('Error reading tracking data:', error);
        return res.status(500).json({ 
          error: 'Failed to read tracking data', 
          details: error.message 
        });
      }
    } else if (req.method === 'PUT') {
      try {
        const tracking = await Tracking.findOne({ trackingId: req.body.trackingId });
        
        if (!tracking) {
          return res.status(404).json({ error: 'Tracking ID not found' });
        }

        // Calculate progress based on status
        const progressMap = {
          'Package Received': 0,
          'Processing': 20,
          'In Transit': 40,
          'Out for Delivery': 80,
          'Delivered': 100,
          'Exception': 0
        };

        // Add new history entry
        const newHistoryEntry = {
          date: new Date(),
          status: req.body.status,
          location: req.body.location
        };

        // Update the tracking entry
        tracking.status = req.body.status;
        tracking.location = req.body.location;
        tracking.progress = progressMap[req.body.status];
        tracking.history.push(newHistoryEntry);
        
        await tracking.save();
        return res.status(200).json(tracking);
      } catch (error) {
        console.error('Error updating tracking:', error);
        return res.status(500).json({ 
          error: 'Failed to update tracking data', 
          details: error.message 
        });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
} 