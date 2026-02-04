import React from 'react';
import { Play, Square, RotateCcw, CheckCircle, Activity } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. PROPERTY GRID                            */
/* -------------------------------------------------------------------------- */
// Use this for: Setpoints, Capacities, Timers, Counters, Last Maintenance Dates

interface PropertyItem {
  label: string;
  value: string | number;
}

export const PropertyGrid = ({ items }: { items: PropertyItem[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, idx) => (
        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">
            {item.label}
          </span>
          <div className="text-sm font-semibold text-slate-700 break-words">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. ACTION ROW                               */
/* -------------------------------------------------------------------------- */
// Use this for: Start/Stop Commands, Resetting Accumulators, Acknowledging Alarms

interface ActionButton {
  label: string;
  type: 'primary' | 'danger' | 'neutral';
  icon?: 'play' | 'stop' | 'reset' | 'ack';
  onClick?: () => void;
}

export const ActionRow = ({ actions }: { actions: ActionButton[] }) => {
  if (!actions || actions.length === 0) return null;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'play': return <Play className="w-3 h-3" />;
      case 'stop': return <Square className="w-3 h-3" />;
      case 'reset': return <RotateCcw className="w-3 h-3" />;
      case 'ack': return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
      case 'danger': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200';
    }
  };

  return (
    <div className="flex gap-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors
            ${getStyles(action.type)}
          `}
        >
          {getIcon(action.icon)}
          {action.label}
        </button>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. TOGGLE ROW                               */
/* -------------------------------------------------------------------------- */
// Use this for: Auto/Manual Mode, Enable/Disable, Interlock Bypasses

interface ToggleItem {
  label: string;
  checked: boolean;
  onToggle?: () => void;
}

export const ToggleRow = ({ toggles }: { toggles: ToggleItem[] }) => {
  if (!toggles || toggles.length === 0) return null;

  return (
    <div className="space-y-2">
      {toggles.map((toggle, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-slate-600">{toggle.label}</span>
          <button
            onClick={toggle.onToggle}
            className={`
              relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none
              ${toggle.checked ? 'bg-emerald-500' : 'bg-slate-300'}
            `}
          >
            <span
              className={`
                absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ease-in-out
                ${toggle.checked ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. SPARKLINE                                */
/* -------------------------------------------------------------------------- */
// Use this for: Recent history (Pump Speed last 10 mins, Pressure trend)

export const Sparkline = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;

  // Generate SVG path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Recent Trend</span>
      </div>
      <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Fill Area */}
        <path d={`M0,${height} L0,${height} ${points} L${width},${height} Z`} fill={color} fillOpacity="0.1" />
        {/* Stroke Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};