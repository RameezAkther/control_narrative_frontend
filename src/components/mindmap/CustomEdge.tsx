import React from "react";
import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getBezierPath,
} from "reactflow";

export default function CustomEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	label,
}: EdgeProps) {
	/* ---------------- PATH ---------------- */

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	/* ---------------- COLOR ---------------- */

	const edgeColor = style.stroke?.toString() || "#64748b"; // slate-500

	/* ---------------- RENDER ---------------- */

	return (
		<>
			{/* MAIN EDGE */}
			<BaseEdge
				path={edgePath}
				markerEnd={markerEnd}
				style={{
					...style,
					strokeWidth: 2,
				}}
			/>

			{/* MOVING PACKET */}
			<circle r="4" fill={edgeColor}>
				<animateMotion
					dur="2s"
					repeatCount="indefinite"
					path={edgePath}
				/>
			</circle>

			{/* LABEL CHIP */}
			{label && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							pointerEvents: "all",
						}}
						className="nodrag nopan"
					>
						<div
							className="
                relative
                px-2.5 py-1
                rounded-lg
                border
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                transition
                overflow-hidden
                cursor-pointer
              "
							style={{
								backgroundColor: "#ffffff",   // SOLID SURFACE
								borderColor: edgeColor,
								color: edgeColor,
							}}
						>
							{/* STATE LAYER */}
							<div
								className="absolute inset-0 opacity-0 hover:opacity-100 transition"
								style={{
									backgroundColor: "#0000000d", // subtle neutral overlay
								}}
							/>

							<span className="relative">{label}</span>
						</div>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
}
