import { motion } from 'framer-motion';
import styles from '../styles/PackageAnimation.module.css';

export default function PackageAnimation({ status, history = [] }) {
  // Get the most recent status from history if available
  const currentStatus = history.length > 0 ? history[0].status : status;

  const getProgress = () => {
    if (!history.length) return 0;
    
    const statusOrder = {
      'Package Received': 0,
      'In Transit': 1,
      'Out for Delivery': 1,
      'Delivered': 2
    };
    
    const currentStatusIndex = statusOrder[currentStatus] || 0;
    return currentStatusIndex / 2; // 2 is the number of steps between checkpoints
  };

  const progress = getProgress();
  const currentCheckpoint = Math.floor(progress * 2);

  // Get the current location from the most recent history entry
  const currentLocation = history.length > 0 ? history[0].location : '';

  // Reverse the history array to show in chronological order
  const chronologicalHistory = [...history].reverse();

  return (
    <div className={styles.trackingContainer}>
      <div className={styles.trackingLine}>
        {/* Checkpoints */}
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.checkpoint}>
            <div className={`${styles.checkpointDot} ${index <= currentCheckpoint ? styles.active : ''}`} />
            {index < chronologicalHistory.length && (
              <div className={styles.checkpointInfo}>
                <div className={styles.location}>{chronologicalHistory[index].location}</div>
                <div className={styles.date}>{chronologicalHistory[index].date}</div>
              </div>
            )}
          </div>
        ))}

        {/* Progress line */}
        <motion.div
          className={styles.progressLine}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1 }}
        />

        {/* Package icon */}
        <motion.div
          className={styles.package}
          initial={{ x: 0 }}
          animate={{ x: `${(currentCheckpoint / 2) * 100}%` }}
          transition={{ duration: 1 }}
        >
          📦
        </motion.div>
      </div>
      
      {/* Current status display */}
      <div className={styles.currentStatus}>
        <h3>Current Status: {currentStatus}</h3>
        {currentLocation && <p>Location: {currentLocation}</p>}
      </div>
    </div>
  );
} 