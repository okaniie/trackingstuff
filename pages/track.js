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
    <div className="min-h-screen bg-white">
      <Head>
        <title>Tracking Package - {trackingId}</title>
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-5xl font-light tracking-tight mb-4">
              Package Tracking
            </h1>
            <p className="text-gray-600 tracking-wide">Tracking ID: {trackingId}</p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="btn btn-secondary"
          >
            Track Another Package
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div className="card border border-black">
            <h2 className="text-2xl font-light mb-8">Current Status</h2>
            <div className="flex flex-col items-center">
              <PackageAnimation 
                status={trackingData.status} 
                history={trackingData.history} 
              />
              <div className="mt-8 text-center">
                <p className="text-2xl font-light mb-4">{trackingData.status}</p>
                <p className="text-gray-600 mb-4 tracking-wide">Location: {trackingData.location}</p>
                <p className="text-gray-600 tracking-wide">Last Updated: {trackingData.history[0].date}</p>
              </div>
            </div>
          </div>

          <div className="card border border-black">
            <h2 className="text-2xl font-light mb-8">Package Journey</h2>
            <TrackingMap history={[...trackingData.history].reverse()} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="card border border-black">
            <h2 className="text-2xl font-light mb-8">Tracking Timeline</h2>
            <TrackingTimeline history={[...trackingData.history].reverse()} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div className="card border border-black">
            <h2 className="text-2xl font-light mb-8">Detailed History</h2>
            <div className="space-y-6">
              {[...trackingData.history].reverse().map((entry, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-6 border border-gray-200 hover:border-black transition-colors duration-200"
                >
                  <div className="flex-1">
                    <p className="text-xl font-light mb-2">{entry.status}</p>
                    <p className="text-gray-600 tracking-wide">{entry.location}</p>
                  </div>
                  <div className="text-gray-600 tracking-wide">
                    {entry.date}
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