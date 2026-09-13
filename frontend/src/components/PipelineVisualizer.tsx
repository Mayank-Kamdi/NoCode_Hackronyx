import React from 'react';
import { Camera, UserCheck, ShieldAlert, Cpu, Activity, Send, Smartphone, Database, BarChart3, ChevronRight } from 'lucide-react';

export const PipelineVisualizer: React.FC = () => {
  const steps = [
    { id: 1, name: 'CCTV / Edge AI', icon: Camera, status: 'Ingesting 1080p RTSP Stream' },
    { id: 2, name: 'Person Detect', icon: UserCheck, status: 'YOLOv8 Silhouette Model' },
    { id: 3, name: 'Multi-Object Track', icon: Activity, status: 'ByteTrack Trajectory Vectors' },
    { id: 4, name: 'Context Analysis', icon: Cpu, status: 'Isolation & Proximity Encroachment' },
    { id: 5, name: 'Risk Engine', icon: ShieldAlert, status: 'Dynamic Threat Score (0-100)' },
    { id: 6, name: 'FastAPI Gateway', icon: Send, status: 'WSS Broadcast Gateway' },
    { id: 7, name: 'Security Client', icon: Smartphone, status: 'Audio-Visual Responder Dispatch' },
    { id: 8, name: 'Incident DB & Heatmap', icon: Database, status: 'Spatio-Temporal Hotspot Engine' },
  ];

  return (
    <div className="w-full glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl my-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          End-to-End AI Threat Processing & Dispatch Pipeline
        </h3>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
          LATENCY: &lt;45ms
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative group">
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all">
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 mb-1.5 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-white line-clamp-1">
                  {step.name}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">
                  {step.status}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ChevronRight className="w-4 h-4 text-cyan-500/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
