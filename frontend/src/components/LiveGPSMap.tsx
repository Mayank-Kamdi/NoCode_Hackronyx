import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface LiveGPSMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  label?: string;
  isEmergency?: boolean;
  height?: string;
}

// Component to dynamically re-center map when lat/lng change
const RecenterMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
};

// Create custom animated map pin
const createGPSPinIcon = (isEmergency: boolean, label: string) => {
  const color = isEmergency ? '#EF4444' : '#10B981';
  return L.divIcon({
    className: 'custom-gps-pin',
    html: `
      <div style="
        position: relative;
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${isEmergency ? '🚨' : '📍'}
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${color};
          opacity: 0.5;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const LiveGPSMap: React.FC<LiveGPSMapProps> = ({
  latitude,
  longitude,
  accuracy = 15,
  label = 'CURRENT LOCATION',
  isEmergency = false,
  height = '240px'
}) => {
  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden border border-[#A6B1E1] shadow-md z-10"
      style={{ height }}
    >
      {/* Map Header Overlay */}
      <div className="absolute top-2 left-2 z-[1000] bg-[#424874]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#A6B1E1]/40 flex items-center gap-2 text-white shadow">
        <Navigation className={`w-4 h-4 ${isEmergency ? 'text-red-400 animate-bounce' : 'text-emerald-400'}`} />
        <span className="font-orbitron font-bold text-[11px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap lat={latitude} lng={longitude} />

        {/* Standard OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Translucent Accuracy Circle */}
        <Circle
          center={[latitude, longitude]}
          radius={accuracy}
          pathOptions={{
            color: isEmergency ? '#EF4444' : '#10B981',
            fillColor: isEmergency ? '#EF4444' : '#10B981',
            fillOpacity: 0.2,
            weight: 2
          }}
        />

        {/* GPS Location Marker */}
        <Marker
          position={[latitude, longitude]}
          icon={createGPSPinIcon(isEmergency, label)}
        >
          <Popup>
            <div className="p-1 text-xs font-sans">
              <strong className="text-[#424874] block">{label}</strong>
              <div className="font-mono text-[11px] text-slate-700 mt-0.5">
                Lat: {latitude.toFixed(6)} <br />
                Lng: {longitude.toFixed(6)}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">
                Accuracy: {accuracy.toFixed(1)}m
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
