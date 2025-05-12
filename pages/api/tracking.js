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
// And to throw an error when an error happens in a middleware
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
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed', details: error.message });
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
      res.status(200).json(tracking);
    } catch (error) {
      console.error('Error creating tracking:', error);
      res.status(500).json({ error: 'Failed to save tracking data', details: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      if (req.query.trackingId) {
        const tracking = await Tracking.findOne({ trackingId: req.query.trackingId });
        if (tracking) {
          res.status(200).json(tracking);
        } else {
          res.status(404).json({ error: 'Tracking ID not found' });
        }
      } else {
        const trackings = await Tracking.find({});
        res.status(200).json({ trackingData: trackings });
      }
    } catch (error) {
      console.error('Error reading tracking data:', error);
      res.status(500).json({ error: 'Failed to read tracking data', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const tracking = await Tracking.findOne({ trackingId: req.body.trackingId });
      
      if (!tracking) {
        res.status(404).json({ error: 'Tracking ID not found' });
        return;
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
      res.status(200).json(tracking);
    } catch (error) {
      console.error('Error updating tracking:', error);
      res.status(500).json({ error: 'Failed to update tracking data', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 