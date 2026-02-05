import dagre from "dagre";
import { type Node, type Edge, Position } from "reactflow";

// Configuration: Adjust these to fit your Card size
const NODE_WIDTH = 320; // Card width + padding (Matched to ControlNode w-[320px])
const NODE_HEIGHT = 100; // Card height estimate
const RANK_SEP = 150; // Vertical gap between layers
const NODE_SEP = 150; // Horizontal gap between nodes

export const getLayoutedElements = (
	nodes: Node[],
	edges: Edge[],
	direction = "TB",
) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({
		rankdir: direction,
		ranksep: RANK_SEP,
		nodesep: NODE_SEP,
	});

	nodes.forEach((node) => {
		// Use measured dimensions if available, otherwise fallback to estimates
		const width = node.width || NODE_WIDTH;
		const height = node.height || NODE_HEIGHT;

		dagreGraph.setNode(node.id, { width, height });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	const layoutedNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const width = node.width || NODE_WIDTH;
		const height = node.height || NODE_HEIGHT;

		// Set handle positions based on layout direction
		// Vertical (TB): Top -> Bottom
		// Horizontal (LR): Left -> Right
		const targetPosition = isHorizontal ? Position.Left : Position.Top;
		const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

		return {
			...node,
			targetPosition,
			sourcePosition,
			// Shift dagre's center-anchor to React Flow's top-left anchor
			position: {
				x: nodeWithPosition.x - width / 2,
				y: nodeWithPosition.y - height / 2,
			},
		};
	});

	return { nodes: layoutedNodes, edges };
};
