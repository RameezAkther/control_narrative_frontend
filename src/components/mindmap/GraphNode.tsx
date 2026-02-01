import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { ControlNode, type ControlNodeData } from "./ControlNode";

// GraphNode now accepts dynamic position props from the layout engine
const GraphNode = ({
	data,
	sourcePosition = Position.Bottom,
	targetPosition = Position.Top,
}: NodeProps<ControlNodeData>) => {
	return (
		<div className="relative group">
			{/* Target Handle (Incoming) */}
			<Handle
				type="target"
				position={targetPosition}
				className="w-3 h-3 bg-slate-400 border-2 border-white transition-all duration-300 z-10"
			/>

			{/* Main Node UI */}
			<ControlNode data={data} />

			{/* Source Handle (Outgoing) */}
			<Handle
				type="source"
				position={sourcePosition}
				className="w-3 h-3 bg-blue-500 border-2 border-white transition-all duration-300 z-10"
			/>
		</div>
	);
};

export default memo(GraphNode);
