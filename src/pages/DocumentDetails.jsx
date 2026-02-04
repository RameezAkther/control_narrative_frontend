import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDocumentArtifact, getDocumentStatus } from "../api/documents";
import Sidebar from "../components/Sidebar";
import SummaryView from "../components/SummaryView";
import LogicExtractedView from "../components/LogicExtractedView";
import LoopMapView from "../components/LoopMapView";
import ValidationReportView from "../components/ValidationReportView";
import PLCCodeView from "../components/PLCCodeView";
import {
	ArrowLeft,
	FileText,
	Code,
	Activity,
	ShieldCheck,
	Map,
	Terminal,
	Download,
	Copy,
	Check,
} from "lucide-react";
import MindMapView from "../components/mindmap/MindMapView";

const TABS = [
	{ id: "markdown", label: "Parsed Markdown", icon: FileText },
	{ id: "summary", label: "1. Summary", icon: Activity },
	{ id: "logic", label: "2. Logic Extracted", icon: Code },
	{ id: "loop_map", label: "3. Loop Map", icon: Map },
	{ id: "validation", label: "4. Validation", icon: ShieldCheck },
	{ id: "plc_code", label: "5. PLC Code", icon: Terminal },
	{ id: "mindmap", label: "6. Mind Map", icon: Map },
];

