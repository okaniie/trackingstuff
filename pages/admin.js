import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const [formData, setFormData] = useState({
    trackingId: '',
    origin: '',
    destination: '',
    status: 'Package Received',
    location: '',
    estimatedDelivery: '',
  });

  const [updateData, setUpdateData] = useState({
    trackingId: '',
    status: 'Package Received',
    location: '',
  });

  const [generatedId, setGeneratedId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = [
    'Package Received',
    'Processing',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Exception'
  ];

  const generateTrackingId = () => {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Generate a new tracking ID if not provided
      const trackingId = formData.trackingId || generateTrackingId();
      
      // Calculate progress based on status
      const progressMap = {
        'Package Received': 0,
        'Processing': 20,
        'In Transit': 40,
        'Out for Delivery': 80,
        'Delivered': 100,
        'Exception': 0
      };
      
      // Create initial history entry with proper Date object
      const history = [{
        date: new Date(),
        status: formData.status,
        location: formData.location || formData.origin
      }];

      const newTrackingData = {
        trackingId,
        origin: formData.origin,
        destination: formData.destination,
        status: formData.status,
        location: formData.location || formData.origin,
        estimatedDelivery: formData.estimatedDelivery,
        progress: progressMap[formData.status],
        history
      };

      console.log('Submitting tracking data:', newTrackingData);

      // Save to API with retry logic
      let retries = 3;
      let lastError = null;

      while (retries > 0) {
        try {
          const response = await fetch('/api/tracking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(newTrackingData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to create tracking data');
          }

          const data = await response.json();
          setSuccess('Tracking information created successfully!');
          setGeneratedId(data.trackingId);
          setFormData({
            trackingId: '',
            origin: '',
            destination: '',
            status: 'Package Received',
            location: '',
            estimatedDelivery: '',
          });
          return; // Success, exit the function
        } catch (err) {
          lastError = err;
          retries--;
          if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;

    } catch (err) {
      console.error('Error creating tracking:', err);
      setError(`Failed to create tracking entry: ${err.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let retries = 3;
      let lastError = null;

      while (retries > 0) {
        try {
          const response = await fetch('/api/tracking', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(updateData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to update tracking data');
          }

          setSuccess('Tracking information updated successfully!');
          setUpdateData({
            trackingId: '',
            status: 'Package Received',
            location: '',
          });

          return; // Success, exit the function
        } catch (err) {
          lastError = err;
          retries--;
          if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;

    } catch (err) {
      console.error('Error updating tracking:', err);
      setError(`Failed to update tracking information: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>Admin - Package Tracker</title>
        <meta name="description" content="Admin interface for package tracking" />
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Admin Dashboard</h1>
        
        {/* Create New Tracking Entry Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Create New Tracking Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">Tracking ID (Optional)</label>
                <input
                  type="text"
                  id="trackingId"
                  value={formData.trackingId}
                  onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
                  placeholder="Leave empty to generate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input
                  type="text"
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="estimatedDelivery" className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="date"
                  id="estimatedDelivery"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 font-semibold">
                Create Tracking Entry
              </button>
            </div>
          </form>
        </div>

        {/* Update Existing Tracking Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Update Existing Tracking</h2>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="updateTrackingId" className="block text-sm font-medium text-gray-700 mb-1">Tracking ID</label>
                <input
                  type="text"
                  id="updateTrackingId"
                  value={updateData.trackingId}
                  onChange={(e) => setUpdateData({ ...updateData, trackingId: e.target.value })}
                  required
                  placeholder="Enter tracking ID to update"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="updateStatus" className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  id="updateStatus"
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="updateLocation" className="block text-sm font-medium text-gray-700 mb-1">New Location</label>
                <input
                  type="text"
                  id="updateLocation"
                  value={updateData.location}
                  onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                  required
                  placeholder="Enter new location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 font-semibold">
                Update Tracking
              </button>
            </div>
          </form>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 text-center">
            {success}
          </div>
        )}

        {/* Generated ID Display */}
        {generatedId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Tracking Entry Created!</h2>
            <p className="text-gray-700 mb-1">Tracking ID: <span className="font-mono font-bold">{generatedId}</span></p>
            <p className="text-gray-600">Please save this ID to track the package.</p>
          </div>
        )}
      </main>
    </div>
  );
} 