import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	ConnectionMode,
	useNodesState,
	useEdgesState,
	addEdge,
	type Connection,
	type Node,
	type Edge,
	type NodeTypes,
	type EdgeTypes,
	type ReactFlowProps,
	Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { ArrowDown, ArrowRight } from "lucide-react"; // Icons for layout button

import GraphNode from "./GraphNode";
import CustomEdge from "./CustomEdge";
import { getLayoutedElements } from "./LayoutEngine";

export interface MindMapProps {
	initialNodes: Node[];
	initialEdges: Edge[];
	title?: string;
	subTitle?: string;
	nodeTypes?: NodeTypes;
	edgeTypes?: EdgeTypes;
	className?: string;
	flowProps?: Omit<
		ReactFlowProps,
		"nodes" | "edges" | "onNodesChange" | "onEdgesChange" | "onConnect"
	>;
}

const MindMap: React.FC<MindMapProps> = ({
	initialNodes,
	initialEdges,
	title = "System Logic Map",
	subTitle = "Control Narrative Visualization",
	nodeTypes: userNodeTypes,
	edgeTypes: userEdgeTypes,
	className = "w-screen h-screen",
	flowProps,
}) => {
	// Layout State
	const [direction, setDirection] = useState<"TB" | "LR">("TB");
	const [rfInstance, setRfInstance] = useState<any>(null);

	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	// 1. Memoize custom types
	const nodeTypes = useMemo<NodeTypes>(
		() => ({ custom: GraphNode, ...userNodeTypes }),
		[userNodeTypes],
	);
	const edgeTypes = useMemo<EdgeTypes>(
		() => ({ packetEdge: CustomEdge, ...userEdgeTypes }),
		[userEdgeTypes],
	);

	// 2. Initial Data Load & Layout
	useEffect(() => {
		// Perform initial layout with estimates so nodes don't stack at 0,0
		const { nodes: layoutedNodes, edges: layoutedEdges } =
			getLayoutedElements(initialNodes, initialEdges, direction);
		setNodes(layoutedNodes);
		setEdges(layoutedEdges);
	}, [initialNodes, initialEdges, direction, setNodes, setEdges]);

	// 3. Dynamic Layout Effect (Debounced to avoid thrashing)
	// We track the last known dimensions to only trigger layout when sizes actually change
	const lastDimensions = React.useRef<
		Record<string, { w: number; h: number }>
	>({});

	useEffect(() => {
		const timer = setTimeout(() => {
			if (nodes.length === 0) return;

			let hasDimensionChange = false;
			const currentDimensions: Record<string, { w: number; h: number }> =
				{};
			let allMeasured = true;

			for (const node of nodes) {
				const w = node.width;
				const h = node.height;

				// If any node is not yet measured, we might want to wait, or layout with what we have
				if (w === undefined || h === undefined) {
					allMeasured = false;
				}

				if (w && h) {
					currentDimensions[node.id] = { w, h };
					const last = lastDimensions.current[node.id];
					// Check for significant change (>1px)
					if (
						!last ||
						Math.abs(last.w - w) > 2 ||
						Math.abs(last.h - h) > 2
					) {
						hasDimensionChange = true;
					}
				}
			}

			// If we have nodes and dimensions changed (or first run and we have some measurements)
			// We trigger layout.
			// Also checking if we have *some* dimensions helps avoid layout on empty unmeasured nodes
			if (
				hasDimensionChange &&
				Object.keys(currentDimensions).length > 0
			) {
				console.log(
					"Triggering Layout Update due to dimension variance",
				);
				lastDimensions.current = currentDimensions;

				const { nodes: layoutedNodes, edges: layoutedEdges } =
					getLayoutedElements(
						nodes,
						edges, // Use current edges
						direction,
					);

				setNodes(layoutedNodes);
				// We don't necessarily need to set edges if they didn't change, but dagre might add points?
				// LayoutEngine currently returns same edges object, so it's fine.
				setEdges(layoutedEdges);

				// Optional: Fit view after layout change
				if (rfInstance) {
					window.requestAnimationFrame(() => {
						rfInstance.fitView({ padding: 0.2, duration: 800 });
					});
				}
			}
		}, 100); // 100ms debounce

		return () => clearTimeout(timer);
	}, [nodes, edges, direction, setNodes, setEdges, rfInstance]);

	// 4. Layout Toggle Handler
	const onLayoutToggle = useCallback(() => {
		setDirection((curr) => {
			const next = curr === "TB" ? "LR" : "TB";
			// Force layout update next cycle
			lastDimensions.current = {};
			return next;
		});
	}, []);

	const onConnect = useCallback(
		(params: Connection) => {
			const newEdge = {
				...params,
				type: "packetEdge",
				animated: true,
				style: { stroke: "#64748b", strokeWidth: 2 },
			};
			setEdges((eds) => addEdge(newEdge, eds));
		},
		[setEdges],
	);

	return (
		<div className={`bg-[#f0f4f8] relative ${className}`}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				connectionMode={ConnectionMode.Loose}
				onInit={setRfInstance}
				fitView
				{...flowProps}
			>
				<Background color="#cbd5e1" gap={24} size={2} />
				<Controls className="bg-white border-slate-200 shadow-md rounded-lg text-slate-600" />
				<MiniMap
					nodeColor="#94a3b8"
					maskColor="rgba(240, 244, 248, 0.7)"
					className="border-slate-200 shadow-md rounded-lg overflow-hidden"
				/>

				{/* Layout Toolbar */}
				<Panel
					position="top-right"
					className="bg-white p-2 rounded-lg shadow-md border border-slate-200"
				>
					<button
						onClick={onLayoutToggle}
						className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
						title="Toggle Layout Direction"
					>
						{direction === "TB" ? (
							<>
								<ArrowDown className="w-4 h-4" /> Vertical
							</>
						) : (
							<>
								<ArrowRight className="w-4 h-4" /> Horizontal
							</>
						)}
					</button>
				</Panel>
			</ReactFlow>
		</div>
	);
};

export default MindMap;
