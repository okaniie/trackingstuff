import connectDB from '../../lib/mongodb';
import Tracking from '../../models/Tracking';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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