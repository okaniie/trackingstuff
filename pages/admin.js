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
      
      // Create initial history entry
      const history = [{
        date: new Date().toISOString().split('T')[0],
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
        history
      };

      // Save to API
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrackingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save tracking data');
      }

      setGeneratedId(trackingId);
      setSuccess('Tracking entry created successfully!');
      
      // Reset form
      setFormData({
        trackingId: '',
        origin: '',
        destination: '',
        status: 'Package Received',
        location: '',
        estimatedDelivery: '',
      });

    } catch (err) {
      setError('Failed to create tracking entry. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update tracking data');
      }

      setSuccess('Tracking information updated successfully!');
      setUpdateData({
        trackingId: '',
        status: 'Package Received',
        location: '',
      });

    } catch (err) {
      setError('Failed to update tracking information. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin - Package Tracker</title>
        <meta name="description" content="Admin interface for package tracking" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        
        <div className={styles.section}>
          <h2>Create New Tracking Entry</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="trackingId">Tracking ID (Optional)</label>
              <input
                type="text"
                id="trackingId"
                value={formData.trackingId}
                onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
                placeholder="Leave empty to generate"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="origin">Origin</label>
              <input
                type="text"
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="destination">Destination</label>
              <input
                type="text"
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Current Location</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="estimatedDelivery">Estimated Delivery Date</label>
              <input
                type="date"
                id="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                required
              />
            </div>

            <button type="submit" className={styles.button}>
              Create Tracking Entry
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h2>Update Existing Tracking</h2>
          <form onSubmit={handleUpdate} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="updateTrackingId">Tracking ID</label>
              <input
                type="text"
                id="updateTrackingId"
                value={updateData.trackingId}
                onChange={(e) => setUpdateData({ ...updateData, trackingId: e.target.value })}
                required
                placeholder="Enter tracking ID to update"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="updateStatus">New Status</label>
              <select
                id="updateStatus"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                required
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="updateLocation">New Location</label>
              <input
                type="text"
                id="updateLocation"
                value={updateData.location}
                onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                required
                placeholder="Enter new location"
              />
            </div>

            <button type="submit" className={styles.button}>
              Update Tracking
            </button>
          </form>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {generatedId && (
          <div className={styles.success}>
            <h2>Tracking Entry Created!</h2>
            <p>Tracking ID: <strong>{generatedId}</strong></p>
            <p>Please save this ID to track the package.</p>
          </div>
        )}
      </main>
    </div>
  );
} 