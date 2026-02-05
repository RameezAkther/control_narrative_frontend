import React from "react";

/* -------------------------------------------------------------------------- */
/* 1. PROPERTY GRID                                                           */
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
				<div
					key={idx}
					className="p-3 rounded-xl bg-slate-50 border border-slate-200"
				>
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
/* 2. INFO SECTION                             */
/* -------------------------------------------------------------------------- */

interface InfoSectionProps {
	description: string;
}

export const InfoSection = ({ description }: InfoSectionProps) => {
	if (!description) return null;
	return (
		<div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
			<span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mb-1">
				Description
			</span>
			<p className="text-sm text-slate-700 leading-relaxed font-medium">
				{description}
			</p>
		</div>
	);
};
