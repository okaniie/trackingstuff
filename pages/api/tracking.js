import fs from 'fs';
import path from 'path';

const trackingDataPath = path.join(process.cwd(), 'data', 'tracking.json');

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Read existing data
      const data = JSON.parse(fs.readFileSync(trackingDataPath, 'utf8'));
      
      // Add new tracking entry
      data.trackingData.push(req.body);
      
      // Write back to file
      fs.writeFileSync(trackingDataPath, JSON.stringify(data, null, 2));
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save tracking data' });
    }
  } else if (req.method === 'GET') {
    try {
      // Read tracking data
      const data = JSON.parse(fs.readFileSync(trackingDataPath, 'utf8'));
      
      // If trackingId is provided, return specific tracking info
      if (req.query.trackingId) {
        const trackingInfo = data.trackingData.find(
          item => item.trackingId === req.query.trackingId
        );
        
        if (trackingInfo) {
          res.status(200).json(trackingInfo);
        } else {
          res.status(404).json({ error: 'Tracking ID not found' });
        }
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read tracking data' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Read existing data
      const data = JSON.parse(fs.readFileSync(trackingDataPath, 'utf8'));
      
      // Find the tracking entry to update
      const index = data.trackingData.findIndex(
        item => item.trackingId === req.body.trackingId
      );
      
      if (index === -1) {
        res.status(404).json({ error: 'Tracking ID not found' });
        return;
      }

      // Add new history entry
      const newHistoryEntry = {
        date: new Date().toISOString().split('T')[0],
        status: req.body.status,
        location: req.body.location
      };

      // Update the tracking entry
      data.trackingData[index] = {
        ...data.trackingData[index],
        status: req.body.status,
        location: req.body.location,
        history: [...data.trackingData[index].history, newHistoryEntry]
      };
      
      // Write back to file
      fs.writeFileSync(trackingDataPath, JSON.stringify(data, null, 2));
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tracking data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 