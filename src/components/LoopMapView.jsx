import React from 'react';
import { 
  GitMerge, 
  Activity, 
  AlertTriangle, 
  Settings, 
  ArrowRight,
  Workflow,
  Map as MapIcon 
} from "lucide-react";

export default function LoopMapView({ data }) {
  const mappings = data?.mappings || [];

  if (mappings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
        <MapIcon size={48} className="mb-4 opacity-50" />
        <p>No loop mappings found in this artifact.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {mappings.map((mapItem, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
          
          {/* Left Side: Meta Info & Status */}
          <div className="md:w-1/4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {mapItem.loop_name || "Unnamed Loop"}
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                <CriticalityBadge level={mapItem.criticality} />
                <StrategyBadge type={mapItem.strategy_type} />
              </div>
            </div>
            
            {/* Strategy Icon Visual */}
            <div className="mt-auto hidden md:flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Settings size={14} />
              <span>ID: LP-{String(index + 1).padStart(3, '0')}</span>
            </div>
          </div>

          {/* Right Side: Topology Description */}
          <div className="flex-1 flex flex-col justify-center">
             <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
               <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                 <Workflow size={14} /> Topology Flow
               </h4>
               <p className="text-gray-700 text-sm leading-relaxed">
                 {mapItem.topology_description || "No topology description available."}
               </p>
             </div>

             {/* Simple Visualization of Flow (Decorative) */}
             <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">Inputs</span>
                <ArrowRight size={14} />
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 font-medium">
                  {mapItem.strategy_type}
                </span>
                <ArrowRight size={14} />
                <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">Outputs</span>
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}

// Helper: Criticality Badge
function CriticalityBadge({ level }) {
  const l = level?.toLowerCase() || "";
  
  if (l === 'high' || l === 'critical') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
        <AlertTriangle size={12} /> High Criticality
      </span>
    );
  }
  if (l === 'medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
        <Activity size={12} /> Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
      <GitMerge size={12} /> Low / Standard
    </span>
  );
}

// Helper: Strategy Badge
function StrategyBadge({ type }) {
  const t = type?.toLowerCase() || "";

  let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
  
  if (t.includes("pid")) colorClass = "bg-blue-50 text-blue-700 border-blue-100";
  else if (t.includes("sequence") || t.includes("on/off")) colorClass = "bg-purple-50 text-purple-700 border-purple-100";
  else if (t.includes("safety") || t.includes("interlock")) colorClass = "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      {type || "Unknown Strategy"}
    </span>
  );
}