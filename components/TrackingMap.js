import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/TrackingMap.module.css';

// Dynamically import the map component with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Component to handle map bounds
function SetBounds({ markers }) {
  const Map = dynamic(
    () => import('react-leaflet').then((mod) => {
      const { useMap } = mod;
      return function Bounds() {
        const map = useMap();
        useEffect(() => {
          if (markers.length > 0 && map) {
            const L = require('leaflet');
            const bounds = L.latLngBounds(markers.map(marker => marker.position));
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }, [markers, map]);
        return null;
      };
    }),
    { ssr: false }
  );

  return <Map markers={markers} />;
}

// Get marker color based on status
const getStatusColor = (status) => {
  const normalizedStatus = status.toLowerCase().trim();
  
  if (normalizedStatus.includes('delivered')) {
    return '#22c55e'; // Green
  } else if (normalizedStatus.includes('in transit')) {
    return '#0070f3'; // Blue
  } else if (normalizedStatus.includes('processing')) {
    return '#f59e0b'; // Orange
  } else if (normalizedStatus.includes('out for delivery')) {
    return '#8b5cf6'; // Purple
  } else {
    return '#6b7280'; // Gray
  }
};

// Get coordinates based on location name with improved accuracy
const getCoordinates = async (location) => {
  try {
    // First try with a more specific search query
    const searchQuery = `${location}, country`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      // Log the found location for verification
      console.log(`Found coordinates for ${location}:`, {
        lat: result.lat,
        lon: result.lon,
        display_name: result.display_name
      });
      return [parseFloat(result.lat), parseFloat(result.lon)];
    }
    
    // If first attempt fails, try a broader search
    const broadResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
    );
    const broadData = await broadResponse.json();
    
    if (broadData && broadData.length > 0) {
      const result = broadData[0];
      console.log(`Found coordinates (broad search) for ${location}:`, {
        lat: result.lat,
        lon: result.lon,
        display_name: result.display_name
      });
      return [parseFloat(result.lat), parseFloat(result.lon)];
    }
    
    // If both attempts fail, use a more sophisticated fallback
    console.warn(`Could not find coordinates for ${location}, using fallback`);
    const hash = location.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Use the hash to generate more realistic coordinates
    // These coordinates will be more spread out based on the location name
    const lat = 39.8283 + (hash % 1000) / 1000;
    const lng = -98.5795 + (hash % 1000) / 1000;
    
    return [lat, lng];
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback coordinates (center of US)
    return [39.8283, -98.5795];
  }
};

const TrackingMap = ({ history }) => {
  const [markers, setMarkers] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [leaflet, setLeaflet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        setLeaflet(L);
        // Fix for Leaflet marker icons
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchCoordinates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Convert history entries to markers with real coordinates
        const newMarkers = await Promise.all(
          history.map(async (entry, index) => {
            const [lat, lng] = await getCoordinates(entry.location);
            return {
              position: [lat, lng],
              data: {
                status: entry.status,
                location: entry.location,
                date: entry.date,
                index: getStatusOrder(entry.status),
                progress: getStatusProgress(entry.status)
              }
            };
          })
        );

        // Sort markers by date to ensure correct path order
        newMarkers.sort((a, b) => new Date(a.data.date) - new Date(b.data.date));
        setMarkers(newMarkers);
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setError('Failed to load map data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, [history, isClient]);

  // Function to get status order number
  const getStatusOrder = (status) => {
    const normalizedStatus = status.toLowerCase().trim();
    
    if (normalizedStatus.includes('package received')) {
      return 1;
    } else if (normalizedStatus.includes('processing')) {
      return 2;
    } else if (normalizedStatus.includes('in transit')) {
      return 3;
    } else if (normalizedStatus.includes('out for delivery')) {
      return 4;
    } else if (normalizedStatus.includes('delivered')) {
      return 5;
    } else {
      return 0; // For any other status
    }
  };

  // Function to get status progress percentage
  const getStatusProgress = (status) => {
    const normalizedStatus = status.toLowerCase().trim();
    
    if (normalizedStatus.includes('package received')) {
      return 0;
    } else if (normalizedStatus.includes('processing')) {
      return 20;
    } else if (normalizedStatus.includes('in transit')) {
      return 40;
    } else if (normalizedStatus.includes('out for delivery')) {
      return 80;
    } else if (normalizedStatus.includes('delivered')) {
      return 100;
    } else {
      return 0;
    }
  };

  if (!isClient || !leaflet) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.loading}>Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Draw path line with animation */}
        <Polyline
          positions={markers.map(marker => marker.position)}
          color="#0070f3"
          weight={3}
          opacity={0.7}
          dashArray="5, 10"
          className={styles.animatedPath}
        />
        {/* Add markers with improved styling */}
        {markers.map((marker, index) => {
          const color = getStatusColor(marker.data.status);
          return (
            <Marker
              key={index}
              position={marker.position}
              icon={leaflet.divIcon({
                className: 'custom-div-icon',
                html: `
                  <div style="
                    background-color: ${color};
                    color: white;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    font-weight: bold;
                    font-size: 14px;
                    transition: all 0.3s ease;
                  ">${marker.data.index}</div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3 style={{ color }}>{marker.data.status}</h3>
                  <p><strong>Location:</strong> {marker.data.location}</p>
                  <p><strong>Date:</strong> {new Date(marker.data.date).toLocaleString()}</p>
                  <p><strong>Stage:</strong> {marker.data.index} of 5</p>
                  <p><strong>Progress:</strong> {marker.data.progress}%</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <SetBounds markers={markers} />
      </MapContainer>
      {/* Legend with improved styling */}
      <div className={styles.legend}>
        <h4>Status Legend</h4>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#0070f3' }}></span>
          <span>In Transit</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#22c55e' }}></span>
          <span>Delivered</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></span>
          <span>Processing</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#8b5cf6' }}></span>
          <span>Out for Delivery</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap; 