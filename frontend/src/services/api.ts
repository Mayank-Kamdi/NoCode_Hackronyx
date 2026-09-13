import axios from 'axios';

// Get current computer local IP dynamically for phone testing on Wi-Fi
const getBackendBaseURL = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8000`;
  }
  return 'http://localhost:8000';
};

const BASE_URL = getBackendBaseURL();

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'SECURITY' | 'AI_EDGE_DEVICE';
  full_name?: string;
  badge_id?: string;
  assigned_zone?: string;
}

export interface Camera {
  id: number;
  name: string;
  code: string;
  location_name: string;
  zone: string;
  latitude: number;
  longitude: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  stream_url?: string;
  resolution: string;
  fps: number;
}

export interface Incident {
  id: number;
  incident_code: string;
  camera_id: number;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  status: 'DETECTED' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'FALSE_ALARM';
  detected_factors?: string;
  snapshot_url?: string;
  notes?: string;
  timestamp: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  camera_name?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  device_id?: string;
}

export interface EdgeDevice {
  id: number;
  device_code: string;
  name: string;
  camera_id?: number;
  ip_address: string;
  status: string;
  firmware_version: string;
  cpu_usage: number;
  gpu_usage: number;
  temperature_c: number;
  inference_fps: number;
}

export interface Hotspot {
  id: number;
  zone_name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  risk_level: string;
  incidents_count: number;
}

export const fetchCameras = async (): Promise<Camera[]> => {
  const res = await api.get('/cameras');
  return res.data;
};

export const fetchIncidents = async (status?: string, threat_level?: string): Promise<Incident[]> => {
  const params: any = {};
  if (status) params.status = status;
  if (threat_level) params.threat_level = threat_level;
  const res = await api.get('/incidents', { params });
  return res.data;
};

export const fetchIncidentDetail = async (id: number): Promise<Incident> => {
  const res = await api.get(`/incidents/${id}`);
  return res.data;
};

export const updateIncidentAction = async (
  id: number,
  actionStatus: string,
  byUser: string,
  notes?: string
): Promise<Incident> => {
  const res = await api.post(`/incidents/${id}/action`, {
    status: actionStatus,
    by_user: byUser,
    notes,
  });
  return res.data;
};

// Real-Time Alert API Endpoints (Direct HTTP POST /alert and POST /alert/{alert_id}/acknowledge)
export const sendDeviceAlert = async (payload: {
  device_id: string;
  alert_id?: string;
  alert_type?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp?: string;
  message?: string;
  location?: string;
  risk_score?: number;
  severity?: string;
  recipient_phone?: string;
}) => {
  const res = await axios.post(`${BASE_URL}/alert`, payload);
  return res.data;
};

export const acknowledgeDeviceAlert = async (eventId: string) => {
  const res = await axios.post(`${BASE_URL}/alert/${eventId}/acknowledge`);
  return res.data;
};

export const fetchAnalyticsSummary = async () => {
  const res = await api.get('/analytics/summary');
  return res.data;
};

export const fetchHotspots = async (): Promise<Hotspot[]> => {
  const res = await api.get('/hotspots');
  return res.data;
};

export const fetchEdgeDevices = async (): Promise<EdgeDevice[]> => {
  const res = await api.get('/devices');
  return res.data;
};

export const triggerThreatSimulation = async (scenario: string, camera_code: string = 'CAM-01') => {
  const res = await api.post('/devices/simulate-threat', { scenario, camera_code });
  return res.data;
};
