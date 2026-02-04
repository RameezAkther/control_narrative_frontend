import React, { useState } from "react";
import {
	Activity,
	Zap,
	AlertTriangle,
	Settings,
	ChevronDown,
	Sliders,
} from "lucide-react";
import {
	PropertyGrid,
	ActionRow,
	ToggleRow,
	Sparkline,
} from "./ControlNodeWidgets";

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
		minValue?: number;
		maxValue?: number;
		narrativeRef?: string;
		properties?: { label: string; value: string | number }[];
		actions?: {
			label: string;
			type: "primary" | "danger" | "neutral";
			icon?: "play" | "stop" | "reset" | "ack";
		}[];
		toggles?: { label: string; checked: boolean }[];
		trendData?: number[];
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
	onToggleExpand?: () => void;
}

export const ControlNode: React.FC<ControlNodeProps> = ({
	data,
	onToggleExpand,
}) => {
	const [expanded, setExpanded] = useState(false);
	const [simValue, setSimValue] = useState(data.currentValue || 50);

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		setExpanded(!expanded);
		if (onToggleExpand) onToggleExpand();
	};

	return (
		<div
			className={`
        relative w-[320px] rounded-md border transition-all duration-300
        /* EXPANDED STATE STYLING */
        ${expanded ? "bg-white border-blue-400 shadow-2xl scale-[1.02] z-50" : "bg-white border-slate-200 shadow-sm z-0"}
      `}
			style={{ height: "fit-content" }}
		>
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
										{simValue} {data.meta.unit}
									</span>
								)}
							</p>
						</div>
					</div>
					<StatusChip status={data.status} />
				</div>
				<div
					className={`flex justify-center mt-2 transition-opacity duration-300 ${expanded ? "opacity-0" : "opacity-100"}`}
				>
					<ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
				</div>
			</button>
			<div
				style={{
					maxHeight: expanded ? "1200px" : "0px",
					opacity: expanded ? 1 : 0,
					overflow: "hidden",
					transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
				}}
			>
				<div className="bg-slate-50 p-6 space-y-5 border-t border-slate-100 rounded-b-[24px]">
					{data.meta.unit && (
						<div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
							<div className="flex justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
								<span className="flex items-center gap-1.5">
									<Sliders className="w-3 h-3" /> Simulate
								</span>
								<span className="text-blue-600">
									{simValue} {data.meta.unit}
								</span>
							</div>
							<input
								type="range"
								className="w-full h-1.5 rounded-full bg-slate-100 appearance-none accent-blue-500 cursor-pointer"
								min={data.meta.minValue || 0}
								max={data.meta.maxValue || 100}
								value={simValue}
								onChange={(e) =>
									setSimValue(Number(e.target.value))
								}
							/>
						</div>
					)}
					<ActionRow
						actions={
							data.meta.actions?.map((a) => ({
								...a,
								onClick: () => console.log("Action:", a.label),
							})) || []
						}
					/>
					<ToggleRow
						toggles={
							data.meta.toggles?.map((t) => ({
								...t,
								onToggle: () => console.log("Toggle:", t.label),
							})) || []
						}
					/>
					<PropertyGrid items={data.meta.properties || []} />
					<Sparkline data={data.meta.trendData || []} />
				</div>
			</div>
		</div>
	);
};
