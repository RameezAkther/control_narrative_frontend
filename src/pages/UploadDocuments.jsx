import { useEffect, useState, useRef } from "react";
import {
	getDocuments,
	uploadDocuments,
	deleteDocument,
	getDocumentStatus,
} from "../api/documents"; // Fixed import order
import Sidebar from "../components/Sidebar"; // Assuming Sidebar is in ../components
import UploadDropzone from "../components/documents/UploadDropzone";
import StagingArea from "../components/documents/StagingArea";
import DocumentList from "../components/documents/DocumentList";

export default function UploadDocument() {
	const [stagedFiles, setStagedFiles] = useState([]);
	const [documents, setDocuments] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const [progressMap, setProgressMap] = useState({});
	const [isUploading, setIsUploading] = useState(false);

	// Refs for polling management
	const activePolls = useRef(new Set());
	const deletedDocs = useRef(new Set());
	const DEFAULT_TOTAL_STAGES = 16;

	// --- Logic Helpers ---

	const prettyStatusText = (status) => {
		if (!status) return "Initializing...";
		const s = status.replace(/_/g, " ");
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	const isFinalStatus = (status) => {
		const s = status?.toLowerCase() || "";
		return (
			s.includes("completed") ||
			s.includes("ready") ||
			s.includes("failed") ||
			s.includes("error")
		);
	};

	// --- Effects ---

	useEffect(() => {
		fetchDocuments(page);
	}, [page]);

	const fetchDocuments = async (page) => {
		try {
			const res = await getDocuments(page);
			const docs = res.data.documents || [];
			setDocuments(docs);
			setTotalPages(res.data.total_pages || 1);

			// Start polling only for documents that are not in final status
			docs.forEach((doc) => {
				const knownStatus = progressMap[doc._id]?.status || doc.status;

				// Don't poll if already deleted or in final status
				if (
					!deletedDocs.current.has(doc._id) &&
					!isFinalStatus(knownStatus)
				) {
					pollStatus(doc._id);
				}
			});
		} catch (error) {
			console.error("Failed to fetch documents", error);
		}
	};

	const pollStatus = async (documentId) => {
		// Prevent double polling for same ID
		if (activePolls.current.has(documentId)) return;
		// Don't poll deleted documents
		if (deletedDocs.current.has(documentId)) return;

		activePolls.current.add(documentId);

		const check = async () => {
			// Check if document was deleted before attempting to fetch
			if (deletedDocs.current.has(documentId)) {
				activePolls.current.delete(documentId);
				return;
			}

			try {
				const res = await getDocumentStatus(documentId);

				const { status, stage, progress, total_stages } = res.data;
				const total = total_stages || DEFAULT_TOTAL_STAGES;
				const message = progress?.message || prettyStatusText(status);

				let percent = 0;
				if (stage && total) {
					percent = Math.round((stage / total) * 100);
				}

				setProgressMap((prev) => ({
					...prev,
					[documentId]: {
						status,
						stage,
						message,
						percent,
						total,
					},
				}));

				const isFinal = isFinalStatus(status);

				if (!isFinal) {
					// Continue polling every 5 seconds until final status is reached
					setTimeout(check, 5000);
				} else {
					// Stop polling once final status is reached
					activePolls.current.delete(documentId);
					// If completed, refresh the list to ensure metadata is synced
					if (status === "completed") fetchDocuments(page);
				}
			} catch (error) {
				console.error(`Error checking status for ${documentId}`, error);
				// On error, stop polling (don't retry indefinitely)
				activePolls.current.delete(documentId);
			}
		};

		check();
	};

	// --- Handlers ---

	const handleFileSelect = (e) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files).map((file) => ({
				id: Math.random().toString(36).substr(2, 9),
				file: file,
				strategy: "fast",
			}));
			setStagedFiles((prev) => [...prev, ...newFiles]);
		}
	};

	const removeStagedFile = (id) => {
		setStagedFiles((prev) => prev.filter((f) => f.id !== id));
	};

	const updateStagedStrategy = (id, strategy) => {
		setStagedFiles((prev) =>
			prev.map((f) => (f.id === id ? { ...f, strategy } : f)),
		);
	};

	const handleUploadAll = async () => {
		if (stagedFiles.length === 0) return;
		setIsUploading(true);

		const fastFiles = stagedFiles
			.filter((f) => f.strategy === "fast")
			.map((f) => f.file);
		const accurateFiles = stagedFiles
			.filter((f) => f.strategy === "accurate")
			.map((f) => f.file);
		const uploadPromises = [];

		try {
			if (fastFiles.length > 0) {
				const formData = new FormData();
				fastFiles.forEach((file) => formData.append("files", file));
				formData.append("parsing_strategy", "fast");
				uploadPromises.push(uploadDocuments(formData));
			}

			if (accurateFiles.length > 0) {
				const formData = new FormData();
				accurateFiles.forEach((file) => formData.append("files", file));
				formData.append("parsing_strategy", "accurate");
				uploadPromises.push(uploadDocuments(formData));
			}

			const responses = await Promise.all(uploadPromises);

			responses.forEach((res) => {
				if (res.data.documents) {
					res.data.documents.forEach((doc) =>
						pollStatus(doc.document_id),
					);
				}
			});

			setStagedFiles([]);
			fetchDocuments(1);
		} catch (error) {
			console.error("Upload failed", error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this document?")) return;

		// Mark as deleted before API call to prevent polling
		deletedDocs.current.add(id);
		activePolls.current.delete(id);

		try {
			await deleteDocument(id);
			fetchDocuments(page);
		} catch (error) {
			console.error("Delete failed", error);
			// Remove from deleted set if deletion failed
			deletedDocs.current.delete(id);
		}
	};

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />

			<div className="flex-1 p-8 overflow-y-auto">
				<div className="max-w-5xl mx-auto space-y-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Document Management
						</h1>
						<p className="text-gray-500 mt-1">
							Upload files, select parsing options, and track
							progress.
						</p>
					</div>

					<UploadDropzone onFileSelect={handleFileSelect} />

					<StagingArea
						stagedFiles={stagedFiles}
						onUpdateStrategy={updateStagedStrategy}
						onRemoveFile={removeStagedFile}
						onUploadAll={handleUploadAll}
						isUploading={isUploading}
					/>

					<DocumentList
						documents={documents}
						progressMap={progressMap}
						onDelete={handleDelete}
						page={page}
						totalPages={totalPages}
						setPage={setPage}
					/>
				</div>
			</div>
		</div>
	);
}
