import React, { useState } from "react";
import {
	CheckCircle,
	AlertCircle,
	Loader2,
	ChevronDown,
	ChevronUp,
	Clock,
	Circle,
} from "lucide-react";

export default function ProcessingStatus({
	status,
	stage,
	totalStages,
	message,
	percent,
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const cleanStatus = (status || "").toLowerCase();
	const isCompleted =
		cleanStatus.includes("completed") || cleanStatus.includes("ready");
	const isFailed =
		cleanStatus.includes("fail") || cleanStatus.includes("error");
	const isProcessing = !isCompleted && !isFailed;

	// Defaults
	const currentStage = stage || 0;
	const maxStages = totalStages || 16;
	const progressPercent = percent || 0;

	// Generate steps array for visualization
	const steps = Array.from({ length: maxStages }, (_, i) => i + 1);

	// Status Colors & Icons
	let statusColor = "bg-blue-600";
	let textColor = "text-blue-600";
	let bgColor = "bg-blue-50";
	let icon = <Loader2 size={16} className="animate-spin text-blue-600" />;

	if (isCompleted) {
		statusColor = "bg-green-600";
		textColor = "text-green-600";
		bgColor = "bg-green-50";
		icon = <CheckCircle size={16} className="text-green-600" />;
	} else if (isFailed) {
		statusColor = "bg-red-600";
		textColor = "text-red-600";
		bgColor = "bg-red-50";
		icon = <AlertCircle size={16} className="text-red-600" />;
	}

	// Helper to format status text
	const prettyStatus = (s) => {
		if (!s) return "Initializing...";
		const formatted = s.replace(/_/g, " ");
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	};

	return (
		<div className="mt-3 w-full">
			{/* Summary Bar */}
			<div
				className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
					isExpanded
						? "bg-gray-50 border-gray-200"
						: "bg-white border-transparent hover:bg-gray-50"
				}`}
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="shrink-0">{icon}</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between mb-1">
						<span
							className={`text-sm font-medium ${textColor} truncate`}
						>
							{message || prettyStatus(status)}
						</span>
						<span className="text-xs text-gray-500 font-mono">
							{isCompleted ? "100%" : `${progressPercent}%`}
						</span>
					</div>

					{/* Mini Progress Bar */}
					<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
						<div
							className={`h-full ${statusColor} transition-all duration-500`}
							style={{
								width: `${isCompleted ? 100 : progressPercent}%`,
							}}
						/>
					</div>
				</div>

				<button className="text-gray-400 hover:text-gray-600 transition-colors">
					{isExpanded ? (
						<ChevronUp size={16} />
					) : (
						<ChevronDown size={16} />
					)}
				</button>
			</div>

			{/* Expanded Chain Details */}
			{isExpanded && (
				<div className="px-3 pb-3 pt-2 bg-gray-50 border-x border-b border-gray-200 rounded-b-lg -mt-1 animate-in slide-in-from-top-1 fade-in duration-200">
					<div className="mt-2 space-y-2">
						<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
							Processing Steps ({currentStage} of {maxStages})
						</p>

						{/* Horizontal Stepper Chain */}
						<div className="flex items-center justify-between relative">
							{/* Connection Line */}
							<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-0 translate-y-[-50%]" />

							{/* Dots */}
							{steps.map((stepNum) => {
								let stepStatus = "pending"; // default
								if (isCompleted || stepNum < currentStage)
									stepStatus = "completed";
								else if (
									stepNum === currentStage &&
									isProcessing
								)
									stepStatus = "current";
								else if (stepNum === currentStage && isFailed)
									stepStatus = "failed";

								return (
									<div
										key={stepNum}
										className="relative z-10 group"
									>
										<div
											title={`Step ${stepNum}`}
											className={`w-3 h-3 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
												stepStatus === "completed"
													? "bg-green-600 border-green-600"
													: stepStatus === "current"
														? "bg-blue-600 border-blue-600 scale-125 ring-4 ring-blue-100"
														: stepStatus ===
															  "failed"
															? "bg-red-600 border-red-600"
															: "bg-white border-gray-300"
											}`}
										>
											{/* Optional check icon inside tiny dot? Too small. Just color code. */}
										</div>

										{/* Tooltip on hover if needed, or if it's the current one show label */}
										{stepStatus === "current" && (
											<div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
												Current
											</div>
										)}
									</div>
								);
							})}
						</div>

						{/* Detailed current step info */}
						{isProcessing && (
							<div className="mt-4 p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
								<Loader2
									size={14}
									className="animate-spin shrink-0 mt-0.5"
								/>
								<div>
									<span className="font-semibold block">
										In Progress: Step {currentStage}
									</span>
									<span className="opacity-80 ">
										{message}
									</span>
								</div>
							</div>
						)}
						{isFailed && (
							<div className="mt-4 p-3 bg-red-50/50 rounded border border-red-100 text-xs text-red-800 flex items-start gap-2">
								<AlertCircle
									size={14}
									className="shrink-0 mt-0.5"
								/>
								<div>
									<span className="font-semibold block">
										Failed at Step {currentStage}
									</span>
									<span className="opacity-80 ">
										{message}
									</span>
								</div>
							</div>
						)}
						{isCompleted && (
							<div className="mt-4 p-3 bg-green-50/50 rounded border border-green-100 text-xs text-green-800 flex items-start gap-2">
								<CheckCircle
									size={14}
									className="shrink-0 mt-0.5"
								/>
								<div>
									<span className="font-semibold block">
										Processing Complete
									</span>
									<span className="opacity-80 ">
										Document is ready for analysis.
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
