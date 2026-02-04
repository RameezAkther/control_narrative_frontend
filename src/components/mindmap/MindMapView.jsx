import React, { useEffect, useState } from "react";
import {
	Copy,
	ChevronRight,
	ChevronLeft,
	Layers,
	AlertCircle,
} from "lucide-react";
import { ControlSystemLoader } from "./ControlSystemLoader";
import MindMap from "./MindMap";
import { getDocumentArtifact } from "../../api/documents";

// NOTE: We assume `data` prop passed from DocumentDetails is the "index" file (list of loops)
// OR we fetch it ourselves if `activeTab` logic in DocumentDetails handles fetching "mindmaps_index"
// when the tab is clicked.
// Based on the backend implementation, fetching "mindmaps_index" returns: { mappings: [{name, file}, ...] }

const MindMapView = ({ documentId, isFullWidth = false }) => {
	const [loops, setLoops] = useState([]);
	const [selectedLoop, setSelectedLoop] = useState(null);
	const [isMenuOpen, setIsMenuOpen] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch the index of mindmaps
	useEffect(() => {
		const fetchIndex = async () => {
			try {
				setLoading(true);
				// We ask for the "mindmaps_index" artifact
				const res = await getDocumentArtifact(
					documentId,
					"mindmaps_index",
				);
				if (res.data && res.data.mappings) {
					setLoops(res.data.mappings);
					// Select first loop by default if available
					if (res.data.mappings.length > 0) {
						setSelectedLoop(res.data.mappings[0]);
					}
				} else {
					setLoops([]);
				}
			} catch (err) {
				console.error("Failed to load mindmap index:", err);
				setError("Could not load the list of control loops.");
			} finally {
				setLoading(false);
			}
		};

		if (documentId) {
			fetchIndex();
		}
	}, [documentId]);

	const getLoopUrl = (loopFile) => {
		// We construct the URL for the ControlSystemLoader to fetch the specific JSON
		// The backend route is: /documents/{id}/artifact/mindmap_{loop_name_extracted}
		// But wait, the backend expects `mindmap_{loop_name}` where {loop_name} matches the key.
		// The `file` in mappings is "LoopName.json".
		// The endpoint logic in backend:
		//   loop_name_requested = file_key.replace("mindmap_", "")
		//   path = .../mindmaps/{loop_name_requested}.json

		// So if file is "P-101.json", we need to send "mindmap_P-101" as file_key.
		// We strip ".json" from the filename.
		const loopName = loopFile.replace(".json", "");
		return `http://127.0.0.1:8000/documents/${documentId}/artifact/mindmap_${loopName}`;
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-slate-400">
				<div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin mb-4" />
				<p>Loading control loops...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-rose-500 bg-rose-50 rounded-xl border border-rose-100 p-8">
				<AlertCircle className="w-8 h-8 mb-2" />
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div
			className={`relative w-full bg-slate-100 overflow-hidden flex ${
				isFullWidth
					? "h-full rounded-none border-0"
					: "h-[80vh] rounded-xl border border-slate-200 shadow-sm"
			}`}
		>
			{/* Sidebar (Collapsible) */}
			<div
				className={`absolute top-0 left-0 bottom-0 z-20 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col
                    ${isMenuOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full overflow-hidden"}`}
			>
				<div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
					<h3 className="font-semibold text-slate-700 flex items-center gap-2">
						<Layers className="w-4 h-4 text-slate-500" />
						Control Loops
					</h3>
				</div>

				<div className="flex-1 overflow-y-auto p-2 space-y-1">
					{loops.length === 0 ? (
						<p className="text-xs text-slate-400 p-4 text-center">
							No loops found.
						</p>
					) : (
						loops.map((loop, idx) => (
							<button
								key={idx}
								onClick={() => setSelectedLoop(loop)}
								className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border
                                    ${
										selectedLoop?.name === loop.name
											? "bg-blue-50 text-blue-700 border-blue-100 shadow-sm"
											: "bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-100"
									}`}
							>
								<div className="truncate">{loop.name}</div>
							</button>
						))
					)}
				</div>
			</div>

			{/* Toggle Button */}
			<button
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				className={`absolute z-30 top-4 transition-all duration-300 p-1.5 bg-white border border-slate-200 shadow-md rounded-md text-slate-500 hover:text-slate-700
                    ${isMenuOpen ? "left-64 ml-[-12px]" : "left-4"}`}
			>
				{isMenuOpen ? (
					<ChevronLeft className="w-4 h-4" />
				) : (
					<ChevronRight className="w-4 h-4" />
				)}
			</button>

			{/* Main Canvas Area */}
			<div
				className={`flex-1 transition-all duration-300 ${isMenuOpen ? "ml-64" : "ml-0"}`}
			>
				{selectedLoop ? (
					<ControlSystemLoader
						// We use a unique key URL to force re-mount when loop calls change
						key={selectedLoop.file}
						dataSourceUrl={getLoopUrl(selectedLoop.file)}
					>
						{(data) => (
							<MindMap
								initialNodes={data.nodes}
								initialEdges={data.edges}
								title={selectedLoop.name}
								className="w-full h-full"
							/>
						)}
					</ControlSystemLoader>
				) : (
					<div className="flex items-center justify-center h-full text-slate-400">
						<p>
							Select a control loop from the menu to view its
							Mindmap.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MindMapView;
