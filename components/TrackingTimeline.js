import styles from '../styles/TrackingTimeline.module.css';

// Get status color based on status
const getStatusColor = (status) => {
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case 'delivered':
      return '#22c55e'; // Green
    case 'out for delivery':
      return '#8b5cf6'; // Purple
    case 'in transit':
      return '#0070f3'; // Blue
    case 'processing':
      return '#f59e0b'; // Orange
    case 'package received':
      return '#6b7280'; // Gray
    case 'exception':
      return '#ef4444'; // Red
    default:
      return '#6b7280'; // Gray
  }
};

const TrackingTimeline = ({ history }) => {
  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timeline}>
        {history.map((entry, index) => {
          const color = getStatusColor(entry.status);
          const isLast = index === history.length - 1;
          
          return (
            <div key={index} className={styles.timelineItem}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineDot} style={{ backgroundColor: color }} />
                <div className={styles.timelineInfo}>
                  <h3 style={{ color }}>{entry.status}</h3>
                  <p>{entry.location}</p>
                  <p className={styles.date}>{entry.date}</p>
                </div>
              </div>
              {!isLast && (
                <div 
                  className={styles.timelineConnector} 
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingTimeline; 