import { motion } from 'framer-motion';
import styles from '../styles/PackageAnimation.module.css';

export default function PackageAnimation({ status, history = [] }) {
  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  // Get the most recent status from sorted history if available
  const currentStatus = sortedHistory.length > 0 ? sortedHistory[0].status : status;

  const getProgress = () => {
    // More robust status matching using includes()
    const normalizedStatus = (currentStatus || '').toLowerCase().trim();
    if (normalizedStatus.includes('delivered')) return 100;
    if (normalizedStatus.includes('out for delivery')) return 80;
    if (normalizedStatus.includes('in transit')) return 40;
    if (normalizedStatus.includes('processing')) return 20;
    if (normalizedStatus.includes('package received')) return 0;
    if (normalizedStatus.includes('exception')) return 0;
    return 0;
  };

  const progress = getProgress();
  // Calculate the current checkpoint (stage)
  let currentCheckpoint;
  if (progress === 0 && currentStatus.toLowerCase().includes('exception')) {
    currentCheckpoint = 0;
  } else {
    currentCheckpoint = Math.min(4, Math.floor(progress / 20));
  }

  // Get the current location from the most recent sorted history entry
  const currentLocation = sortedHistory.length > 0 ? sortedHistory[0].location : '';

  // Reverse the sorted history array to show in chronological order
  const chronologicalHistory = [...sortedHistory].reverse();

  // Define the checkpoint labels based on status
  const checkpointLabels = [
    'Package Received',
    'Processing',
    'In Transit',
    'Out for Delivery',
    'Delivered'
  ];

  // Get status color based on current status
  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase().trim();
    
    if (normalizedStatus.includes('delivered')) {
      return '#22c55e'; // Green
    } else if (normalizedStatus.includes('out for delivery')) {
      return '#8b5cf6'; // Purple
    } else if (normalizedStatus.includes('in transit')) {
      return '#0070f3'; // Blue
    } else if (normalizedStatus.includes('processing')) {
      return '#f59e0b'; // Orange
    } else if (normalizedStatus.includes('package received')) {
      return '#6b7280'; // Gray
    } else {
      return '#ef4444'; // Red for Exception
    }
  };

  return (
    <div className={styles.trackingContainer}>
      <div className={styles.trackingLine}>
        {/* Checkpoints - exactly 5 checkpoints */}
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className={styles.checkpoint}>
            <motion.div 
              className={`${styles.checkpointDot} ${index <= currentCheckpoint ? styles.active : ''}`}
              style={{
                backgroundColor: index <= currentCheckpoint ? getStatusColor(currentStatus) : '#eaeaea'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 }}
            />
            {index < chronologicalHistory.length && (
              <motion.div 
                className={styles.checkpointInfo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.3 }}
              >
                <div className={styles.location}>{chronologicalHistory[index].location}</div>
                <div className={styles.date}>{new Date(chronologicalHistory[index].date).toLocaleString()}</div>
                <div className={styles.status} style={{ color: getStatusColor(chronologicalHistory[index].status) }}>
                  {chronologicalHistory[index].status}
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* Progress line */}
        <motion.div
          className={styles.progressLine}
          style={{ backgroundColor: getStatusColor(currentStatus) }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Package icon */}
        <motion.div
          className={styles.package}
          initial={{ x: 0, rotate: 0 }}
          animate={{ 
            x: `${progress}%`,
            rotate: progress * 360
          }}
          transition={{ 
            duration: 1.5,
            ease: "easeInOut",
            rotate: {
              duration: 1.5,
              ease: "easeInOut"
            }
          }}
        >
          📦
        </motion.div>
      </div>
      
      {/* Revamped Current Status Section */}
      <motion.div 
        className={styles.currentStatusCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.statusCardHeader}>
          <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(currentStatus) }}>
            {currentStatus === 'Delivered' ? '✓' : currentStatus === 'Exception' ? '⚠️' : '🚚'}
          </span>
          <span className={styles.statusCardTitle} style={{ color: getStatusColor(currentStatus) }}>
            {currentStatus}
          </span>
        </div>
        <div className={styles.statusCardDetails}>
          {currentLocation && (
            <div className={styles.statusCardRow}>
              <span className={styles.statusCardIcon}>📍</span>
              <span className={styles.statusCardText}>{currentLocation}</span>
            </div>
          )}
          <div className={styles.statusCardRow}>
            <span className={styles.statusCardIcon}>⏰</span>
            <span className={styles.statusCardText}>{new Date(chronologicalHistory[0]?.date || new Date()).toLocaleString()}</span>
          </div>
          <div className={styles.statusCardRow}>
            <span className={styles.statusCardIcon}>🔢</span>
            <span className={styles.statusCardText}>Stage {currentCheckpoint + 1} of 5</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 