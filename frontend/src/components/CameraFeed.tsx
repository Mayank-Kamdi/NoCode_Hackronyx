import React, { useState } from 'react';
import { Camera as CameraIcon, ShieldAlert, Maximize2, RefreshCw, Activity, Cpu } from 'lucide-react';
import { Camera } from '../services/api';

interface CameraFeedProps {
  camera: Camera;
  onSelect?: (camera: Camera) => void;
  showControls?: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ camera, onSelect, showControls = true }) => {
  const [key, setKey] = useState<number>(Date.now());
  const [isHovered, setIsHovered] = useState(false);

  const streamUrl = `/api/v1/stream/${camera.id}?t=${key}`;

  const refreshStream = () => {
    setKey(Date.now());
  };

  return (
    <div 
      className="relative rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-xl group transition-all duration-300 hover:border-cyan-500/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Feed Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3.5 py-2 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-orbitron font-bold text-xs text-white tracking-wide">
            {camera.code}
          </span>
          <span className="text-[11px] text-slate-300 truncate max-w-[160px]">
            {camera.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 rounded">
            AI ACTIVE
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {camera.fps} FPS
          </span>
        </div>
      </div>

      {/* Live Stream MJPEG Image */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        <img
          src={streamUrl}
          alt={`Live Feed ${camera.code}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback placeholder if stream interrupted
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Scanline overlay effect */}
        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

        {/* Dynamic Watermark HUD */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-300">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>YOLOv8 + ByteTrack + RiskEngine</span>
        </div>
      </div>

      {/* Feed Controls Overlay */}
      {showControls && (
        <div className="p-3 bg-defense-900/90 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium truncate">
              {camera.location_name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshStream}
              title="Refresh Stream"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {onSelect && (
              <button
                onClick={() => onSelect(camera)}
                className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-semibold text-xs rounded-lg border border-cyan-500/30 transition-all flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                Inspect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
