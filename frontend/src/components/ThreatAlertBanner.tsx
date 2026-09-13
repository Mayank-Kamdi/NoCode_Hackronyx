import React from 'react';
import { AlertOctagon, CheckCircle2, MapPin, Radio, Eye } from 'lucide-react';
import { Incident } from '../services/api';

interface ThreatAlertBannerProps {
  alert: any;
  onAcknowledge: (id: number) => void;
  onViewDetails: (incident: any) => void;
  onDismiss: () => void;
}

export const ThreatAlertBanner: React.FC<ThreatAlertBannerProps> = ({
  alert,
  onAcknowledge,
  onViewDetails,
  onDismiss,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-4xl animate-bounce-short">
      <div className="glass-panel-alert p-4 rounded-2xl border-2 border-red-500/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Indicator & Icon */}
        <div className="flex items-center gap-3">
          <div className="relative p-3 bg-red-600/30 rounded-xl border border-red-500/50">
            <AlertOctagon className="w-8 h-8 text-red-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-600 text-white font-orbitron font-bold text-xs rounded tracking-wider">
                {alert.threat_level || 'CRITICAL'} THREAT DETECTED
              </span>
              <span className="font-mono text-xs text-red-300 font-semibold">
                [{alert.incident_code || 'INC-NOW'}]
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              {alert.camera_name || 'CAM-01 Sector 4 Alleyway'} &bull; {alert.location_name || 'North Gate'}
            </h3>

            <p className="text-xs text-red-200 mt-1 max-w-xl">
              {Array.isArray(alert.factors) ? alert.factors.join(' | ') : (alert.detected_factors || 'Isolated Woman with Pursuit Motion')}
            </p>
          </div>
        </div>

        {/* Right Risk Meter & Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-right px-3 py-1.5 bg-red-950/80 rounded-xl border border-red-500/40">
            <div className="text-[10px] uppercase font-bold text-red-300">Risk Score</div>
            <div className="text-2xl font-orbitron font-black text-red-400">
              {alert.risk_score || 94.5}<span className="text-xs text-red-300">/100</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onAcknowledge(alert.incident_id || alert.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all transform hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              Acknowledge Alert
            </button>

            <button
              onClick={() => onViewDetails(alert)}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-xl border border-cyan-500/30 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              View Verification
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
