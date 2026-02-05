import { useEffect, useState, useRef } from "react";
import {
	getDocuments,
	uploadDocuments,
	deleteDocument,
	getDocumentStatus,
} from "../api/documents";
import Sidebar from "../components/Sidebar";
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

	const activePolls = useRef(new Set());
	const deletedDocs = useRef(new Set());
	const DEFAULT_TOTAL_STAGES = 16;

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

	useEffect(() => {
		fetchDocuments(page);
	}, [page]);

	const fetchDocuments = async (page) => {
		try {
			const res = await getDocuments(page);
			const docs = res.data.documents || [];
			setDocuments(docs);
			setTotalPages(res.data.total_pages || 1);

			docs.forEach((doc) => {
				const knownStatus = progressMap[doc._id]?.status || doc.status;
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
		if (activePolls.current.has(documentId)) return;
		if (deletedDocs.current.has(documentId)) return;

		activePolls.current.add(documentId);

		const check = async () => {
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
					setTimeout(check, 5000);
				} else {
					activePolls.current.delete(documentId);
					if (status === "completed") fetchDocuments(page);
				}
			} catch (error) {
				console.error(`Error checking status for ${documentId}`, error);
				activePolls.current.delete(documentId);
			}
		};

		check();
	};

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
		deletedDocs.current.add(id);
		activePolls.current.delete(id);

		try {
			await deleteDocument(id);
			fetchDocuments(page);
		} catch (error) {
			console.error("Delete failed", error);
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
