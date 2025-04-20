import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track?trackingId=${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>VeriTrack | Real-time Package Tracking</title>
        <meta name="description" content="Track your packages in real-time with our advanced tracking system" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[90vh] py-12"
        >
          <div className="text-center mb-24">
            <h1 className="text-6xl font-bold mb-8 tracking-tight">
              VeriTrack
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed tracking-wide">
              Get real-time updates and visual tracking for all your shipments
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="card hover:shadow-lg transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Enter Tracking Number</h2>
              <p className="mb-8 text-gray-600 tracking-wide">Track your package's journey with our advanced tracking system</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking number"
                  className="input focus:border-blue-600"
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Track Package
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl"
          >
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Real-time Updates</h3>
                <p className="text-gray-600 tracking-wide">Get instant notifications about your package's status and location</p>
              </div>
            </div>
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="w-16 h-16 bg-orange-50 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Visual Tracking</h3>
                <p className="text-gray-600 tracking-wide">See your package's journey on an interactive map</p>
              </div>
            </div>
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Multiple Carriers</h3>
                <p className="text-gray-600 tracking-wide">Track packages from various shipping carriers in one place</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="py-12 text-center text-gray-600 border-t border-gray-200">
        <p className="tracking-wide">© {new Date().getFullYear()} VeriTrack. All rights reserved.</p>
      </footer>
    </div>
  );
} 