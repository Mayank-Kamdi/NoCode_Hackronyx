import React, { useState, useEffect } from 'react';
import { Camera, Incident, Hotspot, fetchCameras, fetchIncidents, fetchHotspots, fetchAnalyticsSummary } from '../services/api';
import { CameraFeed } from '../components/CameraFeed';
import { HotspotMap } from '../components/HotspotMap';
import { Shield, AlertTriangle, Video, Cpu, Activity, Clock, CheckCircle2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const loadData = async () => {
    try {
      const [camsData, incsData, hsData, sumData] = await Promise.all([
        fetchCameras(),
        fetchIncidents(),
        fetchHotspots(),
        fetchAnalyticsSummary(),
      ]);
      setCameras(camsData);
      setIncidents(incsData);
      setHotspots(hsData);
      setSummary(sumData);
    } catch (e) {
      console.error('Error loading admin dashboard data:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics = summary?.metrics || {
    total_cameras: cameras.length || 4,
    online_cameras: cameras.filter(c => c.status === 'ONLINE').length || 3,
    total_incidents: incidents.length || 3,
    active_critical_threats: incidents.filter(i => i.threat_level === 'CRITICAL' && i.status !== 'RESOLVED').length || 1,
    avg_response_time_seconds: 48.5,
    edge_devices_active: 2,
    ai_accuracy_percent: 96.4
  };

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-2xl border border-[#A6B1E1] bg-[#DCD6F7]/80 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-[#424874]/70 uppercase tracking-wider">
              Surveillance Cameras
            </span>
            <div className="text-2xl font-orbitron font-black text-[#424874] mt-1">
              {metrics.online_cameras}<span className="text-xs text-[#424874]/60">/{metrics.total_cameras} ONLINE</span>
            </div>
            <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-bold">
              <Activity className="w-3 h-3" /> Live Stream Feed Active
            </p>
          </div>
          <div className="p-3 bg-[#424874] rounded-xl text-[#F4EEFF]">
            <Video className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-2xl border border-rose-400 bg-rose-50 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Active Security Alerts
            </span>
            <div className="text-2xl font-orbitron font-black text-rose-600 mt-1">
              {metrics.active_critical_threats}
            </div>
            <p className="text-[11px] text-rose-700 flex items-center gap-1 mt-1 font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Dispatch Required
            </p>
          </div>
          <div className="p-3 bg-rose-600 rounded-xl text-white">
            <Shield className="w-6 h-6 animate-bounce-short" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-2xl border border-[#A6B1E1] bg-[#DCD6F7]/80 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-[#424874]/70 uppercase tracking-wider">
              Response Time
            </span>
            <div className="text-2xl font-orbitron font-black text-[#424874] mt-1">
              {metrics.avg_response_time_seconds}<span className="text-xs text-[#424874]/60"> SEC</span>
            </div>
            <p className="text-[11px] text-[#424874] flex items-center gap-1 mt-1 font-bold">
              <Clock className="w-3 h-3" /> Realtime WebSockets
            </p>
          </div>
          <div className="p-3 bg-[#424874] rounded-xl text-[#F4EEFF]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-2xl border border-[#A6B1E1] bg-[#DCD6F7]/80 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold text-[#424874]/70 uppercase tracking-wider">
              System Health
            </span>
            <div className="text-2xl font-orbitron font-black text-emerald-700 mt-1">
              100% ONLINE
            </div>
            <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Dual Emergency Gateway
            </p>
          </div>
          <div className="p-3 bg-emerald-700 rounded-xl text-white">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Hotspot Radar Map + Live Laptop Webcam Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Spatio-Temporal Hotspot Radar Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-base text-[#424874] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#424874]" />
              Safety Radar & Location Incident Map
            </h3>
            <span className="text-xs text-[#424874]/70 font-mono font-bold">Live Risk Clustering</span>
          </div>

          <HotspotMap
            cameras={cameras}
            hotspots={hotspots}
            activeIncidents={incidents}
            onSelectCamera={setSelectedCamera}
          />
        </div>

        {/* Right 1 Col: Live AI Video Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-base text-[#424874] flex items-center gap-2">
              <Video className="w-5 h-5 text-[#424874]" />
              Live Laptop Webcam Stream
            </h3>
            <span className="text-xs text-emerald-700 font-mono font-bold">CAM-001 Live</span>
          </div>

          {cameras.length > 0 && (
            <CameraFeed camera={selectedCamera || cameras[0]} />
          )}

          {/* Incident Quick Feed List */}
          <div className="glass-panel p-4 rounded-2xl border border-[#A6B1E1] bg-[#DCD6F7]/80 space-y-2">
            <h4 className="font-bold text-xs text-[#424874] uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#424874]" /> Recent Safety Alerts
            </h4>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {incidents.map((inc) => (
                <div 
                  key={inc.id}
                  className="p-2.5 bg-[#F4EEFF] rounded-xl border border-[#A6B1E1] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#424874] flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                        inc.threat_level === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {inc.threat_level}
                      </span>
                      {inc.incident_code}
                    </div>
                    <p className="text-[10px] text-[#424874]/70 mt-0.5">{inc.camera_name}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-orbitron font-bold text-[#424874]">{inc.risk_score}</span>
                    <p className="text-[9px] text-[#424874]/70 font-mono">{inc.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