export default function DocumentDetails() {
	const { id } = useParams();
	const [activeTab, setActiveTab] = useState("summary"); // Default to summary for better UX?
	const [content, setContent] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [docMeta, setDocMeta] = useState({ filename: "Loading..." });
	const [copied, setCopied] = useState(false);

	// Fetch basic metadata ONCE when component mounts
	useEffect(() => {
		if (!id) return;

		getDocumentStatus(id)
			.then((res) => {
				if (res.data) setDocMeta(res.data);
			})
			.catch((err) =>
				console.error("Failed to fetch document metadata", err),
			);
	}, [id]); // Only refetch if the document ID changes

	// Fetch content when tab changes
	useEffect(() => {
		// Special case: MindMap handles its own fetching
		if (activeTab === "mindmap") return;

		const fetchContent = async () => {
			setLoading(true);
			setError(null);
			setContent(null);

			try {
				const res = await getDocumentArtifact(id, activeTab);
				setContent(res.data);
			} catch (err) {
				console.error(err);
				setError("Content not generated yet or unavailable.");
			} finally {
				setLoading(false);
			}
		};

		fetchContent();
	}, [id, activeTab]);

	// --- NEW EXPORT FUNCTION ---
	const handleExport = () => {
		if (!content) {
			alert("No content available to export.");
			return;
		}

		let exportData = content;
		let extension = "txt";
		let mimeType = "text/plain";

		// 1. Determine file format based on content type
		if (typeof content === "object") {
			exportData = JSON.stringify(content, null, 2);
			extension = "json";
			mimeType = "application/json";
		} else {
			// Handle string content types
			if (activeTab === "markdown") extension = "md";
			if (activeTab === "plc_code") extension = "st"; // .st for Structured Text
		}

		// 2. Create a Blob (a file-like object of immutable raw data)
		const blob = new Blob([exportData], { type: mimeType });

		// 3. Create a temporary URL for the Blob
		const url = URL.createObjectURL(blob);

		// 4. Create a hidden link, click it programmatically, then remove it
		const link = document.createElement("a");
		link.href = url;
		// Naming convention: filename_tabName.extension
		link.download = `${
			docMeta.filename || "document"
		}_${activeTab}.${extension}`;
		document.body.appendChild(link);
		link.click();

		// 5. Cleanup
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
	// ---------------------------

	const handleCopy = () => {
		if (!content) return;
		const textToCopy =
			typeof content === "object"
				? JSON.stringify(content, null, 2)
				: content;
		navigator.clipboard.writeText(textToCopy);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const renderContent = () => {
		// Handle MindMap separately as it has its own internal state/loading
		if (activeTab === "mindmap") {
			return <MindMapView documentId={id} isFullWidth={true} />;
		}

		if (loading) {
			return (
				<div className="h-96 flex flex-col items-center justify-center text-gray-400">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
					<p>Loading artifact...</p>
				</div>
			);
		}

		if (error) {
			return (
				<div className="h-96 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
					<p className="text-gray-500 font-medium">{error}</p>
					<p className="text-sm mt-2">
						The pipeline might still be processing this stage.
					</p>
				</div>
			);
		}

		if (!content) return null;

		// --- NEW LOGIC: Use SummaryView for the summary tab ---
		if (activeTab === "summary" && typeof content === "object") {
			return <SummaryView data={content} />;
		}
		// -----------------------------------------------------
		// --- NEW LOGIC: Use LogicExtractedView for logic tab ---
		if (activeTab === "logic" && typeof content === "object") {
			return <LogicExtractedView data={content} />; // <--- 2. Add this block
		}

		if (activeTab === "loop_map" && typeof content === "object") {
			return <LoopMapView data={content} />; // <--- 2. Add this block
		}

		if (activeTab === "validation" && typeof content === "object") {
			return <ValidationReportView data={content} />; // <--- 2. Add this block
		}

		if (
			activeTab === "plc_code" &&
			(typeof content === "string" || typeof content === "object")
		) {
			return <PLCCodeView data={content} />; // <--- 2. Add this block
		}

		// Default JSON Rendering for other object tabs (like Logic/Loop Map if they return JSON)
		if (typeof content === "object") {
			return (
				<div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner">
					<div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
						<span className="text-xs text-gray-400 font-mono">
							JSON Output
						</span>
						<button
							onClick={handleCopy}
							className="text-gray-400 hover:text-white transition"
						>
							{copied ? (
								<Check size={14} className="text-green-400" />
							) : (
								<Copy size={14} />
							)}
						</button>
					</div>
					<pre className="p-4 text-sm text-green-400 font-mono overflow-auto max-h-[70vh]">
						{JSON.stringify(content, null, 2)}
					</pre>
				</div>
			);
		}

		// Markdown / PLC Code (String) Rendering
		return (
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
					<span className="text-xs text-gray-500 font-mono uppercase">
						{activeTab} View
					</span>
					<button
						onClick={handleCopy}
						className="text-gray-500 hover:text-gray-900 transition"
					>
						{copied ? (
							<Check size={14} className="text-green-600" />
						) : (
							<Copy size={14} />
						)}
					</button>
				</div>
				<div className="p-6 overflow-auto max-h-[70vh]">
					<pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
						{content}
					</pre>
				</div>
			</div>
		);
	};

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 flex flex-col h-screen overflow-hidden">
				{/* Header */}
				<div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
					<div className="flex items-center gap-4">
						<Link
							to="/documents"
							className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
						>
							<ArrowLeft size={20} />
						</Link>
						<div>
							<h1
								className="text-xl font-bold text-gray-900 truncate max-w-md"
								title={docMeta.filename}
							>
								{docMeta.filename || "Document Details"}
							</h1>
							<p className="text-xs text-gray-500 font-mono uppercase tracking-wide mt-0.5">
								ID: {id}
							</p>
						</div>
					</div>

					<div className="flex gap-2">
						{/* UPDATED BUTTON WITH ONCLICK HANDLER */}
						<button
							onClick={handleExport}
							disabled={!content || loading}
							className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition
                ${
					!content || loading
						? "text-gray-400 border-gray-100 cursor-not-allowed bg-gray-50"
						: "text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
				}`}
						>
							<Download size={16} />
							{(() => {
								if (loading || !content) return "Export";
								const exportLabels = {
									markdown: "Markdown",
									summary: "Summary",
									logic: "Logic",
									loop_map: "Loop Map",
									validation: "Validation",
									plc_code: "PLC Code",
									mindmap: "Mind Map",
								};
								return `Export ${exportLabels[activeTab] || "Data"}`;
							})()}
						</button>
					</div>
				</div>

				{/* Navigation Bar */}
				<div className="bg-white border-b border-gray-200 px-8">
					<div className="flex gap-6 overflow-x-auto no-scrollbar">
						{TABS.map((tab) => {
							const isActive = activeTab === tab.id;
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                    ${
						isActive
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
					}`}
								>
									<Icon size={16} />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Content Area */}
				<div
					className={`flex-1 overflow-y-auto bg-gray-50 ${
						activeTab === "mindmap" ? "p-0" : "p-8"
					}`}
				>
					<div
						className={`${
							activeTab === "mindmap"
								? "w-full h-full"
								: "max-w-6xl mx-auto"
						}`}
					>
						{renderContent()}
					</div>
				</div>
			</div>
		</div>
	);
}
