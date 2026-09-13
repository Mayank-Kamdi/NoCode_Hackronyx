import React, { useState, useEffect } from 'react';
import { sendDeviceAlert } from '../services/api';
import { wsClient } from '../services/websocket';
import { LiveGPSMap } from '../components/LiveGPSMap';
import { Shield, MapPin, AlertOctagon, CheckCircle2, AlertTriangle, RefreshCw, User } from 'lucide-react';

export const SenderSOSView: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<'INITIAL' | 'LOADING' | 'READY' | 'DENIED'>('INITIAL');
  
  // Real Name & Device ID
  const [userName, setUserName] = useState<string>('Priya Sharma');
  const [deviceId, setDeviceId] = useState<string>('PHONE-001');

  // Real GPS Coordinates from Geolocation API
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  const [sendingAlert, setSendingAlert] = useState<boolean>(false);
  const [alertStatus, setAlertStatus] = useState<'IDLE' | 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED'>('IDLE');
  const [activeAlertId, setActiveAlertId] = useState<string>('');
  const [serverMessage, setServerMessage] = useState<string>('');

  // Request real GPS location using browser Geolocation API
  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('DENIED');
      setLocationError('Location permission is required to send an SOS alert.');
      return;
    }

    setLocationStatus('LOADING');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setLocationStatus('READY');
        setLocationError('');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('DENIED');
        setLocationError('Location permission is required to send an SOS alert.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    getGPSLocation();

    // Watch position continuously for live GPS tracking on map
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAccuracy(pos.coords.accuracy);
          setLocationStatus('READY');
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }

    // Subscribe to WebSocket status broadcasts
    const unsubscribe = wsClient.subscribe((data) => {
      if (data.type === 'CONNECTION_CHANGE') {
        setIsConnected(data.isConnected);
      } else if (data.type === 'ALERT_STATUS_UPDATE' || data.status === 'ACKNOWLEDGED') {
        if (data.alert_id === activeAlertId || data.event_id === activeAlertId) {
          setAlertStatus('ACKNOWLEDGED');
        }
      }
    });

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      unsubscribe();
    };
  }, [activeAlertId]);

  const handleSendSOS = async () => {
    if (locationStatus === 'DENIED' || latitude === null || longitude === null) {
      alert('Location permission is required to send an SOS alert.');
      getGPSLocation();
      return;
    }

    setSendingAlert(true);
    setServerMessage('');
    const uniqueId = `ABH-SOS-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const fullDeviceId = `${deviceId} (${userName})`;

    const payload = {
      device_id: fullDeviceId,
      user_name: userName,
      alert_id: uniqueId,
      alert_type: 'SOS',
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy || 0,
      timestamp: nowIso,
      message: `Emergency SOS alert triggered by ${userName}`
    };

    try {
      setAlertStatus('SENT');
      setActiveAlertId(uniqueId);

      const res = await sendDeviceAlert(payload);
      if (res && res.success) {
        setAlertStatus('DELIVERED');
        setServerMessage(`SOS Alert Dispatched for ${userName} (ID: ${res.alert_id || uniqueId})`);
      }
    } catch (e: any) {
      console.error('Error sending SOS alert:', e);
      setServerMessage(e.message || 'Failed to reach FastAPI server. Retrying...');
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EEFF] text-[#424874] font-sans p-4 flex flex-col justify-between max-w-md mx-auto shadow-2xl rounded-3xl border border-[#A6B1E1] my-2">
      
      {/* HEADER SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-[#A6B1E1]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#424874] text-white rounded-xl shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-orbitron font-black text-xl text-[#424874] tracking-wider">
                NoCode
              </h1>
              <p className="text-xs font-bold text-[#424874]/70 uppercase tracking-wide">
                Emergency Protection
              </p>
            </div>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#DCD6F7] rounded-full border border-[#A6B1E1] text-xs font-bold">
            {isConnected ? (
              <>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-emerald-800">● SERVER CONNECTED</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                <span className="text-slate-600">○ OFFLINE</span>
              </>
            )}
          </div>
        </div>

        {/* USER REAL NAME & DEVICE PROFILE CARD */}
        <div className="p-3 bg-[#DCD6F7] rounded-2xl border border-[#A6B1E1] flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#424874] text-white rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#424874]/70 uppercase block">User Real Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-[#F4EEFF] text-xs font-bold text-[#424874] px-2 py-0.5 rounded border border-[#A6B1E1] focus:outline-none w-36"
                placeholder="Enter User Name"
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#424874]/70 uppercase block">Device ID</span>
            <span className="text-xs font-mono font-bold text-[#424874]">{deviceId}</span>
          </div>
        </div>

        {/* GPS LOCATION STATUS CARD */}
        <div className="p-3.5 bg-[#DCD6F7] rounded-2xl border border-[#A6B1E1] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#424874] uppercase flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rose-600" />
              Current Location:
            </span>
            <button
              onClick={getGPSLocation}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh GPS
            </button>
          </div>

          {locationStatus === 'LOADING' && (
            <p className="text-xs text-[#424874]/80 animate-pulse font-medium">
              📍 Detecting location...
            </p>
          )}

          {locationStatus === 'READY' && latitude !== null && longitude !== null && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F4EEFF] p-2 rounded-xl border border-[#A6B1E1]">
                  <span className="text-[10px] font-bold text-[#424874]/70 uppercase block">Latitude</span>
                  <span className="text-xs font-mono font-bold text-[#424874]">{latitude.toFixed(4)}</span>
                </div>
                <div className="bg-[#F4EEFF] p-2 rounded-xl border border-[#A6B1E1]">
                  <span className="text-[10px] font-bold text-[#424874]/70 uppercase block">Longitude</span>
                  <span className="text-xs font-mono font-bold text-[#424874]">{longitude.toFixed(4)}</span>
                </div>
                <div className="bg-[#F4EEFF] p-2 rounded-xl border border-[#A6B1E1]">
                  <span className="text-[10px] font-bold text-[#424874]/70 uppercase block">Accuracy</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">{accuracy?.toFixed(1)}m</span>
                </div>
              </div>

              {/* LIVE GPS INTERACTIVE MAP */}
              <LiveGPSMap
                latitude={latitude}
                longitude={longitude}
                accuracy={accuracy || 15}
                label={`${userName.toUpperCase()} - GPS`}
                isEmergency={alertStatus !== 'IDLE'}
                height="150px"
              />
            </div>
          )}

          {locationStatus === 'DENIED' && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>Location permission is required to send an SOS alert.</span>
            </div>
          )}
        </div>

        {/* ALERT STATUS DISPLAY */}
        {alertStatus !== 'IDLE' && (
          <div className="p-3 bg-emerald-100 rounded-2xl border border-emerald-400 text-emerald-900 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 font-orbitron font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              STATUS: {alertStatus}
            </div>
            {alertStatus === 'ACKNOWLEDGED' && (
              <div className="text-xs font-black text-emerald-800 uppercase animate-bounce pt-0.5">
                ✓ ALERT ACKNOWLEDGED BY RESPONDER
              </div>
            )}
            {serverMessage && (
              <p className="text-[10px] font-mono text-emerald-800">{serverMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* MAIN LARGE EMERGENCY SOS BUTTON */}
      <div className="py-2 my-auto text-center space-y-2">
        <button
          onClick={handleSendSOS}
          disabled={sendingAlert}
          className="w-40 h-40 mx-auto rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:to-rose-600 text-white font-orbitron font-black text-lg uppercase tracking-wider shadow-2xl shadow-red-600/50 border-4 border-white flex flex-col items-center justify-center gap-1.5 transition-transform transform active:scale-95 disabled:opacity-50"
        >
          <AlertOctagon className="w-10 h-10 animate-pulse" />
          <span>🚨 SEND SOS</span>
        </button>
        <p className="text-[11px] text-[#424874]/80 font-medium px-4">
          Tap button to send real GPS coordinates for <strong>{userName}</strong> to responders.
        </p>
      </div>

      {/* FOOTER */}
      <div className="text-center border-t border-[#A6B1E1]/40 pt-2 pb-1 text-[11px] text-[#424874]/70 font-mono">
        NoCode Emergency SOS &bull; User: {userName} ({deviceId})
      </div>

    </div>
  );
};
