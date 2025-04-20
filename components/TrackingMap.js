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

// Get coordinates based on location name
const getCoordinates = (location) => {
  // In a real app, you would use a geocoding service
  // For now, we'll use a simple hash function to generate consistent coordinates
  const hash = location.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Use the hash to generate consistent coordinates within a reasonable range
  const lat = 39.8283 + (hash % 100) / 1000; // Small variations around center
  const lng = -98.5795 + (hash % 100) / 1000;
  
  return [lat, lng];
};

const TrackingMap = ({ history }) => {
  const [markers, setMarkers] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [leaflet, setLeaflet] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      setLeaflet(L);
      
      // Fix for Leaflet marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Convert history entries to markers with consistent coordinates
    const newMarkers = history.map((entry, index) => {
      const [lat, lng] = getCoordinates(entry.location);

      return {
        position: [lat, lng],
        data: {
          status: entry.status,
          location: entry.location,
          date: entry.date,
          index: index + 1
        }
      };
    });

    setMarkers(newMarkers);
  }, [history, isClient]);

  if (!isClient || !leaflet) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.loading}>Loading map...</div>
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
        {/* Draw path line */}
        <Polyline
          positions={markers.map(marker => marker.position)}
          color="#0070f3"
          weight={3}
          opacity={0.7}
        />
        {/* Add markers */}
        {markers.map((marker, index) => {
          const color = getStatusColor(marker.data.status);
          return (
            <Marker
              key={index}
              position={marker.position}
              icon={leaflet.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${marker.data.index}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className={styles.popup}>
                  <h3 style={{ color }}>{marker.data.status}</h3>
                  <p><strong>Location:</strong> {marker.data.location}</p>
                  <p><strong>Date:</strong> {marker.data.date}</p>
                  <p><strong>Step:</strong> {marker.data.index} of {markers.length}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <SetBounds markers={markers} />
      </MapContainer>
      {/* Legend */}
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