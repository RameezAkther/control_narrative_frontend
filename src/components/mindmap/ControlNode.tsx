import React, { useState } from "react";
import {
	Activity,
	Zap,
	AlertTriangle,
	Settings,
	ChevronDown,
} from "lucide-react";
// IMPORTS: Connecting to the file you just shared
import { PropertyGrid, InfoSection } from "./ControlNodeWidgets";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type NodeType = "EQUIPMENT" | "LOGIC" | "SENSOR" | "PID";

export interface ControlNodeData {
	id: string;
	type: NodeType;
	label: string;
	status: "active" | "inactive" | "fault";
	currentValue?: number;
	meta: {
		unit?: string;
		description?: string;
		minValue?: number;
		maxValue?: number;
		narrativeRef?: string;
		// Arrays matching your Widgets file interfaces
		properties?: { label: string; value: string | number }[];
	};
}

/* -------------------------------------------------------------------------- */
/* HELPER COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

const NodeIcon = ({ type }: { type: NodeType }) => {
	const styles = {
		EQUIPMENT: "bg-blue-100 text-blue-700",
		LOGIC: "bg-amber-100 text-amber-700",
		SENSOR: "bg-purple-100 text-purple-700",
		PID: "bg-slate-200 text-slate-700",
	};
	const Icon =
		{
			EQUIPMENT: Activity,
			LOGIC: Zap,
			SENSOR: AlertTriangle,
			PID: Settings,
		}[type] || Activity;

	return (
		<div
			className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${styles[type]}`}
		>
			<Icon className="w-6 h-6" strokeWidth={2} />
		</div>
	);
};

const StatusChip = ({ status }: { status: ControlNodeData["status"] }) => {
	const styles = {
		active: "bg-emerald-100 text-emerald-800",
		inactive: "bg-slate-100 text-slate-500",
		fault: "bg-rose-100 text-rose-800 animate-pulse",
	};
	return (
		<div
			className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}
		>
			{status}
		</div>
	);
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

interface ControlNodeProps {
	data: ControlNodeData;
	onToggleExpand?: () => void; // Required for React Flow handle updates
}

export const ControlNode: React.FC<ControlNodeProps> = ({
	data,
	onToggleExpand,
}) => {
	const [expanded, setExpanded] = useState(false);

	// Toggle Handler
	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation(); // Stop React Flow from selecting the node on click
		setExpanded(!expanded);
		if (onToggleExpand) onToggleExpand(); // Notify parent to move handles
	};

	return (
		<div
			className={`
        relative w-[320px] rounded-md border transition-all duration-300
        /* EXPANDED STATE STYLING */
        ${expanded ? "bg-white border-blue-400 shadow-2xl scale-[1.02] z-50" : "bg-white border-slate-200 shadow-sm z-0"}
      `}
			style={{ height: "fit-content" }} // Force container to fit content
		>
			{/* 1. HEADER (Always Visible) */}
			<button
				onClick={handleToggle}
				className="w-full text-left p-5 focus:outline-none relative group"
			>
				<div className="relative flex items-start justify-between gap-4">
					<div className="flex gap-4 items-center min-w-0">
						<NodeIcon type={data.type} />
						<div className="min-w-0">
							<h3 className="text-base font-bold text-slate-800 truncate">
								{data.label}
							</h3>
							<p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-2">
								{data.id}
								{data.meta?.unit && (
									<span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
										{data.currentValue} {data.meta.unit}
									</span>
								)}
							</p>
						</div>
					</div>
					<StatusChip status={data.status} />
				</div>

				{/* Chevron Animation */}
				<div
					className={`flex justify-center mt-2 transition-opacity duration-300 ${expanded ? "opacity-0" : "opacity-100"}`}
				>
					<ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
				</div>
			</button>

			{/* 2. EXPANDABLE BODY (The Fix) */}
			<div
				style={{
					// INLINE STYLES OVERRIDE TAILWIND CONFLICTS
					maxHeight: expanded ? "1200px" : "0px",
					opacity: expanded ? 1 : 0,
					overflow: "hidden", // Critical to hide content when collapsed
					transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
				}}
			>
				{/* UPDATED CONTAINER:
            1. bg-slate-50: Slight contrast against white header
            2. rounded-b-[24px]: Matches the parent card curve
            3. p-6: Increased padding for comfort
        */}
				<div className="bg-slate-50 p-6 space-y-5 border-t border-slate-100 rounded-b-[24px]">
					{/* WIDGETS FROM YOUR FILE */}
					<PropertyGrid items={data.meta.properties || []} />
					<InfoSection description={data.meta.description || ""} />
				</div>
			</div>
		</div>
	);
};
