import React, { useEffect, useState } from "react";
import type { Node, Edge } from "reactflow";
import { AlertCircle, Loader2, FileJson } from "lucide-react";

// --- Types ---
interface SystemData {
	nodes: Node[];
	edges: Edge[];
}

interface ControlSystemLoaderProps {
	dataSourceUrl: string;
	children: (data: SystemData) => React.ReactNode;
}

// --- Validator ---
class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SchemaValidationError";
	}
}

const validateSystemData = (data: any): SystemData => {
	if (!data || typeof data !== "object") {
		throw new ValidationError("Invalid JSON: Root must be an object.");
	}

	if (!Array.isArray(data.nodes)) {
		throw new ValidationError("Invalid Schema: Missing 'nodes' array.");
	}

	if (!Array.isArray(data.edges)) {
		throw new ValidationError("Invalid Schema: Missing 'edges' array.");
	}

	// Node Validation
	data.nodes.forEach((node: any, index: number) => {
		if (!node.id)
			throw new ValidationError(`Node at index ${index} missing 'id'.`);
		if (!node.data)
			throw new ValidationError(
				`Node '${node.id}' missing 'data' object.`,
			);
		if (!node.type)
			throw new ValidationError(`Node '${node.id}' missing 'type'.`);
	});

	// Edge Validation
	data.edges.forEach((edge: any, index: number) => {
		if (!edge.id)
			throw new ValidationError(`Edge at index ${index} missing 'id'.`);
		if (!edge.source)
			throw new ValidationError(`Edge '${edge.id}' missing 'source'.`);
		if (!edge.target)
			throw new ValidationError(`Edge '${edge.id}' missing 'target'.`);
	});

	return data as SystemData;
};

// --- Component ---
export const ControlSystemLoader: React.FC<ControlSystemLoaderProps> = ({
	dataSourceUrl,
	children,
}) => {
	const [data, setData] = useState<SystemData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// 1. Fetch
				const token = localStorage.getItem("token");
				const headers: Record<string, string> = {};
				if (token) {
					headers["Authorization"] = `Bearer ${token}`;
				}

				const response = await fetch(dataSourceUrl, { headers });
				if (!response.ok) {
					throw new Error(
						`Failed to load config: ${response.statusText}`,
					);
				}

				const rawData = await response.json();

				// 2. Validate
				const validData = validateSystemData(rawData);

				// 3. Success
				// Slight artificial delay to show off the loading state (optional)
				setTimeout(() => {
					setData(validData);
					setIsLoading(false);
				}, 500);
			} catch (err: any) {
				setIsLoading(false);
				setError(err.message || "Unknown error occurred");
			}
		};

		fetchData();
	}, [dataSourceUrl]);

	// --- Render States ---

	if (isLoading) {
		return (
			<div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3">
				<Loader2 className="w-10 h-10 animate-spin text-blue-500" />
				<p className="text-sm font-semibold tracking-wide uppercase animate-pulse">
					Initializing System...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-screen h-screen flex items-center justify-center bg-rose-50 p-4">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center">
					<div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="w-8 h-8" />
					</div>
					<h2 className="text-xl font-bold text-slate-800 mb-2">
						Configuration Error
					</h2>
					<p className="text-slate-500 text-sm mb-6">
						The system could not load the control logic definition.
					</p>

					<div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-left mb-6">
						<div className="flex items-center gap-2 text-rose-700 font-mono text-xs font-bold uppercase mb-1">
							<FileJson className="w-3 h-3" /> Error Details
						</div>
						<code className="text-xs text-rose-800 break-words font-mono">
							{error}
						</code>
					</div>

					<button
						onClick={() => window.location.reload()}
						className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors text-sm"
					>
						Retry Connection
					</button>
				</div>
			</div>
		);
	}

	if (!data) return null;

	return <>{children(data)}</>;
};
