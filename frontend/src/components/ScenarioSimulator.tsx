import React, { useState } from 'react';
import { Play, AlertTriangle, ShieldCheck, Users, UserX, Sparkles } from 'lucide-react';
import { triggerThreatSimulation } from '../services/api';

interface ScenarioSimulatorProps {
  onScenarioTriggered?: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ onScenarioTriggered }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>('NIGHT_ISOLATION');

  const scenarios = [
    {
      id: 'NIGHT_ISOLATION',
      name: 'Nighttime Isolated Walk with Pursuit',
      risk: 'CRITICAL (94.5)',
      color: 'from-red-600 to-rose-700 border-red-500',
      icon: UserX,
      desc: 'Isolated woman on secluded street followed closely by an individual with co-aligned velocity vectors.',
    },
    {
      id: 'DISTRESS_POSTURE',
      name: 'Distress / SOS Posture Detected',
      risk: 'CRITICAL (82.0)',
      color: 'from-rose-600 to-pink-700 border-rose-500',
      icon: AlertTriangle,
      desc: 'Rapid posture anomaly: Raised arms / hands up distress gesture recognized by MediaPipe/YOLO keypoints.',
    },
    {
      id: 'SURROUNDING_CROWD',
      name: 'Group Surrounding Encroachment',
      risk: 'CRITICAL (88.5)',
      color: 'from-amber-600 to-orange-700 border-amber-500',
      icon: Users,
      desc: 'Target surrounded by multiple individuals narrowing spatial gap under secluded overhead bridge.',
    },
    {
      id: 'NORMAL',
      name: 'Normal Public Traffic',
      risk: 'LOW (15.0)',
      color: 'from-emerald-600 to-teal-700 border-emerald-500',
      icon: ShieldCheck,
      desc: 'Standard public square foot traffic with normal social distance parameters.',
    },
  ];

  const handleTrigger = async (scenarioId: string) => {
    setLoading(scenarioId);
    setActiveScenario(scenarioId);
    try {
      await triggerThreatSimulation(scenarioId, 'CAM-01');
      if (onScenarioTriggered) onScenarioTriggered();
    } catch (e) {
      console.error('Failed to trigger scenario:', e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl my-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
          AI Threat Scenario Injection Control Panel
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          ACTIVE SCENARIO: <strong className="text-cyan-300">{activeScenario}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = activeScenario === sc.id;
          const isLoading = loading === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => handleTrigger(sc.id)}
              disabled={isLoading}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group ${
                isSelected
                  ? `bg-gradient-to-br ${sc.color} text-white shadow-lg shadow-purple-500/20 ring-2 ring-cyan-400`
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-black/30' : 'bg-slate-800 text-cyan-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-black/40 text-white' : 'bg-slate-800 text-amber-300'
                  }`}>
                    {sc.risk}
                  </span>
                </div>

                <h4 className="font-bold text-xs line-clamp-1 mb-1">
                  {sc.name}
                </h4>
                <p className={`text-[10px] line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                  {sc.desc}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-semibold">
                <span>{isLoading ? 'Injecting Feed...' : 'Inject Scenario'}</span>
                <Play className={`w-3 h-3 ${isSelected ? 'fill-current' : 'text-cyan-400'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
