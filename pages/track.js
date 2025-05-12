import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import TrackingMap from '../components/TrackingMap';
import TrackingTimeline from '../components/TrackingTimeline';
import PackageAnimation from '../components/PackageAnimation';

export default function Track() {
  const router = useRouter();
  const { trackingId } = router.query;
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackingId) return;

    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tracking?trackingId=${trackingId}`);
        if (!response.ok) {
          throw new Error('Tracking ID not found');
        }
        const data = await response.json();
        setTrackingData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setTrackingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [trackingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Head>
          <title>Tracking Package - Loading...</title>
        </Head>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg tracking-wide">Loading tracking information...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Head>
          <title>Tracking Package - Error</title>
        </Head>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border border-black max-w-md w-full"
        >
          <div className="p-12 text-center">
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-light mb-6">Error</h1>
            <p className="text-gray-600 mb-12 tracking-wide">{error}</p>
            <button 
              onClick={() => router.push('/')} 
              className="btn btn-primary w-full"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Head>
          <title>Tracking Package - Not Found</title>
        </Head>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border border-black max-w-md w-full"
        >
          <div className="p-12 text-center">
            <div className="w-16 h-16 border border-black flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-light mb-6">Package Not Found</h1>
            <p className="text-gray-600 mb-12 tracking-wide">Please check your tracking ID and try again.</p>
            <button 
              onClick={() => router.push('/')} 
              className="btn btn-primary w-full"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>Tracking Package - {trackingId}</title>
      </Head>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-gray-900">Package Tracking</h1>
            <p className="text-gray-500 tracking-wide text-lg">Tracking ID: <span className="font-mono text-gray-700">{trackingId}</span></p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="btn btn-secondary px-6 py-3 rounded-lg shadow hover:shadow-md transition-all text-base font-semibold"
          >
            Track Another Package
          </button>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14"
        >
          {/* Current Status Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Current Status</h2>
            <PackageAnimation 
              status={trackingData.status} 
              history={trackingData.history}
            />
            <div className="mt-8 text-center w-full">
              <p className="text-2xl font-semibold mb-2 text-gray-900">{trackingData.status}</p>
              <p className="text-gray-500 mb-2 tracking-wide">Location: <span className="font-medium text-gray-700">{trackingData.location}</span></p>
              <p className="text-gray-400 tracking-wide text-sm">Last Updated: {new Date(trackingData.history[0].date).toLocaleString()}</p>
            </div>
          </div>

          {/* Package Journey Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Package Journey</h2>
            <TrackingMap history={[...trackingData.history].reverse()} />
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-14"
        >
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Tracking Timeline</h2>
            <TrackingTimeline history={[...trackingData.history].reverse()} />
          </div>
        </motion.div>

        {/* Detailed History Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-14"
        >
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Detailed History</h2>
            <div className="divide-y divide-gray-100">
              {[...trackingData.history].reverse().map((entry, index) => (
                <div 
                  key={index} 
                  className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-2 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900 mb-1">{entry.status}</p>
                    <p className="text-gray-500 tracking-wide">{entry.location}</p>
                  </div>
                  <div className="text-gray-400 tracking-wide text-sm md:text-right">
                    {new Date(entry.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 