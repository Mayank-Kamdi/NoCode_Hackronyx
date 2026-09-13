import React, { useState, useEffect } from 'react';
import { acknowledgeDeviceAlert } from '../services/api';
import { wsClient } from '../services/websocket';
import { LiveGPSMap } from '../components/LiveGPSMap';
import { Shield, MapPin, AlertOctagon, CheckCircle2, ExternalLink, Check, Bell, User } from 'lucide-react';

export const ReceiverSecurityView: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [alertsList, setAlertsList] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to persistent WebSocket connection ws://SERVER_IP/ws/security
    const unsubscribe = wsClient.subscribe((data) => {
      if (data.type === 'CONNECTION_CHANGE') {
        setIsConnected(data.isConnected);
      } else if (data.type === 'NEW_SECURITY_ALERT' || data.alert_type === 'SOS' || data.type === 'NEW_THREAT_ALERT') {
        const newAlert = {
          alert_id: data.alert_id || data.event_id || `ABH-SOS-${Math.floor(100 + Math.random()*900)}`,
          device_id: data.device_id || 'PHONE-001 (Priya Sharma)',
          user_name: data.user_name || 'Priya Sharma',
          latitude: data.latitude || 21.1458,
          longitude: data.longitude || 79.0882,
          accuracy: data.accuracy || 10.0,
          timestamp: data.timestamp || new Date().toISOString(),
          message: data.message || 'Emergency SOS alert',
          status: 'DETECTED'
        };

        // Place latest alert at top without page refresh
        setAlertsList((prev) => [newAlert, ...prev.filter(a => a.alert_id !== newAlert.alert_id)]);
      } else if (data.type === 'ALERT_STATUS_UPDATE') {
        setAlertsList((prev) =>
          prev.map((item) =>
            (item.alert_id === data.alert_id || item.alert_id === data.event_id)
              ? { ...item, status: 'ACKNOWLEDGED' }
              : item
          )
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeDeviceAlert(alertId);
      setAlertsList((prev) =>
        prev.map((item) =>
          item.alert_id === alertId ? { ...item, status: 'ACKNOWLEDGED' } : item
        )
      );
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F4EEFF] text-[#424874] font-sans p-4 flex flex-col justify-between max-w-md mx-auto shadow-2xl rounded-3xl border border-[#A6B1E1] my-2">
      
      {/* HEADER SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-[#A6B1E1]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-orbitron font-black text-xl text-[#424874] tracking-wider">
                NoCode SECURITY
              </h1>
              <p className="text-xs font-bold text-[#424874]/70 uppercase tracking-wide">
                Responder Receiver Device
              </p>
            </div>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#DCD6F7] rounded-full border border-[#A6B1E1] text-xs font-bold">
            {isConnected ? (
              <>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-emerald-800">● LIVE</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                <span className="text-slate-600">○ OFFLINE</span>
              </>
            )}
          </div>
        </div>

        {/* ALERTS QUEUE */}
        {alertsList.length === 0 ? (
          <div className="py-20 text-center text-[#424874]/60 space-y-2">
            <Bell className="w-12 h-12 mx-auto text-rose-500 animate-pulse" />
            <p className="font-bold text-sm">Waiting for emergency alerts...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {alertsList.map((alt) => (
              <div
                key={alt.alert_id}
                className="p-4 rounded-2xl border-2 border-rose-500 bg-[#DCD6F7] shadow-xl space-y-3"
              >
                {/* Alert Title Banner */}
                <div className="flex items-center justify-between border-b border-rose-300 pb-2">
                  <div className="flex items-center gap-2 text-rose-700 font-orbitron font-black text-lg">
                    <AlertOctagon className="w-6 h-6 animate-bounce" />
                    <span>🚨 SOS ALERT</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-800 bg-[#F4EEFF] px-2 py-0.5 rounded border border-rose-300">
                    {alt.alert_id}
                  </span>
                </div>

                {/* SENDER USER REAL NAME */}
                <div className="bg-[#F4EEFF] p-2.5 rounded-xl border border-[#A6B1E1] flex items-center gap-2 text-xs font-bold text-[#424874]">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>Sender Name: <strong className="text-rose-600 text-sm">{alt.user_name || 'Priya Sharma'}</strong></span>
                </div>

                {/* LIVE MAP DISPLAY OF SENDER GPS */}
                <LiveGPSMap
                  latitude={alt.latitude}
                  longitude={alt.longitude}
                  accuracy={alt.accuracy || 10}
                  label={`${alt.user_name || 'SENDER'} GPS`}
                  isEmergency={true}
                  height="170px"
                />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#F4EEFF] p-2 rounded-xl border border-[#A6B1E1]">
                    <span className="text-[10px] font-bold text-[#424874]/70 uppercase block">Device ID</span>
                    <span className="font-bold text-[#424874] truncate block">{alt.device_id}</span>
                  </div>
                  <div className="bg-[#F4EEFF] p-2 rounded-xl border border-[#A6B1E1]">
                    <span className="text-[10px] font-bold text-[#424874]/70 uppercase block">Time</span>
                    <span className="font-bold text-[#424874]">{new Date(alt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Actions: Open Location + Acknowledge */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => openGoogleMaps(alt.latitude, alt.longitude)}
                    className="py-3 bg-[#424874] hover:bg-[#2B3054] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    📍 OPEN LOCATION
                  </button>

                  {alt.status === 'ACKNOWLEDGED' ? (
                    <div className="py-3 bg-emerald-100 border border-emerald-400 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600" />
                      ACKNOWLEDGED
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alt.alert_id)}
                      className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      ✓ ACKNOWLEDGE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center border-t border-[#A6B1E1]/40 pt-2 pb-1 text-[11px] text-[#424874]/70 font-mono">
        NoCode Security Receiver Gateway &bull; Persistent WebSocket ACTIVE
      </div>

    </div>
  );
};
