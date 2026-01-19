import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Lightbulb, 
  Filter 
} from "lucide-react";

export default function ValidationReportView({ data }) {
  const issues = data?.issues || [];
  const errorCount = issues.filter(i => i.severity?.toLowerCase() === 'error').length;
  const warningCount = issues.filter(i => i.severity?.toLowerCase() === 'warning').length;
  const isValid = data?.is_valid ?? (errorCount === 0);

  if (issues.length === 0 && isValid) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Validation Passed</h3>
        <p className="text-gray-500 mt-2 max-w-md">
          No logic errors or warnings were found. The system specifications appear robust and complete.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Status Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Status Card */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-sm ${
          isValid 
            ? "bg-green-50 border-green-100" 
            : "bg-white border-gray-200"
        }`}>
          <div className={`p-3 rounded-full ${
            isValid ? "bg-green-200 text-green-700" : "bg-red-100 text-red-600"
          }`}>
            {isValid ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">System Status</p>
            <h2 className={`text-xl font-bold ${isValid ? "text-green-700" : "text-gray-900"}`}>
              {isValid ? "Valid Configuration" : "Issues Detected"}
            </h2>
          </div>
        </div>

        {/* Error Metric */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Critical Errors</p>
            <h2 className="text-2xl font-bold text-gray-900">{errorCount}</h2>
          </div>
        </div>

        {/* Warning Metric */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Warnings</p>
            <h2 className="text-2xl font-bold text-gray-900">{warningCount}</h2>
          </div>
        </div>
      </div>

      {/* 2. Issue List */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider px-1">
          <Filter size={16} /> Detailed Report
        </h3>
        
        {issues.map((issue, index) => (
          <IssueCard key={index} issue={issue} />
        ))}
      </div>
    </div>
  );
}

function IssueCard({ issue }) {
  const isError = issue.severity?.toLowerCase() === 'error';
  
  return (
    <div className={`group bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
      isError ? "border-red-200" : "border-amber-200"
    }`}>
      <div className="flex flex-col md:flex-row">
        {/* Left Color Strip */}
        <div className={`w-full md:w-1.5 h-1 md:h-auto ${isError ? "bg-red-500" : "bg-amber-400"}`} />
        
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isError ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 uppercase">
                    <XCircle size={10} /> Error
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                    <AlertTriangle size={10} /> Warning
                  </span>
                )}
                <span className="text-xs text-gray-400 font-mono">• {issue.loop_name}</span>
              </div>
              <h4 className="text-gray-900 font-medium leading-snug">
                {issue.message}
              </h4>
            </div>
          </div>

          {/* Actionable Suggestion Box */}
          <div className="mt-4 bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex gap-3">
            <Lightbulb size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <span className="font-semibold block text-blue-700 text-xs uppercase mb-0.5">Recommendation</span>
              {issue.suggestion}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}