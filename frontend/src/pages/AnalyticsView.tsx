import React, { useState, useEffect } from 'react';
import { fetchAnalyticsSummary } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, ShieldAlert, Clock, CheckCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsSummary().then((res) => setData(res)).catch(console.error);
  }, []);

  const hourlyData = data?.hourly_distribution || [
    { hour: '00:00', critical: 4, high: 7, medium: 12 },
    { hour: '02:00', critical: 6, high: 9, medium: 15 },
    { hour: '04:00', critical: 3, high: 5, medium: 8 },
    { hour: '06:00', critical: 1, high: 2, medium: 4 },
    { hour: '08:00', critical: 0, high: 1, medium: 3 },
    { hour: '10:00', critical: 0, high: 2, medium: 5 },
    { hour: '12:00', critical: 1, high: 1, medium: 4 },
    { hour: '14:00', critical: 0, high: 3, medium: 6 },
    { hour: '16:00', critical: 2, high: 4, medium: 8 },
    { hour: '18:00', critical: 3, high: 6, medium: 11 },
    { hour: '20:00', critical: 5, high: 10, medium: 18 },
    { hour: '22:00', critical: 8, high: 14, medium: 22 },
  ];

  const factorsData = data?.factors_breakdown || [
    { name: 'Isolated Individual at Night', value: 42 },
    { name: 'Co-aligned Pursuit Motion', value: 28 },
    { name: 'Rapid Proximity Encroachment', value: 18 },
    { name: 'Distress Gesture Identified', value: 12 },
  ];

  const trendData = [
    { day: 'Mon', avgTime: 62 },
    { day: 'Tue', avgTime: 58 },
    { day: 'Wed', avgTime: 51 },
    { day: 'Thu', avgTime: 49 },
    { day: 'Fri', avgTime: 46 },
    { day: 'Sat', avgTime: 44 },
    { day: 'Sun', avgTime: 42 },
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#00E5FF', '#A855F7'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            SPATIO-TEMPORAL ANALYTICAL INTELLIGENCE HUB
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated metrics for security planning & law enforcement deployment
          </p>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Hourly Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-xs uppercase text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              24-Hour Threat Distribution Timeline
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Peak: 22:00 - 02:00</span>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F1F5F9' }} />
                <Legend />
                <Bar dataKey="critical" name="Critical Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high" name="High Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" name="Medium Risk" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Threat Factors Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-xs uppercase text-slate-300 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              AI Threat Factor Attribution Breakdown
            </h3>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={factorsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {factorsData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F1F5F9' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart 3: Response Time Improvement */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-xs uppercase text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Security Response Time Optimization Trend (Seconds)
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono">32% Faster Patrol Dispatch</span>
        </div>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F1F5F9' }} />
              <Line type="monotone" dataKey="avgTime" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
