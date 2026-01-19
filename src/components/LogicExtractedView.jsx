import React from 'react';
import { 
  Activity, 
  ArrowRight, 
  Cpu, 
  Radio, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Layers 
} from "lucide-react";

export default function LogicExtractedView({ data }) {
  const loops = data?.loops || [];

  if (loops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
        <Layers size={48} className="mb-4 opacity-50" />
        <p>No control logic found in this artifact.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loops.map((loop, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{loop.loop_name || "Unnamed Loop"}</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {loop.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* 1. Hardware I/O Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Inputs / Sensors */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Radio size={14} /> Inputs (Sensors)
                </h4>
                {loop.inputs.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
                    {loop.inputs.map((input, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{input.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{input.role}</p>
                        </div>
                        <span className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-mono rounded-md shadow-sm">
                          {input.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic px-2">No inputs defined.</div>
                )}
              </div>

              {/* Outputs / Actuators */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Zap size={14} /> Outputs (Actuators)
                </h4>
                {loop.outputs.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
                    {loop.outputs.map((output, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{output.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{output.role}</p>
                        </div>
                        <span className="px-2 py-1 bg-white border border-gray-200 text-blue-600 text-xs font-mono rounded-md shadow-sm">
                          {output.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic px-2">No outputs defined.</div>
                )}
              </div>
            </div>

            {/* 2. Logic / Interlocks Section */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <Cpu size={14} /> Logic & Interlocks
              </h4>
              
              {loop.interlocks.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-medium w-1/3">Condition (IF)</th>
                        <th className="px-4 py-3 font-medium w-1/3">Action (THEN)</th>
                        <th className="px-4 py-3 font-medium w-1/6 text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loop.interlocks.map((lock, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 align-top text-gray-700">
                            <div className="flex gap-2">
                              <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-orange-400" />
                              <span>{lock.condition}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-gray-700">
                            <div className="flex gap-2 text-gray-900 font-medium">
                              <ArrowRight size={16} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>{lock.action}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top text-right">
                            <BadgeType type={lock.type} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-400 italic text-center">
                  No explicit logic conditions found.
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper component for logic type badges
function BadgeType({ type }) {
  const t = type?.toLowerCase() || "";
  
  if (t === 'safety') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
        <AlertTriangle size={10} /> Safety
      </span>
    );
  }
  
  if (t === 'process') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
        <Activity size={10} /> Process
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
      {type || "General"}
    </span>
  );
}