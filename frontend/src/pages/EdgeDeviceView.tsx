import React, { useState, useEffect } from 'react';
import { EdgeDevice, fetchEdgeDevices, sendDeviceAlert } from '../services/api';
import { CameraFeed } from '../components/CameraFeed';
import { Send, CheckCircle2, PhoneCall, ShieldAlert, Key, Smartphone, Radio, AlertOctagon, Video } from 'lucide-react';

export const EdgeDeviceView: React.FC = () => {
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertResponse, setAlertResponse] = useState<any>(null);

  // User Device SOS Alert state
  const [deviceId, setDeviceId] = useState("USER-DEVICE-01");
  const [location, setLocation] = useState("Main Campus Gate");
  const [riskScore, setRiskScore] = useState(92);
  const [severity, setSeverity] = useState("CRITICAL");
  const [eventType, setEventType] = useState("USER_SOS_TRIGGER");
  const [message, setMessage] = useState("User triggered immediate emergency SOS alert at Main Campus Gate");
  const [userPhone, setUserPhone] = useState("+919373156804");
  const [officerPhone, setOfficerPhone] = useState("+917058943223");

  const loadDevices = async () => {
    try {
      const data = await fetchEdgeDevices();
      setDevices(data);
    } catch (e) {
      console.error('Failed loading edge devices:', e);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleSendRealAlert = async () => {
    setSendingAlert(true);
    setAlertResponse(null);
    try {
      const payload = {
        device_id: deviceId,
        location: location,
        risk_score: Number(riskScore),
        severity: severity,
        event_type: eventType,
        message: message,
        recipient_phone: userPhone
      };
      
      const res = await sendDeviceAlert(payload);
      setAlertResponse(res);
    } catch (e: any) {
      console.error("HTTP POST /alert error:", e);
      setAlertResponse({
        success: false,
        message: e.message || "Failed to send emergency alert to FastAPI server"
      });
    } finally {
      setSendingAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-[#A6B1E1] bg-gradient-to-r from-[#DCD6F7] to-[#F4EEFF] flex flex-col md:flex-row items-center justify-between gap-4 text-[#424874]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#424874] text-[#F4EEFF] rounded-xl shadow-md">
            <Smartphone className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-xl text-[#424874]">
                USER SOS EMERGENCY SENDER DEVICE
              </span>
              <span className="px-2.5 py-0.5 bg-[#424874] text-white font-bold text-[10px] rounded uppercase">
                SENDER DEVICE
              </span>
            </div>
            <p className="text-xs text-[#424874]/80 font-medium">
              Clicking SOS sends real emergency alerts from the user's phone to the Security Officer's device in real-time over FastAPI WebSockets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#424874] text-emerald-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            HTTP FASTAPI GATEWAY ONLINE
          </span>
        </div>
      </div>

      {/* EMERGENCY RECIPIENTS DISPLAY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-[#DCD6F7] border border-[#A6B1E1] flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#424874]/70 uppercase">User Emergency Contact</div>
            <div className="text-base font-orbitron font-black text-[#424874]">{userPhone}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#DCD6F7] border border-[#A6B1E1] flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#424874]/70 uppercase">Security Officer Recipient</div>
            <div className="text-base font-orbitron font-black text-[#424874]">{officerPhone}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#DCD6F7] border border-[#A6B1E1] flex items-center gap-3 shadow-sm">
          <div className="p-2.5 bg-[#424874] text-white rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#424874]/70 uppercase">Twilio Key SID</div>
            <div className="text-xs font-mono font-bold text-[#424874] truncate">[REDACTED_API_KEY]</div>
          </div>
        </div>

      </div>

      {/* USER SOS SENDER CONTROLLER CARD */}
      <div className="glass-panel p-6 rounded-2xl border-2 border-[#A6B1E1] shadow-xl space-y-5 bg-[#DCD6F7]/80">
        
        <div className="flex items-center justify-between border-b border-[#A6B1E1]/60 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-600 animate-pulse" />
            <h3 className="font-orbitron font-bold text-lg text-[#424874]">
              TRIGGER USER EMERGENCY SOS ALERT
            </h3>
          </div>
          <span className="px-3 py-1 bg-[#424874] text-rose-300 text-xs font-mono font-bold rounded-lg">
            HTTP POST /alert
          </span>
        </div>

        {/* User Alert Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1]">
            <label className="text-[11px] font-bold text-[#424874]/70 uppercase">Device ID</label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-transparent text-sm font-orbitron font-bold text-[#424874] mt-1 focus:outline-none"
            />
          </div>

          <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1]">
            <label className="text-[11px] font-bold text-[#424874]/70 uppercase">User Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm font-orbitron font-bold text-[#424874] mt-1 focus:outline-none"
            />
          </div>

          <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1]">
            <label className="text-[11px] font-bold text-[#424874]/70 uppercase">Safety Risk Score</label>
            <input
              type="number"
              value={riskScore}
              onChange={(e) => setRiskScore(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-orbitron font-bold text-rose-600 mt-1 focus:outline-none"
            />
          </div>

          <div className="bg-[#F4EEFF] p-3.5 rounded-xl border border-[#A6B1E1]">
            <label className="text-[11px] font-bold text-[#424874]/70 uppercase">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-transparent text-sm font-orbitron font-bold text-rose-600 mt-1 focus:outline-none cursor-pointer"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

        </div>

        {/* SOS Emergency Send Button */}
        <div className="pt-2">
          <button
            onClick={handleSendRealAlert}
            disabled={sendingAlert}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-pink-700 hover:from-red-500 hover:to-rose-500 text-white font-orbitron font-black text-base tracking-wider uppercase rounded-xl shadow-xl shadow-red-600/30 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Send className="w-6 h-6 animate-bounce" />
            {sendingAlert ? 'DISPATCHING EMERGENCY ALERT TO RESPONDER...' : '[SEND EMERGENCY SOS ALERT NOW]'}
          </button>
        </div>

        {/* Server Response Card */}
        {alertResponse && (
          <div className={`p-4 rounded-xl border font-mono text-xs ${
            alertResponse.success 
              ? 'bg-emerald-900/10 border-emerald-600 text-emerald-900' 
              : 'bg-red-900/10 border-red-600 text-red-900'
          }`}>
            <div className="flex items-center justify-between mb-1 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                FastAPI Server Response (Alert Dispatched)
              </span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <pre className="text-[11px] bg-white/70 p-3 rounded-lg border border-[#A6B1E1] mt-1 overflow-x-auto">
              {JSON.stringify(alertResponse, null, 2)}
            </pre>
          </div>
        )}

      </div>

      {/* LIVE LAPTOP WEBCAM FEED */}
      <div className="glass-panel p-5 rounded-2xl border border-[#A6B1E1] bg-[#DCD6F7]/80 space-y-3">
        <h3 className="font-orbitron font-bold text-base text-[#424874] flex items-center gap-2">
          <Video className="w-5 h-5 text-[#424874]" />
          Live Laptop Webcam Stream Feed
        </h3>

        <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg border border-[#A6B1E1]">
          <CameraFeed camera={{
            id: 1,
            name: 'Laptop Webcam Feed (CAM-001 Live)',
            code: 'CAM-001',
            location_name: 'Main Campus Gate',
            zone: 'Sector 4',
            latitude: 21.1458,
            longitude: 79.0882,
            status: 'ONLINE',
            resolution: '1080p',
            fps: 30
          }} />
        </div>
      </div>

    </div>
  );
};
