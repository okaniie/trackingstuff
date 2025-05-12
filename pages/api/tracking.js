import connectDB from '../../lib/mongodb';
import Tracking from '../../models/Tracking';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    try {
      const tracking = await Tracking.create(req.body);
      res.status(200).json(tracking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save tracking data' });
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
      res.status(500).json({ error: 'Failed to read tracking data' });
    }
  } else if (req.method === 'PUT') {
    try {
      const tracking = await Tracking.findOne({ trackingId: req.body.trackingId });
      
      if (!tracking) {
        res.status(404).json({ error: 'Tracking ID not found' });
        return;
      }

      // Add new history entry
      const newHistoryEntry = {
        date: new Date(),
        status: req.body.status,
        location: req.body.location
      };

      // Update the tracking entry
      tracking.status = req.body.status;
      tracking.location = req.body.location;
      tracking.history.push(newHistoryEntry);
      
      await tracking.save();
      res.status(200).json(tracking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tracking data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 