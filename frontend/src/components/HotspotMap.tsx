import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Camera, Hotspot, Incident } from '../services/api';
import { MapPin, ShieldAlert, Video } from 'lucide-react';

interface HotspotMapProps {
  cameras: Camera[];
  hotspots: Hotspot[];
  activeIncidents?: Incident[];
  onSelectCamera?: (camera: Camera) => void;
}

const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 15px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 11px;
        font-family: Orbitron, sans-serif;
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const HotspotMap: React.FC<HotspotMapProps> = ({
  cameras,
  hotspots,
  activeIncidents = [],
  onSelectCamera,
}) => {
  const centerLat = 21.1458;
  const centerLng = 79.0882;

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden glass-panel border border-[#A6B1E1] shadow-2xl bg-[#DCD6F7]/80">
      {/* Map Header Controls overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#424874]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#A6B1E1]/40 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="font-orbitron font-bold text-xs text-white">
            SPATIO-TEMPORAL GPS RADAR MAP
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/80 font-mono border-l border-[#A6B1E1]/40 pl-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> SOS Emergency
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live Nodes
          </span>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotspot Risk Circles */}
        {hotspots.map((hs) => {
          const isCritical = hs.risk_level === 'CRITICAL';
          const color = isCritical ? '#EF4444' : '#F59E0B';
          return (
            <Circle
              key={hs.id}
              center={[hs.center_lat, hs.center_lng]}
              radius={hs.radius_meters}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isCritical ? 0.25 : 0.15,
                weight: 2,
                dashArray: '4, 8',
              }}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-bold text-xs text-[#424874] uppercase">
                    {hs.zone_name}
                  </div>
                  <div className="text-[11px] text-slate-700 mt-1">
                    Risk Level: <strong className={isCritical ? 'text-red-600' : 'text-amber-600'}>{hs.risk_level}</strong>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Recorded Incidents: {hs.incidents_count}
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Active Emergency SOS Incidents Markers */}
        {activeIncidents.map((inc) => {
          if (!inc.latitude || !inc.longitude) return null;
          return (
            <Marker
              key={`inc-${inc.id}`}
              position={[inc.latitude, inc.longitude]}
              icon={createCustomIcon('#EF4444', '🚨')}
            >
              <Popup>
                <div className="p-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">
                    EMERGENCY SOS
                  </span>
                  <div className="font-bold text-[#424874] mt-1">{inc.incident_code}</div>
                  <div className="font-mono text-[11px] text-slate-700">
                    Lat: {inc.latitude.toFixed(4)} Lng: {inc.longitude.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-red-600 font-bold mt-1">
                    Status: {inc.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Camera Markers */}
        {cameras.map((cam) => {
          const hasCriticalIncident = activeIncidents.some(
            (inc) => inc.camera_id === cam.id && (inc.status === 'TRIGGERED' || inc.status === 'RESPONDING')
          );
          const iconColor = hasCriticalIncident ? '#EF4444' : '#10B981';
          const label = cam.code.replace('CAM-', '');

          return (
            <Marker
              key={cam.id}
              position={[cam.latitude, cam.longitude]}
              icon={createCustomIcon(iconColor, label)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#424874]">{cam.name}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] rounded border border-emerald-300">
                      {cam.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-600" />
                    {cam.location_name}
                  </p>
                  {onSelectCamera && (
                    <button
                      onClick={() => onSelectCamera(cam)}
                      className="mt-2 w-full py-1 bg-[#424874] hover:bg-[#2B3054] text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Video className="w-3 h-3" /> View Stream
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
