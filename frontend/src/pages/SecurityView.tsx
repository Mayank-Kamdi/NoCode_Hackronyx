import React, { useState, useEffect } from 'react';
import { fetchIncidents, acknowledgeDeviceAlert } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { wsClient } from '../services/websocket';
import { AlertOctagon, CheckCircle2, MapPin, Radio, Clock, Smartphone, Bell, Check, PhoneCall, ShieldAlert } from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { user } = useAuth();
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Initial load historical incidents from DB
  const loadHistoricalIncidents = async () => {
    try {
      const data = await fetchIncidents();
      const mapped = data.map((inc) => ({
        event_id: inc.incident_code,
        incident_id: inc.id,
        device_id: inc.camera_name || 'USER-DEVICE-01',
        location: inc.location_name || 'Main Campus Gate',
        risk_score: inc.risk_score,
        severity: inc.threat_level,
        event_type: 'USER_SOS_TRIGGER',
        message: inc.detected_factors || 'User triggered emergency SOS alert at location',
        status: inc.status || 'DETECTED',
        timestamp: inc.timestamp,
        user_phone: '+919373156804',
        officer_phone: '+917058943223'
      }));
      setAlertsList(mapped);
      setActiveAlertsCount(mapped.filter(a => a.status === 'DETECTED' || a.status === 'TRIGGERED').length);
      if (mapped.length > 0 && !selectedAlert) {
        setSelectedAlert(mapped[0]);
      }
    } catch (e) {
      console.error('Failed loading historical incidents:', e);
    }
  };

  useEffect(() => {
    loadHistoricalIncidents();

    // Subscribe to WebSocket alerts on ws://localhost:8000/ws/security
    const unsubscribe = wsClient.subscribe((data) => {
      if (data.type === 'NEW_SECURITY_ALERT' || data.type === 'NEW_THREAT_ALERT') {
        const newAlert = {
          event_id: data.event_id || data.incident_code || `ABH-${Math.floor(Math.random()*1000)}`,
          incident_id: data.incident_id || data.id,
          device_id: data.device_id || 'USER-DEVICE-01',
          location: data.location || 'Main Campus Gate',
          risk_score: data.risk_score || 92,
          severity: data.severity || 'CRITICAL',
          event_type: data.event_type || 'USER_SOS_TRIGGER',
          message: data.message || 'Emergency threat alert triggered',
          status: 'DETECTED',
          timestamp: data.timestamp || new Date().toISOString(),
          user_phone: data.user_phone || '+919373156804',
          officer_phone: data.officer_phone || '+917058943223',
          sms_status: data.sms_status,
          whatsapp_status: data.whatsapp_status
        };

        // Place latest alert at top without page refresh
        setAlertsList((prev) => [newAlert, ...prev.filter(a => a.event_id !== newAlert.event_id)]);
        setSelectedAlert(newAlert);
        setActiveAlertsCount((prev) => prev + 1);
      } 
      else if (data.type === 'ALERT_STATUS_UPDATE') {
        setAlertsList((prev) =>
          prev.map((item) =>
            item.event_id === data.event_id
              ? { ...item, status: data.status }
              : item
          )
        );
        if (selectedAlert && selectedAlert.event_id === data.event_id) {
          setSelectedAlert((prev: any) => ({ ...prev, status: data.status }));
        }
        if (data.status === 'ACKNOWLEDGED' || data.status === 'RESOLVED') {
          setActiveAlertsCount((prev) => Math.max(0, prev - 1));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAcknowledge = async (eventId: string) => {
    try {
      await acknowledgeDeviceAlert(eventId);
      setAlertsList((prev) =>
        prev.map((item) =>
          item.event_id === eventId ? { ...item, status: 'ACKNOWLEDGED' } : item
        )
      );
      if (selectedAlert && selectedAlert.event_id === eventId) {
        setSelectedAlert((prev: any) => ({ ...prev, status: 'ACKNOWLEDGED' }));
      }
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const filteredAlerts = alertsList.filter((a) => {
    if (statusFilter === 'ACTIVE') return a.status === 'DETECTED' || a.status === 'TRIGGERED';
    if (statusFilter === 'ACKNOWLEDGED') return a.status === 'ACKNOWLEDGED';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Tactical Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#A6B1E1] bg-gradient-to-r from-[#DCD6F7] to-[#F4EEFF] flex flex-col md:flex-row items-center justify-between gap-4 text-[#424874]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 text-white rounded-xl shadow-md">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-xl text-[#424874]">
                SECURITY RESPONDER RECEIVER DEVICE
              </span>
              <span className="px-2.5 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded uppercase">
                RECEIVER DEVICE
              </span>
            </div>
            <p className="text-xs text-[#424874]/80 font-medium">
              Officer: <strong className="text-[#424874]">+917058943223 (Security Control)</strong> &bull; User Phone: <strong className="text-[#424874]">+919373156804</strong> &bull; Active Alerts: <span className="font-bold text-red-600 font-mono text-sm">{activeAlertsCount}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold ${statusFilter === 'ALL' ? 'bg-[#424874] text-white' : 'bg-[#DCD6F7] text-[#424874]'}`}
          >
            All Alerts ({alertsList.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold ${statusFilter === 'ACTIVE' ? 'bg-red-600 text-white' : 'bg-[#DCD6F7] text-[#424874]'}`}
          >
            Active ({activeAlertsCount})
          </button>
        </div>
      </div>

      {/* Main Grid: Alert List + Live Alert Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Alert Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-[#424874] flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-600" />
            Live Incoming Emergency Alerts
          </h3>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredAlerts.map((alt) => {
              const isSelected = selectedAlert?.event_id === alt.event_id;

              return (
                <div
                  key={alt.event_id}
                  onClick={() => setSelectedAlert(alt)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#DCD6F7] border-[#424874] shadow-lg ring-2 ring-[#424874]'
                      : alt.status === 'DETECTED' || alt.status === 'TRIGGERED'
                      ? 'bg-rose-50 border-rose-400 hover:border-rose-600'
                      : 'bg-[#F4EEFF] border-[#A6B1E1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-orbitron font-bold text-white bg-red-600">
                        {alt.severity} RISK
                      </span>
                      <span className="font-mono text-xs font-bold text-[#424874]">
                        [{alt.event_id}]
                      </span>
                    </div>

                    <span className="font-orbitron font-black text-sm text-rose-600">
                      RISK: {alt.risk_score}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-[#424874] mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    Device: {alt.device_id} &bull; {alt.location}
                  </h4>

                  <p className="text-[11px] text-[#424874]/90 mt-1 font-medium">
                    {alt.message}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#A6B1E1]/40 flex items-center justify-between text-[10px] text-[#424874]/70 font-mono">
                    <span>{new Date(alt.timestamp).toLocaleTimeString()}</span>
                    
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                        alt.status === 'ACKNOWLEDGED' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-400' 
                          : 'bg-red-100 text-red-800 border border-red-400 animate-pulse'
                      }`}>
                        {alt.status}
                      </span>

                      {alt.status !== 'ACKNOWLEDGED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alt.event_id);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition-colors"
                        >
                          [ACKNOWLEDGE]
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Prominent Live Alert Inspection Display (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="glass-panel p-6 rounded-2xl border-2 border-rose-500 shadow-2xl space-y-5 bg-[#DCD6F7]/90">
              
              {/* Prominent Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <AlertOctagon className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="font-orbitron font-black text-xl tracking-wider">
                      🚨 LIVE EMERGENCY SECURITY ALERT
                    </h2>
                    <span className="text-xs font-mono text-rose-200 font-bold uppercase">
                      {selectedAlert.event_type || 'USER_SOS_TRIGGER'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 font-orbitron font-bold text-xs rounded uppercase bg-white text-rose-700">
                    {selectedAlert.severity} RISK
                  </span>
                  <div className="text-2xl font-orbitron font-black text-white mt-1">
                    Risk: {selectedAlert.risk_score}/100
                  </div>
                </div>
              </div>

              {/* Emergency Contact Bar */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1] flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-[10px] font-bold text-[#424874]/70 uppercase">User Phone</div>
                    <div className="text-sm font-orbitron font-bold text-[#424874]">+919373156804</div>
                  </div>
                </div>

                <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1] flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <div>
                    <div className="text-[10px] font-bold text-[#424874]/70 uppercase">Officer Recipient</div>
                    <div className="text-sm font-orbitron font-bold text-[#424874]">+917058943223</div>
                  </div>
                </div>
              </div>

              {/* Alert Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1]">
                  <span className="text-[10px] font-bold uppercase text-[#424874]/70">Event ID</span>
                  <div className="text-base font-orbitron font-bold text-[#424874] mt-1">
                    {selectedAlert.event_id}
                  </div>
                </div>

                <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1]">
                  <span className="text-[10px] font-bold uppercase text-[#424874]/70">Location</span>
                  <div className="text-base font-orbitron font-bold text-[#424874] mt-1">
                    {selectedAlert.location}
                  </div>
                </div>
              </div>

              {/* Threat Message Box */}
              <div className="p-4 bg-[#F4EEFF] rounded-xl border border-[#A6B1E1] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#424874]/70 block">
                  Alert Message Details:
                </span>
                <p className="text-sm font-bold text-[#424874] leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              {/* Action Button: [ACKNOWLEDGE] */}
              <div className="pt-2">
                {selectedAlert.status === 'ACKNOWLEDGED' ? (
                  <div className="w-full py-3.5 bg-emerald-100 border border-emerald-400 text-emerald-800 font-orbitron font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600" />
                    ALERT ACKNOWLEDGED BY OFFICER (+917058943223)
                  </div>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.event_id)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-orbitron font-black text-sm tracking-wider uppercase rounded-xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    [ACKNOWLEDGE EMERGENCY ALERT]
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-[#424874]/70 bg-[#DCD6F7]">
              Awaiting live incoming security alerts...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
